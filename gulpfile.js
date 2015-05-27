var gulp       = require('gulp'),
    concat     = require('gulp-concat'),
    minifyCSS  = require('gulp-minify-css'),
    uglify     = require('gulp-uglify');

var paths = {
    js : ['dist/PodPicker.js'],
    css: ['dist/PodPicker.css']
};

// Minify JavaScript
gulp.task('js', function() {

    return gulp.src(paths.js)
        .pipe(uglify({preserveComments: 'some'}))
        .pipe(concat('PodPicker.min.js'))
        .pipe(gulp.dest('dist'));
});

// Minify CSS
gulp.task('css', function () {

    return gulp.src(paths.css)
        .pipe(minifyCSS({keepSpecialComments: 1}))
        .pipe(concat('PodPicker.min.css'))
        .pipe(gulp.dest('dist'))
})


// Rerun the task when a file changes 
gulp.task('watch', function() {

    gulp.watch(paths.js, ['js']);
    gulp.watch(paths.css, ['css']);
});

// The default task (called when you run `gulp` from cli) 
gulp.task('default', ['watch', 'js', 'css']);