import * as esprima from 'esprima';
import * as escodegen from 'escodegen';
import * as Assignment1 from './ass1';
// var safeEval = require('safe-eval');
const parseCode = (codeToParse) => {
    return esprima.parseScript(codeToParse);
};

let typeToHandlerMapping = {
    'FunctionDeclaration': substituteFunctionDeclaration,
    'BlockStatement': substitute,
    'VariableDeclaration': substituteVariableDeclaration,
    'ExpressionStatement': substituteExpressionStatement,
    'WhileStatement': substituteWhileStatement,
    'IfStatement': substituteIfStatement,
    'ReturnStatement': substituteReturnStatement,
    'Identifier': substituteCheckAndChange,
    'BinaryExpression': substituteBinaryExpression,
    'Literal': (json,env) => {return [json,env];},
    'MemberExpression': substituteCheckAndChange,
    // 'UnaryExpression': substituteUnaryExpression,
    // 'UpdateExpression ': substituteUpdateExpression,
    'AssignmentExpression': substituteAssignmentExpression
};

function extendEnv(env, left, right){
    let found = false;
    let isLocalChange = false;
    let variable = escodegen.generate(left);
    let value = escodegen.generate(right);

    for (let i=0; i<env.length; i++) {
        if (env[i].variable === variable) {
            env[i].value = value;
            found = true;
            isLocalChange = env[i].isLocal;
            break;
        }
    }
    if(!found)
        env = env.concat({isParam: true, variable: variable, value: value});
    return [isLocalChange, env];
}

function substituteCheckAndChange(json, env, isInFunction) {
    let variable = escodegen.generate(json);
    for(let i=0; i<env.length; i++){
        if(env[i].variable === variable && isInFunction === isInFunction)//just for remove unused parameter error
            return [esprima.parse(env[i].value).body[0].expression, env];
    }
    return [json,env];
}


function substituteBinaryExpression(json, env, isInFunction) {
    json.left = typeHandle(json.left,env, isInFunction)[0];
    json.right = typeHandle(json.right,env, isInFunction)[0];
    return [json, env];
}

// function substituteUnaryExpression(json, env, isInFunction) {
//     json.argument = typeHandle(json.argument, env, isInFunction)[0];
//     return [json, env];
// }

function substituteAssignmentExpression(json, env, isInFunction) {
    json.right = typeHandle(json.right,env, isInFunction)[0];
    let temp = extendEnv(env, json.left, json.right);
    env = temp[1];
    if(temp[0] === true)
        return [false, env];
    return [json, env];
}

function substituteVariableDeclaration(json, env, isInFunction) {
    // let temp;
    for(let i=0; i<json.declarations.length; i++) {
        json.declarations[i].init = typeHandle(json.declarations[i].init, env, isInFunction)[0];
        let variable = escodegen.generate(json.declarations[i].id);
        let value = escodegen.generate(json.declarations[i].init);

        if(isInFunction)
            env.push({isLocal: true, variable: variable, value: value});
        else
            env.push({variable: variable, value: value});
        // temp = extendEnv(env, json.declarations[i].id, json.declarations[i].init)[1];
        // env = temp[1];
    }
    // if(temp[0] === true)
    if(isInFunction === true)
        return [false, env];
    return [json, env];
    // return [env, json];
}

function changeGlobalEnv(globalEnv, localEnv) {
    globalEnv.forEach((globalVarVal) => {
        for(let i = 0; i < localEnv.length ; i ++) {
            if (localEnv[i].isLocal !== true && localEnv[i].isParam !== true && globalVarVal.variable === localEnv[i].variable) {
                globalVarVal.value = localEnv[i].value;
                break;
            }
        }
    });
    return globalEnv;
}

function removeParamsFromGlobalEnv(params, env) {
    let newEnv = [];
    let found;
    env.forEach((varVal) => {
        found = false;
        for(let i=0; i<params.length; i++){
            if(varVal.isParam !== true && varVal.variable === params[i].name) {
                found = true;
                break;
            }
        }
        if(!found)
            newEnv.push(varVal);
    });
    return newEnv;
}

