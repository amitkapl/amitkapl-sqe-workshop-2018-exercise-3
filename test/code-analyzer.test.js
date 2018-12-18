/* eslint-disable max-lines-per-function,indent */
import assert from 'assert';
import {parseCode, substitute, paintCode} from '../src/js/code-analyzer';

function check(code,input,expectedResult){
    let parsedCode = parseCode(code);
    let substituteCode = substitute(parsedCode, [], false)[0];
    let actualResult = paintCode(substituteCode, input);
    assert.equal(actualResult, expectedResult);
}
// eslint-disable-next-line max-lines-per-function

describe('The javascript parser', () => {
    it('is substituting an empty function correctly', () => {
        check('','', '');
    });

    it('is substituting a simple variable declaration correctly', () => {
        check(
            'let a = 1;',
            '',
            'let a = 1;<br>\n'
            );
    });

    it('is substituting first example correctly', () => {
        check(
            'function foo(x, y, z){\n' +
            'let a = x + 1;\n' +
            'let b = a + y;\n' +
            'let c = 0;\n' +
            '\n' +
            'if (b < z) {\n' +
            'c = c + 5;\n' +
            'return x + y + z + c;\n' +
            '} else if (b < z * 2) {\n' +
            'c = c + x + 5;\n' +
            'return x + y + z + c;\n' +
            '} else {\n' +
            'c = c + z + 5;\n' +
            'return x + y + z + c;\n' +
            '}\n' +
            '}\n',
            '{"x":"1","y":"2","z":"3"}',
            'function foo(x, y, z) {<br>\n' +
            '<mark class="red">    if (1 + 1 + 2 < 3) {</mark><br>\n' +
            '        return 1 + 2 + 3 + (0 + 5);<br>\n' +
            '<mark class="green">    } else if (1 + 1 + 2 < 3 * 2) {</mark><br>\n' +
            '        return 1 + 2 + 3 + (0 + 1 + 5);<br>\n' +
            '    } else {<br>\n' +
            '        return 1 + 2 + 3 + (0 + 3 + 5);<br>\n' +
            '    }<br>\n' +
            '}<br>\n'
        );
    });

    it('is substituting second example correctly', () => {
        check(
            'function foo(x, y, z){\n' +
            '    let a = x + 1;\n' +
            '    let b = a + y;\n' +
            '    let c = 0;\n' +
            '    \n' +
            '    while (a < z) {\n' +
            '        c = a + b;\n' +
            '        z = c * 2;\n' +
            '    }\n' +
            '    \n' +
            '    return z;\n' +
            '}\n',
            '',
            'function foo(x, y, z) {<br>\n' +
            '    while (x + 1 < z) {<br>\n' +
            '        z = (x + 1 + (x + 1 + y)) * 2;<br>\n' +
            '    }<br>\n' +
            '    return z;<br>\n' +
            '}<br>\n'
        );
    });

    it('is substituting global correctly', () => {
        check(
            'let m = 2;' +
            'function f(x){' +
            '   x = m + x;' +
            '   return 3;' +
            '}',
            '{"x":"3"}',
            'let m = 2;<br>\n' +
            'function f(x) {<br>\n' +
            '    x = 2 + 3;<br>\n' +
            '    return 3;<br>\n' +
            '}<br>\n'
        );
    });

    it('is substituting same global and param correctly', () => {
        check(
            'let m = 2;' +
            'function f(m){' +
            '   m = m + 2;' +
            '   return m;' +
            '}',
            '',
            'let m = 2;<br>\n' +
            'function f(m) {<br>\n' +
            '    m = m + 2;<br>\n' +
            '    return m + 2;<br>\n' +
            '}<br>\n'
        );
    });

    it('is substituting same global and use of it in function correctly', () => {
        check(
            'let m = 2;' +
            'function f(){' +
            '   m = m + 2;' +
            '   return m + 2;' +
            '}',
            '',
            'let m = 2;<br>\n' +
            'function f() {<br>\n' +
            '    m = 2 + 2;<br>\n' +
            '    return 2 + 2 + 2;<br>\n' +
            '}<br>\n'
        );
    });

    it('is substituting a simple variable declaration and assignment expression correctly', () => {
        check(
            'let a = 1;' +
            'a = 2;',
            '',
            'let a = 1;<br>\n' +
            'a = 2;<br>\n'
        );
    });

    it('is substituting another simple variable declaration correctly', () => {
        check(
            'let b = 2;' +
            'a = b + 1;',
            '',
            'let b = 2;<br>\n' +
            'a = 2 + 1;<br>\n'
        );
    });

    it('is substituting a simple if statement correctly', () => {
        check(
            'if (1 < 2){' +
            '   let b = 2;' +
            '}',
            '',
            '<mark class="green">if (1 < 2) {</mark><br>\n' +
            '    let b = 2;<br>\n' +
            '}<br>\n'
        );
    });

    it('is substituting another simple if statement correctly', () => {
        check(
            'if (2 < 1){' +
            '   let b = 2;' +
            '}',
            '',
            '<mark class="red">if (2 < 1) {</mark><br>\n' +
            '    let b = 2;<br>\n' +
            '}<br>\n'
        );
    });
});
