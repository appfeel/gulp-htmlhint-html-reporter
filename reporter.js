'use strict';

var wrStream, filename,
    fs = require('fs'),
    path = require('path'),
    acid = 0,
    defaultFilename = 'htmlhint-output.html',
    templates;

function loadTemplates() {
    var template,
        templatePath = path.join(__dirname) + '/templates/bootstrap/',
        templates = {
            body: '',
            content: '',
            item: '',
            noItems: '',
            pageFooter: '',
            pageHeader: '',
            summary: ''
        };

    for (template in templates) {
        templates[template] = fs.readFileSync(templatePath + template + '.html').toString();
    }
    
    return templates;
}

function escapeHtml(text) {
    if (typeof text !== 'string') {
        return text;
    }

    return text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function isError(errorCode) {
    return errorCode && errorCode === 'error';
}

fs.mkdirTree = function(dir) {
    var parent = path.dirname(dir);
    if (!fs.existsSync(parent)) {
        fs.mkdirTree(parent);
    }
    if (!fs.existsSync(dir)) {
        fs.mkdir(dir);
    }
};

function writeToFile(content, opts) {
    opts = opts || {};
    opts.filename = opts.filename || defaultFilename;

    if (wrStream && filename !== opts.filename) {
        wrStream.end();
        wrStream = null;
    }
    if (!wrStream) {
        var stats,
            size = 0,
            dir = path.dirname(opts.filename);

        if (opts.createMissingFolders && !fs.existsSync(dir)) {
            fs.mkdirTree(dir);
        }

        wrStream = fs.createWriteStream(opts.filename);
        wrStream.write(templates.pageHeader);
        // TODO: not working
        wrStream.on('end', function() {
            var wrStream1 = fs.createWriteStream(opts.filename);
            wrStream1.write(templates.pageFooter);
        });
        filename = opts.filename;
    }
    wrStream.write(content);
}

function calculateNumberOfFailures(result) {
    var numberOfFailures = {
        failures: 0,
        errors: 0,
        warnings: 0
    };
    
    numberOfFailures.failures = result.errorCount;
    result.messages.forEach(function(element) {
        if (isError(element.error.type)) {
            numberOfFailures.errors += 1;
        } else {
            numberOfFailures.warnings += 1;
        }
    });

    return numberOfFailures;
}

function reportFile(report, data, opts) {
    var result = report.htmlhint,
        numberOfFailures = calculateNumberOfFailures(result);

    templates = templates || loadTemplates();
    
    function prepareContent() {
        var bodyContent = '',
            items = '',
            previousFile = '',
            content = '';

        if (result.messages.length === 0) {
            return templates.noItems;
        }

        result.messages.forEach(function(element) {
            var file = element.file,
                error = element.error;

            if (previousFile !== file) {
                if (content.length && items.length) {
                    bodyContent += content.replace('{items}', items);
                }
                previousFile = file;
                acid += 1;
                content = templates.content
                    .replace(/\{acid\}/g, acid)
                    .replace('{file}', file);

                items = '';
            }

            items += templates.item
                .replace('{class}', isError(error.type) ? 'danger' : 'warning')
                .replace('{code}', escapeHtml(error.type))
                .replace('{line}', escapeHtml(error.line))
                .replace('{character}', escapeHtml(error.col))
                .replace('{evidence}', escapeHtml(error.evidence))
                .replace('{reason}', escapeHtml(error.rule.description))
                .replace('{rule}', escapeHtml(error.rule.id))
                .replace('{link}', error.rule.link);
        });

        bodyContent += content.replace('{items}', items);
        return bodyContent;
    }

    function prepareSummary() {
        var summary = templates.summary
            .replace('{failures}', numberOfFailures.failures)
            .replace('{errors}', numberOfFailures.errors)
            .replace('{warnings}', numberOfFailures.warnings);

        return numberOfFailures.failures ? summary : '';
    }

    function getRenderedHTML() {
        return templates.body
            .replace('{content}', prepareContent())
            .replace('{summary}', prepareSummary());
    }

    writeToFile(getRenderedHTML(), opts);
}

module.exports = reportFile;
