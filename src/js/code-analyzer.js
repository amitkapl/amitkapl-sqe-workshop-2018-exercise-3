import * as escodegen from 'escodegen';
import * as esgraph from 'esgraph';
import * as esprima from 'esprima';

const parseCode = (codeToParse) => {
    return esprima.parseScript(codeToParse, {range: true});
};

const typeToHandlerMapping = {
    // 'BlockStatement': (json, env) => json.body.forEach((stmt) => evalCodeAndChangeEnv(stmt, env)),
    'ExpressionStatement': (json, env) => evalCodeAndChangeEnv(json.expression, env),
    'Literal': (json) => json.value,
    'Identifier': getValueFromEnv,
    'BinaryExpression': (json, env) => eval(evalCodeAndChangeEnv(json.left, env) + json.operator + evalCodeAndChangeEnv(json.right, env)),
    'AssignmentExpression': (json, env) => editEnv(revertParseCode(json.left), evalCodeAndChangeEnv(json.right, env), env),
    'VariableDeclaration': varDecl,
    // 'LogicalExpression': (json, env) => eval(evalCodeAndChangeEnv(json.left, env) + json.operator + evalCodeAndChangeEnv(json.right, env)),
    'MemberExpression': getValueFromEnv,
    'UpdateExpression': (json, env) => {
        let left  = revertParseCode(json.argument);
        let right = json.argument.name;
        if (json.operator === '++')
            right += '+1';
        else
            right += '-1';
        return editEnv(left,evalCodeAndChangeEnv(parseCode(right).body[0].expression , env), env);
    }
};


function getIndexInEnv(variable, env) {
    for (let i = 0; i < env.length; i++){
        if(env[i].variable === variable)
            return i;
    }
    return -1;
}

function getValueFromEnv(json, env) {
    let variable = revertParseCode(json);
    let index = getIndexInEnv(variable,env);
    // if(index === -1)
    //     return variable;
    return env[index].value;
}

function editEnv(variable, value, env) {
    let result = getIndexInEnv(variable, env);
    if (result === -1)
        env.push({variable:variable, value:value});
    else
        env[result].value = value;
    return env;
}

function varDecl(json, env) {
    json.declarations.forEach((declaration) => {
        env = editEnv(revertParseCode(declaration.id), evalCodeAndChangeEnv(declaration.init, env), env);
    });
    return env;
}

function dotGraph(graph) {
    let toPrint = 'digraph cfg { forcelabels=true ';
    toPrint = addNodes(toPrint, graph);
    toPrint = addEdges(toPrint, graph);
    toPrint += '}';
    return toPrint;
}

function addNodes(toPrint, graph) {
    for (const [i, specNode] of graph.entries()) {
        toPrint += 'n' + i + '[label="-' + (i + 1) + '-\n' + specNode.label + '", ';
        if (specNode.true || specNode.false)
            toPrint += ' shape=diamond,';
        else
            toPrint += ' shape=rectangle,';

        if (specNode.toPaint)
            toPrint += ' style = filled, fillcolor = green';
        toPrint += ']\n';
    }
    return toPrint;
}

function typeAdd(toPrint, type, graph, specNode, i) {
    const next = specNode[type];
    if (next) {
        toPrint += 'n' + i + ' -> n' + graph.indexOf(next) + ' [';
        if (type === 'true')
            toPrint += 'label="T"';
        else if (type === 'false')
            toPrint += 'label="F"';
        toPrint += ']\n';
    }
    return toPrint;
}

function addEdges(toPrint, graph) {
    for (const [i, specNode] of graph.entries()) {
        toPrint = typeAdd(toPrint,'normal', graph, specNode, i);
        toPrint = typeAdd(toPrint,'true', graph, specNode, i);
        toPrint = typeAdd(toPrint,'false', graph, specNode, i);
    }
    return toPrint;
}

function RemoveUnnecessaryNodesAndEdges(graph) {
    let newGraph = graph.slice(1, graph.length - 1); // Delete first and last nodes
    let newFirstNode = newGraph[0];
    if(newFirstNode !== undefined && newFirstNode.prev !== undefined)
        newFirstNode.prev = []; //Fix the new first node
    newGraph.forEach(specNode => {
        if(specNode.astNode.type === 'ReturnStatement') {
            specNode.next = [];
            delete specNode.normal;
        }
    });
    return newGraph;
}

function editLabels(graph) {
    graph.forEach((node) => {
        node.label = revertParseCode(node.astNode);
    });
    return graph;
}

function makeGraph(parsedFunction) {
    let graph = esgraph(parsedFunction.body[0].body)[2];
    graph = RemoveUnnecessaryNodesAndEdges(graph);
    graph = editLabels(graph);
    return graph;
}

function nextPaintSpecificNode(specNode, env) {
    let nextNode = specNode.normal;
    let ans = evalCodeAndChangeEnv(parseCode(specNode.label).body[0], env);
    if (ans === true)
        nextNode = specNode.true;
    else if (ans === false)
        nextNode = specNode.false;
    paintSpecificNode(nextNode, env);
}

function evalCodeAndChangeEnv(parsedCode, env) {
    return typeToHandlerMapping[parsedCode.type](parsedCode,env);
}

function paintSpecificNode(specNode, env) {
    specNode.toPaint = true;
    let cond = specNode.normal || (specNode.true && specNode.false);
    cond ? nextPaintSpecificNode(specNode, env) : undefined;
}

function paintGraph(graph, env) {
    let firstNode = graph[0];
    if(firstNode !== undefined)
        paintSpecificNode(firstNode, env);
    return graph;
}

function makeInitEnvironment(input) {
    let jsonInput = JSON.parse(input);
    return Object.keys(jsonInput).map(function (k) {
        return {variable: k, value: jsonInput[k]};
    });
}

function makeAGraph(func, input) {
    let parsedFunction = parseCode(func);
    let graph = makeGraph(parsedFunction);
    if(input !== '')
        graph = paintGraph(graph, makeInitEnvironment(input));
    return dotGraph(graph);
}

const revertParseCode = (jsonToCode) => {
    return escodegen.generate(jsonToCode);
};

export {makeAGraph};