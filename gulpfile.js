var gulp = require('gulp'),
    concat = require('gulp-concat'),
    uglify = require('gulp-uglify');

gulp.task('default', function () {
    return gulp.src('angular-hero.js')
        .pipe(uglify())
        .pipe(concat('angular-hero-min.js'))
        .pipe(gulp.dest('./'));
});
