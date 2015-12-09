var gulp        = require('gulp');
var rename      = require('gulp-rename');
var sourcemaps  = require('gulp-sourcemaps');
var uglify = require('gulp-uglify');
var webserver = require('gulp-webserver');

var gutil = require('gulp-util');
var sourcemaps = require('gulp-sourcemaps');
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');
var watchify = require('watchify');
var browserify = require('browserify');
var assign = require('lodash.assign');

/**
 * Browserify
 */
// https://github.com/gulpjs/gulp/tree/master/docs/recipes
// add custom browserify options here
var customOpts = {
  entries: ['./assets/js/src/app.js'],
  debug: true
};
var opts = assign({}, watchify.args, customOpts);
var b = watchify(browserify(opts));

gulp.task('exit', ['js', 'uglify'], function(){
    process.exit(0);
});

gulp.task('js', bundle); // so you can run `gulp js` to build the file
b.on('update', bundle); // on any dep update, runs the bundler
b.on('log', gutil.log); // output build logs to terminal

function bundle() {
  return b.bundle()
    // log errors if they happen
    .on('error', gutil.log.bind(gutil, 'Browserify Error'))
    .pipe(source('app.js'))
    // optional, remove if you don't need to buffer file contents
    .pipe(buffer())
    // optional, remove if you dont want sourcemaps
    .pipe(sourcemaps.init({loadMaps: true})) // loads map from browserify file
       // Add transformation tasks to the pipeline here.
    .pipe(sourcemaps.write('./')) // writes .map file
    .pipe(gulp.dest('./dist'));
}

gulp.task('uglify', ['js'], function() {
  return gulp.src('./dist/app.js')
    .pipe(uglify())
    .pipe(rename({ suffix: '.min' }))
    .pipe(gulp.dest('./dist'));
});

gulp.task('webserver', ['js', 'uglify'],  function() {
  gulp.src('.')
    .pipe(webserver({
      livereload: {
        enable: true,
        filter: function(fileName) {
          if (fileName.indexOf('/assets/js') >= 0) return false;
          if (fileName.indexOf('/dist/app.js') >= 0) return false;
          return true;
        }
      },
      open: true,
      port: 8080
    }));
});

/**
 * Watch
 */
gulp.task('watch', function() {
  gulp.watch( './assets/js/**', ['js']);
  gulp.watch( './dist/app.js', ['uglify']);
});

gulp.task('default', ['js', 'uglify', 'watch', 'webserver' ]);
gulp.task('build', ['js', 'uglify', 'exit' ]);
