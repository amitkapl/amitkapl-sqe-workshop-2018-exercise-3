import assert from 'assert';
import {makeAGraph} from '../src/js/code-analyzer';

function check(code,input,expectedResult){
    let actualResult = makeAGraph(code, input);
    assert.equal(actualResult, expectedResult);
}



describe('The javascript parser', () => {
    it('Empty function without arguments', () => {
        check('function test1(){}','','digraph cfg { forcelabels=true }');
    });

    it('Empty function with one argument', () => {
        check('function test2(x){}','','digraph cfg { forcelabels=true }');
    });

    it('Empty function with one argument and input', () => {
        check('function test3(x){}','{"x":"1"}','digraph cfg { forcelabels=true }');
    });

    it('function one argument', () => {
        check(
            'function test4(x){\n' +
            '    let y = 1;\n' +
            '    return y;' +
            '}',
            '',
            'digraph cfg { forcelabels=true n0[label="-1-\nlet y = 1;",  shape=rectangle,]\nn1[label="-2-\nreturn y;",  shape=rectangle,]\nn0 -> n1 []\n}');
    });

    it('function with one argument and input', () => {
        check(
            'function test4(x){\n' +
            '    let y = 1;\n' +
            '    return y;' +
            '}',
            '{"x":"1"}',
            'digraph cfg { forcelabels=true n0[label="-1-\nlet y = 1;",  shape=rectangle, style = filled, fillcolor = green]\nn1[label="-2-\nreturn y;",  shape=rectang' +
            'le, style = filled, fillcolor = green]\nn0 -> n1 []\n}'
        );
    });

    it('First example without input', () => {
        check(
            'function foo(x, y, z){\n    let a = x + 1;\n    let b = a + y;\n    let c = 0;\n    \n    if (b < z) {\n        c = c + 5;\n    } else if (b < z * 2) {\n        c = c + x + 5;\n    } else {\n        c = c + z + 5;\n    }\n    \n    return c;\n}',
            '',
            'digraph cfg { forcelabels=true n0[label="-1-\nlet a = x + 1;",  shape=rectangle,]\nn1[label="-2-\nlet b = a + y;",  shape=rectangle,]\nn2[label="-3-\nlet c = 0;",  shape=rectangle,]\nn3[label="-4-\nb < z",  shape=diamond,]\nn4[label="-5-\nc = c + 5",  shape=rectangle,]\nn5[label="-6-\nreturn c;",  shape=rectangle,]\nn6[label="-7-\nb < z * 2",  shape=diamond,]\nn7[label="-8-\nc = c + x + 5",  shape=rectangle,]\nn8[label="-9-\nc = c + z + 5",  shape=rectangle,]\nn0 -> n1 []\nn1 -> n2 []\nn2 -> n3 []\nn3 -> n4 [label="T"]\nn3 -> n6 [label="F"]\nn4 -> n5 []\nn6 -> n7 [label="T"]\nn6 -> n8 [label="F"]\nn7 -> n5 []\nn8 -> n5 []\n}'
        );
    });

    it('First example with input', () => {
        check(
            'function foo(x, y, z){\n    let a = x + 1;\n    let b = a + y;\n    let c = 0;\n    \n    if (b < z) {\n        c = c + 5;\n    } else if (b < z * 2) {\n        c = c + x + 5;\n    } else {\n        c = c + z + 5;\n    }\n    \n    return c;\n}',
            '{' +
            '"x":"1",' +
            '"y":"2",' +
            '"z":"3"' +
            '}',
            'digraph cfg { forcelabels=true n0[label="-1-\nlet a = x + 1;",  shape=rectangle, style = filled, fillcolor = green]\nn1[label="-2-\nlet b = a + y;",  shape=rectangle, style = filled, fillcolor = green]\nn2[label="-3-\nlet c = 0;",  shape=rectangle, style = filled, fillcolor = green]\nn3[label="-4-\nb < z",  shape=diamond, style = filled, fillcolor = green]\nn4[label="-5-\nc = c + 5",  shape=rectangle,]\nn5[label="-6-\nreturn c;",  shape=rectangle, style = filled, fillcolor = green]\nn6[label="-7-\nb < z * 2",  shape=diamond, style = filled, fillcolor = green]\nn7[label="-8-\nc = c + x + 5",  shape=rectangle, style = filled, fillcolor = green]\nn8[label="-9-\nc = c + z + 5",  shape=rectangle,]\nn0 -> n1 []\nn1 -> n2 []\nn2 -> n3 []\nn3 -> n4 [label="T"]\nn3 -> n6 [label="F"]\nn4 -> n5 []\nn6 -> n7 [label="T"]\nn6 -> n8 [label="F"]\nn7 -> n5 []\nn8 -> n5 []\n}'
        );
    });

    it('Second example without input', () => {
        check(
            'function foo(x, y, z){\n   let a = x + 1;\n   let b = a + y;\n   let c = 0;\n   \n   while (a < z) {\n       c = a + b;\n       z = c * 2;\n       a++;\n   }\n   \n   return z;\n}',
            '',
            'digraph cfg { forcelabels=true n0[label="-1-\nlet a = x + 1;",  shape=rectangle,]\nn1[label="-2-\nlet b = a + y;",  shape=rectangle,]\nn2[label="-3-\nlet c = 0;",  shape=rectangle,]\nn3[label="-4-\na < z",  shape=diamond,]\nn4[label="-5-\nc = a + b",  shape=rectangle,]\nn5[label="-6-\nz = c * 2",  shape=rectangle,]\nn6[label="-7-\na++",  shape=rectangle,]\nn7[label="-8-\nreturn z;",  shape=rectangle,]\nn0 -> n1 []\nn1 -> n2 []\nn2 -> n3 []\nn3 -> n4 [label="T"]\nn3 -> n7 [label="F"]\nn4 -> n5 []\nn5 -> n6 []\nn6 -> n3 []\n}'
        );
    });

    it('Empty function with two argument', () => {
        check('function test2(x,y){}','','digraph cfg { forcelabels=true }');
    });

    it('Empty function with two argument and input', () => {
        check('function test2(x,y){}','{"x":"1","y":"1"}','digraph cfg { forcelabels=true }');
    });

    it('UpdateExpression ++', () => {
        check('function test2(x){x++;}','{"x":"1"}','digraph cfg { forcelabels=true n0[label="-1-\nx++",  shape=rectangle, style = filled, fillcolor = green]\nn0 -> n-1 []\n}');
    });

    it('UpdateExpression --', () => {
        check('function test2(x){x--;}','{"x":"1"}','digraph cfg { forcelabels=true n0[label="-1-\nx--",  shape=rectangle, style = filled, fillcolor = green]\nn0 -> n-1 []\n}');
    });

});
