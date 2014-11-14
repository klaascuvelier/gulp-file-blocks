'use strict';

var path    = require('path'),
    fs      = require('fs'),
    gutil   = require('gulp-util'),
    glob    = require('glob'),
    _       = require('lodash'),
    through = require('through2');

module.exports = function (options)
{
    var options     = options || {},

        startRegExp = /(?:<!--|\/\*|\/\/)\s*fileblock:(\w+)\s+(.*?)\s*(?:-->|\*\/)/,
        endRegExp   = /(?:<!--|\/\*|\/\/)\s*endfileblock\s*(?:-->|\*\/)/,

        blocks      = options.blocks || {},
        noFileResolution =  options.noFileResolution || false,

        templates   = {
            js  : '<script src="${file}"></script>',
            css : '<link href="${file}" rel="stylesheet" />',
            ref : '/// <reference path="${file}" />',
            raw : '${file}'
        };


    function processHtml(content, push, callback)
    {
        var html = [];
        var sections = content.split(endRegExp);

        for (var i = 0, l = sections.length; i < l; ++i) {

            if (sections[i].match(startRegExp)) {
                var section     = sections[i].split(startRegExp),
                    templateKey = section[1],
                    blockKey    = section[2],
                    templateHtml, blockFiles;


                if (!blocks.hasOwnProperty(blockKey)) {
                    PluginError('gulp-file-blocks', 'Fileblock definition not found')
                }

                if (!templates.hasOwnProperty(templateKey)) {
                    PluginError('gulp-file-blocks', 'Template definition not found')
                }

                html.push(section[0]);

                templateHtml    = templates[templateKey];
                blockFiles      = getFiles(blocks[blockKey]);

                _.forEach(blockFiles, function (file) {
                    html.push(templateHtml.replace(/\${file}/g, file));
                });
            } else {
                html.push(sections[i]);
            }
        }

        return html.join("\n");
    }

    function getFiles(filePatterns)
    {
        var files = [];

        if (!_.isArray(filePatterns)) {
            filePatterns = [filePatterns];
        }

        for (var i = 0, l = filePatterns.length; i < l; ++i) {
            var pattern         = filePatterns[i],
                stripPrefixes   = 0,
                parts, counter;

            if (_.isObject(pattern)) {
                stripPrefixes   = pattern.stripPrefixes || 0;
                pattern         = pattern.pattern;
            }

            var prefixStripper = function(filePath) {
                var strippedFilePath = filePath
                if (stripPrefixes > 0) {
                    counter = stripPrefixes;
                    parts = (filePath + '').split('/');

                    while (counter-- > 0) {
                        parts.shift();
                    }

                    strippedFilePath = parts.join('/');
                }

                return strippedFilePath;
            };

            // resolve files on path, allows globbing
            if (!noFileResolution) {
                var filePaths   = glob.sync(pattern);

                if (filePaths[0] === undefined) {
                    throw new gutil.PluginError('gulp-file-blocks', 'Path ' + filePatterns[i] + ' not found!');
                }

                filePaths.forEach(function (filePath) {
                    files.push(prefixStripper(filePath));
                });

            } else {
                // Don't resolve files, so future files can be inserted, prevents globbing

                if (pattern.indexOf('*') !== -1) {
                    throw new gutil.PluginError('gulp-file-blocks', "Can't use globs when resolve is false!");
                }

                files.push(prefixStripper(pattern))
            }
        }

        return files;
    }

    // Config should not overwrite existing templates
    templates = _.extend(templates, options.templates);


    return through.obj(function (file, enc, callback) {
        if (file.isNull()) {
            this.push(file); // Do nothing if no contents
            callback();

        } else if (file.isStream()) {
            this.emit('error', new gutil.PluginError('gulp-file-blocks', 'Streams are not supported!'));
            callback();

        } else {
            var html = processHtml(String(file.contents));

            this.push(new gutil.File({
                path: path.basename(file.path),
                contents: new Buffer(html)
            }));

            callback();
        }
    });
};
