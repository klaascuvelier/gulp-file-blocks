'use strict';

var gulp    = require('gulp'),
    jshint  = require('gulp-jshint'),
    jasmine = require('gulp-jasmine');

gulp.task('lint', function() {
    return gulp.src('spec/main.js')
        .pipe(jshint())
        .pipe(jshint.reporter('default'))
        .pipe(jasmine());
});

gulp.task('default', ['lint']);
