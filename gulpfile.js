var _ = require('underscore');
var gulp = require('gulp');
var concat = require('gulp-concat');
var livereload = require('gulp-livereload');

var paths = {
  scripts: ['app/**/*.js']
};

gulp.task('scripts', function () {
  gulp.src(paths.scripts)
    .pipe(gulp.dest('public/js'));
});

gulp.task('livereload', function () {
  livereload.listen();
  gulp.watch('public/**').on('change', livereload.changed);
});

gulp.task('watch', function () {
  _.forEach(paths, function (value, key) {
    gulp.watch(value, [key]);
  });
});
