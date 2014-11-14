/* jslint node: true */
/* global describe, it, expect */
'use strict';

var FileBlocks = require('../index.js');
var fs = require('fs');
var path = require('path');
var assert = require('assert');
require('event-stream');
var File = require('vinyl');

describe('FileBlocks', function () {
    it('Should be defined', function () {
        expect(FileBlocks).toBeDefined();
    });

    it('should insert non-existent files when resolve is false', function(done) {
        var result = new FileBlocks({
            blocks: {
                'css': 'nonexistent.css'
            },
            noFileResolution: true
        });

        var fakeTarget = new File({
            contents: new Buffer(fs.readFileSync(path.join('spec', 'fixture.html'), 'utf-8'))
        });
        var expected = new File({
            contents: new Buffer(fs.readFileSync(path.join('spec', 'expected.html'), 'utf-8'))
        });

        result.write(fakeTarget);
        result.once('data', function(file) {
            assert(file.isBuffer());
            assert.equal(file.contents.toString('utf-8'), expected.contents.toString('utf-8'));
            done();
        });
    });
});

