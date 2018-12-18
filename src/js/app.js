import $ from 'jquery';
import {parseCode, substitute, paintCode} from './code-analyzer';


// function buildTr(v) {
//     var x = '';
//     if(v != null)
//         x = v;
//     return '<td>' + x + '</td>';
// }

// function toTable(obj) {
//     var tbody = document.getElementById('showData');
//     var tr = '<tr><td>' + 'Line' + '</td>' + '<td>' + 'Type' + '</td>' + '<td>' + 'Name' + '</td>' + '<td>' + 'Condition' + '</td>' + '<td>' + 'Value' + '</td></tr>';
//     document.getElementById('headData').innerHTML += tr;
//     for (var i = 0; i < obj.length; i++) {
//         tr = '<tr><td>' + obj[i].line.toString() + '</td>' + '<td>' + obj[i].type + '</td>';
//         tr += buildTr(obj[i].name);
//         tr += buildTr(obj[i].condition);
//         tr += buildTr(obj[i].value);
//         tr += '</tr>';
//         tbody.innerHTML += tr;
//     }
// }

$(document).ready(function () {
    $('#codeSubmissionButton').click(() => {
        let code = $('#codePlaceholder').val();
        let input = $('#input').val();
        let parsedCode = parseCode(code);
        let substituteCode = substitute(parsedCode, [], false)[0];
        // $('#result').val(revertParseCode(substituteCode));
        let result = paintCode(substituteCode, input);
        // let result = revertParseCode(jsonResult);
        $('#result').html(result);

        // $('#parsedCode').val(JSON.stringify(parsedCode, null, 2));
        // toTable(parsedCodeToList);
    });
});



