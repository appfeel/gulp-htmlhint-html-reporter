gulp-htmlhint-html-reporter
====================

A simple reporter for gulp-htmlhint that writes it's output to a html file which looks pretty.

## Installation

```bash
$: npm install gulp-htmlhint-html-reporter --save
```

## Usage

```javascript
var gulp = require('gulp');
var htmlhint = require('gulp-htmlhint');

gulp.task('lint', function() {
  return gulp.src('./lib/*.js')
    .pipe(htmlhint())
    .pipe(htmlhint.reporter('gulp-htmlhint-html-reporter', {
      filename: __dirname + '/htmlhint-output.html',
      createMissingFolders : false  
    }));
});
```

## Options

Plugin options:

Type: `filename`
Default: `"htmlhint-output.html"`

The filename to write output from htmlhint. When linting is successfull, the file is not created.

Type: `createMissingFolders`
Default: `false`

Enables or disables creation of any folders given in the filename that do not exist. 
If disabled and the given path contains folders which do not exist, an ENOENT error is thrown. 

## License

[MIT](http://opensource.org/licenses/MIT) © [Ivan Vesely](https://github.com/ivan-vesely)

## Release History

* 0.1.0 Initial release
* 0.1.1 Minor fix with configuration
* 0.1.2 Minor bug fix on htmlhint output file
* 0.1.3 Add option for create missing folder