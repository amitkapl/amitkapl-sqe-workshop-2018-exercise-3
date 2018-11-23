import $ from 'jquery';
import {parseCode, parseJson} from './code-analyzer';


function buildTr(v) {
    var x = '';
    if(v != null)
        x = v;
    return '<td>' + x + '</td>';
}

function toTable(obj) {
    var tbody = document.getElementById('showData');
    var tr = '<tr><td>' + 'Line' + '</td>' + '<td>' + 'Type' + '</td>' + '<td>' + 'Name' + '</td>' + '<td>' + 'Condition' + '</td>' + '<td>' + 'Value' + '</td></tr>';
    document.getElementById('headData').innerHTML += tr;
    for (var i = 0; i < obj.length; i++) {
        tr = '<tr><td>' + obj[i].line.toString() + '</td>' + '<td>' + obj[i].type + '</td>';
        tr += buildTr(obj[i].name);
        tr += buildTr(obj[i].condition);
        tr += buildTr(obj[i].value);
        tr += '</tr>';
        tbody.innerHTML += tr;
    }
}

$(document).ready(function () {
    $('#codeSubmissionButton').click(() => {
        let codeToParse = $('#codePlaceholder').val();
        let parsedCode = parseCode(codeToParse);
        // jsonToTable(parsedCode);
        // createTableFromJSON(parsedCode);
        // $('#parsedCode').val(JSON.stringify(parsedCode, null, 2));
        // var lstAfterParse = parseJson(parsedCode).toString();
        $('#parsedCode').val(JSON.stringify(parsedCode, null, 2));
        // var lstAfterParse = [parsedCode.type].toString();
        var parsedCodeToList = parseJson(parsedCode,[]);
        toTable(parsedCodeToList);
    });
});