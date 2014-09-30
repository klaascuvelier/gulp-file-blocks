# gulp-file-blocks

[![Build Status](https://travis-ci.org/klaascuvelier/gulp-file-blocks.svg?branch=master)](https://travis-ci.org/klaascuvelier/gulp-file-blocks)


Gulp plugin to create fileblocks with templates

This plugin was created by a lack of Gulp plugins providing file inclusion for html files.
The plugin is based on (grunt-file-blocks)[https://github.com/rrharvey/grunt-file-blocks] and (gulp-usemin)[https://github.com/zont/gulp-usemin].

## Using the "fileblocks" Task

### Add Block Anchors
Comments define the beginning and end of a block in a source file.

#### Block Syntax

````html
<!-- fileblock:<template> <name> -->
... script / link elements, etc.
<!-- endfileblock -->
````

#### Example Blocks
```html
<!-- fileblock:other reload -->
    <script src="//localhost:35729/livereload.js"></script>
<!-- endfileblock -->
````
````
<!-- fileblock:js app -->
<!-- endfileblock -->
````

### Add it to your gulpfile.js
````js
 gulp.src('app/index.html')
        .pipe(fileblocks({
            templates: {
                img: '<img src="${file}">'
            },
            blocks: {
                app: {
                    pattern: 'app/scripts/**/*.js',
                    stripPrefixes: 1
                },
                tmp:  'app/images/*'
            }
        }))
        .pipe(gulp.dest('.tmp/'));
````

#### Options

##### templates
Type: `object`

An object with the identifier of the template and the html code as value. `${file}` will be replaced by the path of the current file.

##### blocks
Type: `object`

An object with the identefier of the block and the pattern of the files as string. Optionally you can specify an object as value with the keys `pattern` and `stripPrefixes`.

`stripPrefixes` strips parts of the path. 
````js
pattern: 'app/scripts/**/*.js',
stripPrefixes: 1
````
Will match all JS files in the `app/scripts folder`, but will output them with `scripts` as root.