function substituteFunctionDeclaration(json, env, isInFunction){
    let localEnv = JSON.parse(JSON.stringify(env));
    localEnv = removeParamsFromGlobalEnv(json.params, localEnv);
    let temp = typeHandle(json.body,localEnv, isInFunction || true); //again fix unused parameter
    json.body = temp[0]; localEnv = temp[1];
    env = changeGlobalEnv(env, localEnv);
    return [json,env];
}

function substituteExpressionStatement(json, env, isInFunction){
    let temp = typeHandle(json.expression,env, isInFunction);
    json.expression = temp[0];
    env = temp[1];
    if(temp[0])
        return [json, env];
    // json.expression = temp[2];
    return [false, env];
}

function substituteWhileStatement(json, env, isInFunction) {
    let temp = typeHandle(json.test, env, isInFunction);
    json.test = temp[0]; env = temp[1];
    temp = typeHandle(json.body, env, isInFunction);
    json.body = temp[0]; env = temp[1];
    return [json,env];
}

function substituteIfStatement(json, env, isInFunction) {
    let consequentEnv = JSON.parse(JSON.stringify(env));
    let alternateEnv = JSON.parse(JSON.stringify(env));

    let temp = typeHandle(json.test, env, isInFunction);
    json.test = temp[0]; env = temp[1];
    temp = typeHandle(json.consequent, consequentEnv, isInFunction);
    json.consequent = temp[0];
    temp = typeHandle(json.alternate, alternateEnv, isInFunction);
    json.alternate = temp[0];
    return [json, env];
}

function substituteReturnStatement(json, env, isInFunction) {
    let temp = typeHandle(json.argument, env, isInFunction);
    json.argument = temp[0]; env = temp[1];
    return [json,env];
}



function substitute(json, env, isInFunction) {
    let temp;
    let myEnv = [];
    let newBody = [];
    env.forEach((varVal) => myEnv.push(JSON.parse(JSON.stringify(varVal))));
    for(let i=0; i<json.body.length;i++){
        temp = typeHandle(json.body[i],myEnv, isInFunction);
        // json.body[i] = temp[2];
        if(temp[0])
            newBody.push(temp[0]);
        myEnv = temp[1];
    }
    // if(newBody.length === 0 && json.body.length > 0)
    //     newBody.push(temp[2]);
    json.body = newBody;
    return [json, env];
}

function typeHandle(json, env, isInFunction) {
    return json === null ? [json, env] : typeToHandlerMapping[json.type](json,env, isInFunction);
}


function getLinesToMark(json) {

    let lst = Assignment1.parseJson(json,[]);
    let ifLst = [];
    lst.forEach((v) => {
        if(v.type === 'if statement' || v.type === 'else if statement')
            ifLst.push(v);
    });
    return ifLst.map((v) => [v.line, eval(v.condition)]);
}

function markLines(codeLines, linesToMark) {
    for(let i=0; i<codeLines.length; i++){
        for(let j=0; j<linesToMark.length; j++){
            if(linesToMark[j][0] === i+1){
                let colorClass = 'red';
                if(linesToMark[j][1])
                    colorClass = 'green';
                codeLines[i] = '<mark class="' + colorClass +'">' + codeLines[i] + '</mark>';
                break;
            }
        }
    }
    return codeLines;
}



//consider input as {"x":"1","y":"2",...}
function convertInputToEnvJSON(input){
    let jsonInput = JSON.parse(input);
    let dict = Object.keys(jsonInput).map(function(k) {
        return {isParam: true, variable: k, value: jsonInput[k]};
    });
    return dict;
}

function paintCode(code, input) {

    let substitutedCodeInput;
    if(input === '')
        substitutedCodeInput = code;
    else
        substitutedCodeInput = substitute(code,convertInputToEnvJSON(input), false)[0];
    let codeParsedWithLine = esprima.parseScript(revertParseCode(substitutedCodeInput), {loc:true});
    let linesToMark = getLinesToMark(codeParsedWithLine);
    let codeLines = revertParseCode(substitutedCodeInput).split('\n');
    codeLines = markLines(codeLines, linesToMark);
    let paintedCode = '';
    codeLines.forEach((line) => { if (line !== '') paintedCode += line + '<br>\n';});
    return paintedCode;
}

const revertParseCode = (jsonToCode) => {
    return escodegen.generate(jsonToCode);
};

export {parseCode, substitute, paintCode};