var gulp = require('gulp'),
    del = require('del'),
    bundle = require('gulp-bundle-assets'),
    coveralls = require('gulp-coveralls');


gulp.src('./angular_flask/test/coverage/**/lcov.info')
    .pipe(coveralls());

// Clean
gulp.task('clean', function () {
    return del(['./angular_flask/static/dist']);
});

// Copies fonts to /dist (for Font Awesome)
gulp.task('fonts', function () {
    return gulp.src('./node_modules/font-awesome/fonts/*')
        .pipe(gulp.dest('./angular_flask/static/fonts'))
});

gulp.task('bundle-css', function () {
    return gulp.src('./gulp.config/bundle-css.config.js')
        .pipe(bundle())
        .pipe(gulp.dest('./angular_flask/static/dist'));
});

gulp.task('bundle-js', function () {
    return gulp.src('./gulp.config/bundle-js.config.js')
        .pipe(bundle())
        .pipe(gulp.dest('./angular_flask/static/dist'));
});

gulp.task('bundle-vendor', function () {
    return gulp.src('./gulp.config/bundle-vendor.config.js')
        .pipe(bundle())
        .pipe(gulp.dest('./angular_flask/static/dist'));
});

// Run all three build tasks
gulp.task('build', ['bundle-css', 'bundle-js', 'bundle-vendor']);

// Watch
gulp.task('watch', function () {
    gulp.watch('angular_flask/static/src/js/*.js', ['bundle-js']);
    gulp.watch('angular_flask/static/src/js/controllers/*.js', ['bundle-js']);
    gulp.watch('angular_flask/static/src/css/*.css', ['bundle-css']);
});
