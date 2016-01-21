var gulp = require('gulp'),
    del = require('del'),
    bundle = require('gulp-bundle-assets');


// Clean
gulp.task('clean', function () {
    return del(['./angular_flask/static/dist']);
});


gulp.task('bundle', ['clean'], function () {
    return gulp.src('./bundle.config.js')
        .pipe(bundle())
        .pipe(gulp.dest('./angular_flask/static/dist'));
});

