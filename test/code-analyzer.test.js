/* eslint-disable max-lines-per-function,indent */
import assert from 'assert';
import {parseCode, parseJson} from '../src/js/code-analyzer';

function check(example,expectedInJson){
    assert.equal(JSON.stringify(parseJson(parseCode(example), [])), expectedInJson);
}
// eslint-disable-next-line max-lines-per-function

describe('The javascript parser', () => {
    it('is parsing an empty function correctly', () => {
        assert.equal(JSON.stringify(parseCode('')), '{"type":"Program","body":[],"sourceType":"script","loc":{"start":{"line":0,"column":0},"end":{"line":0,"column":0}}}');
    });

    it('is parsing a simple variable declaration correctly', () => {
        assert.equal(JSON.stringify(parseCode('let a = 1;')), '{"type":"Program","body":[{"type":"VariableDeclaration","declarations":[{"type":"VariableDeclarator","id":{"type":"Identifier","name":"a","loc":{"start":{"line":1,"column":4},"end":{"line":1,"column":5}}},"init":{"type":"Literal","value":1,"raw":"1","loc":{"start":{"line":1,"column":8},"end":{"line":1,"column":9}}},"loc":{"start":{"line":1,"column":4},"end":{"line":1,"column":9}}}],"kind":"let","loc":{"start":{"line":1,"column":0},"end":{"line":1,"column":10}}}],"sourceType":"script","loc":{"start":{"line":1,"column":0},"end":{"line":1,"column":10}}}');
    });

    it('is parsing an empty function correctly to list', () => {
        check('', '[]');
    });

    it('is parsing a simple variable declaration correctly to list', () => {
        check('let a = 1;',
            '[' +
                '{"line":1,"type":"variable declaration","name":"a","value":"1"}' +
            ']');
    });

    it('is parsing a simple if statement correctly to list', () => {
        check('if (1 < 2)' +
            '   "nothing";',
            '[' +
                '{"line":1,"type":"if statement","condition":"1 < 2"}' +
            ']');
    });

    it('is parsing a simple else if statement correctly to list', () => {
        check('if (1 < 2)\n' +
            '   "nothing";\n' +
            'else if (2 < 3)\n' +
            '   "nothing";',
            '[' +
                '{"line":1,"type":"if statement","condition":"1 < 2"},' +
                '{"line":3,"type":"else if statement","condition":"2 < 3"}' +
            ']');
    });

    it('is parsing a simple block statement correctly to list', () => {
        check('' +
            '{\n' +
            '       let x = 1;\n' +
            '       let y = 2;\n' +
            '       let z = 3;\n' +
            '}',
            '[' +
                '{"line":2,"type":"variable declaration","name":"x","value":"1"},' +
                '{"line":3,"type":"variable declaration","name":"y","value":"2"},' +
                '{"line":4,"type":"variable declaration","name":"z","value":"3"}' +
            ']');
    });

    it('is parsing a simple while statement correctly to list', () => {
        check('while (1 < 2)\n' +
            '{\n' +
            '       let x = 1;\n' +
            '       let y = 2;\n' +
            '       let z = 3;\n' +
            '}',
            '[' +
                '{"line":1,"type":"while statement","condition":"1 < 2"},' +
                '{"line":3,"type":"variable declaration","name":"x","value":"1"},' +
                '{"line":4,"type":"variable declaration","name":"y","value":"2"},' +
                '{"line":5,"type":"variable declaration","name":"z","value":"3"}' +
            ']');
    });

    it('is parsing a simple for statement correctly to list', () => {
        check('let i = 0;\n' +
            'for (i = 0; i < 3; i++)\n' +
            '{\n' +
            '       let x = 1;\n' +
            '       let y = 2;\n' +
            '       let z = 3;\n' +
            '}',
            '[' +
                '{"line":1,"type":"variable declaration","name":"i","value":"0"},' +
                '{"line":2,"type":"for statement","condition":"i=0;i < 3;i++"},' +
                '{"line":4,"type":"variable declaration","name":"x","value":"1"},' +
                '{"line":5,"type":"variable declaration","name":"y","value":"2"},' +
                '{"line":6,"type":"variable declaration","name":"z","value":"3"}' +
            ']');
    });

    it('is parsing a simple function declaration correctly to list', () => {
        check('function foo(){}',
            '[' +
                '{"line":1,"type":"function declaration","name":"foo"}' +
            ']');
    });

    it('is parsing a complex function declaration correctly to list', () => {
        check('function foo(x,y,z){}',
            '[' +
                '{"line":1,"type":"function declaration","name":"foo"},' +
                '{"line":1,"type":"variable declaration","name":"x"},' +
                '{"line":1,"type":"variable declaration","name":"y"},' +
                '{"line":1,"type":"variable declaration","name":"z"}' +
            ']');
    });

    it('is parsing a simple return statement correctly to list', () => {
        check('function foo()\n' +
            '{\n' +
            'return 1;\n' +
            '}',
            '[' +
                '{"line":1,"type":"function declaration","name":"foo"},' +
                '{"line":3,"type":"return statement","value":"1"}' +
            ']');
    });

    it('is parsing a avirams example to list', () => {
        check('function binarySearch(X, V, n){\n' +
            '    let low, high, mid;\n' +
            '    low = 0;\n' +
            '    high = n - 1;\n' +
            '    while (low <= high) {\n' +
            '        mid = (low + high)/2;\n' +
            '        if (X < V[mid])\n' +
            '            high = mid - 1;\n' +
            '        else if (X > V[mid])\n' +
            '            low = mid + 1;\n' +
            '        else\n' +
            '            return mid;\n' +
            '    }\n' +
            '    return -1;\n' +
            '}',
            '[' +
                '{"line":1,"type":"function declaration","name":"binarySearch"},' +
                '{"line":1,"type":"variable declaration","name":"X"},' +
                '{"line":1,"type":"variable declaration","name":"V"},' +
                '{"line":1,"type":"variable declaration","name":"n"},' +
                '{"line":2,"type":"variable declaration","name":"low","value":"null"},' +
                '{"line":2,"type":"variable declaration","name":"high","value":"null"},' +
                '{"line":2,"type":"variable declaration","name":"mid","value":"null"},' +
                '{"line":3,"type":"assignment expression","name":"low","value":"0"},' +
                '{"line":4,"type":"assignment expression","name":"high","value":"n - 1"},' +
                '{"line":5,"type":"while statement","condition":"low <= high"},' +
                '{"line":6,"type":"assignment expression","name":"mid","value":"low + high / 2"},' +
                '{"line":7,"type":"if statement","condition":"X < V[mid]"},' +
                '{"line":8,"type":"assignment expression","name":"high","value":"mid - 1"},' +
                '{"line":9,"type":"else if statement","condition":"X > V[mid]"},' +
                '{"line":10,"type":"assignment expression","name":"low","value":"mid + 1"},' +
                '{"line":12,"type":"return statement","value":"mid"},' +
                '{"line":14,"type":"return statement","value":"-1"}' +
            ']');
    });

    it('is parsing a Tirguls example to list', () => {
        check('function Sort(arr){\n' +
            '   for(let i =0;i<arr.length - 1 ; i++){\n' +
            '      for(let j =0;j<arr.length - (1+1) ; j++){\n' +
            '         if (arr[j]>arr[j+1]){\n' +
            '             let temp = arr[j];\n' +
            '             arr[j]=arr[j+1];\n' +
            '             arr[j+1]=temp;\n' +
            '          }\n' +
            '       }\n' +
            '   }\n' +
            '   return arr;\n' +
            '}',
            '[' +
            '{"line":1,"type":"function declaration","name":"Sort"},' +
            '{"line":1,"type":"variable declaration","name":"arr"},' +
            '{"line":2,"type":"for statement","condition":"i=0;i < arr[length] - 1;i++"},' +
            '{"line":3,"type":"for statement","condition":"j=0;j < arr[length] - 1 + 1;j++"},' +
            '{"line":4,"type":"if statement","condition":"arr[j] > arr[j + 1]"},' +
            '{"line":5,"type":"variable declaration","name":"temp","value":"arr[j]"},' +
            '{"line":6,"type":"assignment expression","name":"arr[j]","value":"arr[j + 1]"},' +
            '{"line":7,"type":"assignment expression","name":"arr[j + 1]","value":"temp"},' +
            '{"line":11,"type":"return statement","value":"arr"}' +
            ']');
    });
});
