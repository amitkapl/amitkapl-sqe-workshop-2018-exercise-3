import $ from 'jquery';
import Viz from 'viz.js';
import {Module, render} from 'viz.js/full.render.js';
import {makeAGraph} from './code-analyzer';

$(document).ready(function () {
    $('#codeSubmissionButton').click(() => {
        let graph = makeAGraph($('#codePlaceholder').val(), $('#input').val());
        let viz = new Viz({ Module, render });
        viz.renderSVGElement(graph).then(function(element) {
            $('#result').html(element);
        });
    });
});