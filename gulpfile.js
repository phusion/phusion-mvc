// Load plugins
var gulp = require('gulp'),
  bower = require('gulp-bower'),
  del = require('del'),
  concat = require('gulp-concat'),
  coffee = require('gulp-coffee'),
  vulcanize = require('gulp-vulcanize'),
  runSequence = require('run-sequence');

// Clean
gulp.task('clean', function() {
  del(['build', 'dist'])
});

// Bower
gulp.task('bower', function() {
  bower('lib/vendor')
    .pipe(gulp.dest('build/vendor/'));
});

gulp.task('elements-coffee', function() {
  gulp.src('lib/elements/*.coffee')
    .pipe(coffee())
    .pipe(gulp.dest('build/elements'));
})

gulp.task('elements-html', function() {
  gulp.src('lib/elements/*.html')
    .pipe(gulp.dest('build/elements'));
})

gulp.task('elements-vulcanize', function() {
  gulp.src('build/elements/polymer-mvc.html')
    .pipe(vulcanize({
      dest: 'build',
      csp: true,
      inline: true
    }))
    .pipe(gulp.dest('build'));
})

// Elements
gulp.task('elements', function(callback) {
  runSequence('elements-html', 'elements-coffee', 'elements-vulcanize', callback);
});

// Coffeescripts
gulp.task('coffee', function() {
  gulp.src('lib/*.coffee')
    .pipe(coffee())
    .pipe(gulp.dest('build'));
});

// Javascripts
gulp.task('javascripts', function() {
  gulp.src(['build/*.js', 'build/vendor/brow-route/dist/*.js'])
    .pipe(concat('polymer-mvc.js'))
    .pipe(gulp.dest('dist'));
})
// Javascripts
gulp.task('html', function() {
  gulp.src('build/polymer-mvc.html')
    .pipe(gulp.dest('dist'));
})

// Build task
gulp.task('build',  function() {
  runSequence(['coffee', 'bower', 'elements'],
              ['javascripts', 'html'])
});
