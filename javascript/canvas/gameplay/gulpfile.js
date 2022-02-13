var gulp = require('gulp');
var include = require('gulp-include');
var uglify = require('gulp-uglify');
var rename = require('gulp-rename');
var watch = require('gulp-watch');
var remove = require('gulp-remove-code');

gulp.task('prebuild', function (done) {
  gulp.src('src/index.html')
    .pipe(remove({ production: true }))
    .pipe(include())
    .on('error', console.log)
    .pipe(gulp.dest('.'));
	done();
});

gulp.task('min', function () {
    return gulp.src('src/main.js')
        .pipe(rename('main.min.js'))
        .pipe(uglify())
        .pipe(gulp.dest('src/'));
});

gulp.task('default', gulp.series('min', 'prebuild')); // поддерживается в gulp4 







