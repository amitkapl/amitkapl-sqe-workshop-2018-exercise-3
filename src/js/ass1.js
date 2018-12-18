import * as escodegen from 'escodegen';
let typeToHandlerMapping = {
    'FunctionDeclaration': parseFunctionDeclaration,
    'BlockStatement': parseJson,
    'VariableDeclaration': parseVariableDeclaration,
    'ExpressionStatement': parseExpressionStatement,
    'WhileStatement': parseWhileStatement,
    'IfStatement': (json, lst) => parseIfStatement(json, lst, ''),
    'ReturnStatement': parseReturnStatement,
    'ForStatement': parseForStatement
};

let expressionTypeToHandlerMapping = {
    'Identifier': (json) => json.name,
    'BinaryExpression': (json) => parseExpressionGetValue(json.left).concat(' ', json.operator, ' ', parseExpressionGetValue(json.right)),
    'Literal': (json) => json.value.toString(),
    'MemberExpression': (json) => parseExpressionGetValue(json.object).concat('[', parseExpressionGetValue(json.property), ']'),
    'UnaryExpression': (json) => json.operator.concat(parseExpressionGetValue(json.argument)),
    'UpdateExpression': (json) => parseExpressionGetValue(json.argument).concat(json.operator),
    'AssignmentExpression': (json) => json.left.name.concat(json.operator, parseExpressionGetValue(json.right))
};

function parseFunctionDeclaration(json, lst) {
    lst.push({line: json.loc.start.line, type: 'function declaration', name: json.id.name});
    json.params.forEach((v) => lst.push({line: v.loc.start.line, type: 'variable declaration', name: v.name}));
    return parseOneOfTheList(json.body, lst);
}

function parseVariableDeclaration(json, lst) {
    json.declarations.forEach((v) => lst.push({line: v.loc.start.line, type: 'variable declaration', name: v.id.name, value: parseExpressionGetValue(v.init)}));
    return lst;
}

function parseExpressionGetValue(json) {
    if(json === null) return 'null';
    let exp = expressionTypeToHandlerMapping[json.type];
    return /*exp ? */exp.call(undefined, json)/* : 'ERROR parseExpressionGetValue'*/;
}

function parseExpressionStatement(json, lst) {
    var exp = json.expression;
    switch (exp.type){
    case 'AssignmentExpression':
        var val = parseExpressionGetValue(exp.right);
        var name = parseExpressionGetValue(exp.left);
        lst.push({line: json.loc.start.line, type: 'assignment expression', name: name, value: val});
        break;
    }
    return lst;
}

function parseWhileStatement(json, lst) {
    var c = parseExpressionGetValue(json.test);
    lst.push({line: json.loc.start.line, type: 'while statement', condition: c});
    return parseOneOfTheList(json.body, lst);
}

function parseElseStatement(json, lst) {
    if(json.type === 'IfStatement')
        return parseIfStatement(json, lst, 'else ');
    lst = parseOneOfTheList(json, lst);
    return lst;
}

function parseIfStatement(json, lst, additionToType) {
    var c = escodegen.generate(json.test);
    lst.push({line: json.loc.start.line, type: additionToType.concat('if statement'), condition: c});
    lst = parseOneOfTheList(json.consequent, lst);
    if(json.alternate != null)
        lst = parseElseStatement(json.alternate, lst);
    return lst;
}

function parseReturnStatement(json, lst) {
    lst.push({line: json.loc.start.line, type: 'return statement', value: parseExpressionGetValue(json.argument)});
    return lst;
}

function parseVariableDeclarationInFor(json) {
    var toReturn = '';
    json.declarations.forEach((v) => toReturn = toReturn.concat(v.id.name, '=', parseExpressionGetValue(v.init), ';'));
    return toReturn;
}

function parseForInitStatement(json){
    switch (json.type){
    case 'AssignmentExpression':
        return parseExpressionGetValue(json).concat(';');
    case 'VariableDeclaration':
        return parseVariableDeclarationInFor(json);
    }
}

function parseForStatement(json, lst) {
    var init = parseForInitStatement(json.init);
    var test = parseExpressionGetValue(json.test);
    var update = parseExpressionGetValue(json.update);
    lst.push({line: json.loc.start.line, type: 'for statement', condition: init.concat(test, ';', update)});
    lst = parseOneOfTheList(json.body, lst);
    return lst;
}

function parseOneOfTheList(json, lst) {
    let f = typeToHandlerMapping[json.type];
    return /*f ? */f.call(undefined, json, lst)/* : lst*/;
}

function parseJson(json, lst) {
    json = json.body;
    var tmpLst = [];
    json.forEach(function(v) { tmpLst = parseOneOfTheList(v, lst); lst.concat(tmpLst);});
    return lst;
}

export {parseJson};
