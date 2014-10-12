// Load plugins
var gulp = require('gulp'),
  bower = require('gulp-bower'),
  del = require('del'),
  concat = require('gulp-concat'),
  coffee = require('gulp-coffee'),
  vulcanize = require('gulp-vulcanize');

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

// Elements
gulp.task('elements', ['elements-coffee', 'elements-html'], function() {
  gulp.src('build/elements/polymer-mvc.html')
    .pipe(vulcanize({
      dest: 'dist',
      inline: true
    }))
    .pipe(gulp.dest('dist'));
});

// Coffeescripts
gulp.task('coffee', function() {
  gulp.src('lib/*.coffee')
    .pipe(coffee())
    .pipe(gulp.dest('build'));
});

// Concatenate
gulp.task('concat', function() {
  gulp.src('build/**/*.coffee')
    .pipe(concat('polymer-mvc.js'))
    .pipe(gulp.dest('dist'));

  gulp.src('build/*.html')
    .pipe(gulp.dest('dist'));
})

// Build task
gulp.task('build', ['clean'], function() {
  gulp.start('elements')
});
