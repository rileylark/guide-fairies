var gulp = require('gulp'),
    gutil = require('gulp-util'),
    jade = require('gulp-jade'),
    concat = require('gulp-concat'),
    streamqueue = require('streamqueue'),
    templateCache = require('gulp-angular-templatecache');

gulp.task('build', function () {

    var compileFairyTemplates = gulp.src('src/guideFairies/templates/**/*.jade')
        .pipe(jade({}).on('error', gutil.log))
        .pipe(templateCache({module: 'guide-fairies'}));

    var compileFairyJs = gulp.src('src/guideFairies/guide-fairies.js');

    streamqueue({ objectMode: true }, compileFairyJs, compileFairyTemplates)
        .pipe(concat('guide-fairies.js'))
        .pipe(gulp.dest('dist/js'));

    gulp.src('src/demoApp/templates/**/*.jade')
        .pipe(jade({}).on('error', gutil.log))
        .pipe(templateCache())
        .pipe(gulp.dest('dist'));

    gulp.src('src/demoApp/demoApp.js')
        .pipe(gulp.dest('dist/js'));

    gulp.src('./src/demoApp/index.jade')
        .pipe(jade({}).on('error', gutil.log))
        .pipe(gulp.dest('dist'));
});

gulp.task('dev', ['build'], function () {
    gulp.watch(['src/**/*'], ['build']);
});