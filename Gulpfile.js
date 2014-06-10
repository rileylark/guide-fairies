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
        .pipe(gulp.dest('dist'));

    var compileDemoTemplates = gulp.src(['src/demoApp/**/*.jade', '!src/demoApp/index.jade'])
        .pipe(jade({}).on('error', gutil.log))
        .pipe(templateCache({module: 'FairyDemo'}));


    var compileDemoJs = gulp.src('src/demoApp/**/*.js')
        .pipe(concat('demoApp.js'));

    streamqueue({ objectMode: true }, compileDemoJs, compileDemoTemplates)
        .pipe(concat('demoApp.js'))
        .pipe(gulp.dest('demo/js'));

    gulp.src('src/demoApp/**/*.css')
        .pipe(concat('styles.css'))
        .pipe(gulp.dest('demo'));


    gulp.src('./src/demoApp/index.jade')
        .pipe(jade({}).on('error', gutil.log))
        .pipe(gulp.dest('demo'));
});

gulp.task('dev', ['build'], function () {
    gulp.watch(['src/**/*'], ['build']);
});