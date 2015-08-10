'use strict';

var gulp = require('gulp');
var $ = require('gulp-load-plugins')();
var browserSync = require('browser-sync');
var reload = browserSync.reload;

var paths = {
  'lib-css': ['bower_components/font-awesome/css/font-awesome.css'],
  'jsapp': ['src/js/**/*.js'],
  'cssapp': ['src/css/**/*.css'],
  'lib-fonts': ['bower_components/font-awesome/fonts/**']
};

gulp.task('lib-css', function() {
  return gulp.src(paths['lib-css'])
    .pipe($.concat('lib.css'))
    .pipe(gulp.dest('www/css/'))
});

gulp.task('jshint', function () {
  return gulp.src(paths.jsapp)
    .pipe($.jshint())
    .pipe($.jshint.reporter())
    .pipe($.sourcemaps.init())
    .pipe($.concat('app.js'))
    .pipe($.sourcemaps.write())
    .pipe(gulp.dest('www/js/'));
});

gulp.task('build-js', function() {
  return gulp.src('www/js/app.js')
    .pipe($.uglify())
    .pipe(gulp.dest('dist/js/'));
});

gulp.task('build-html', function() {
  return gulp.src('www/*.html')
    .pipe(gulp.dest('dist/'));
});

gulp.task('css', function () {
  return gulp.src(paths.cssapp)
    .pipe($.sourcemaps.init())
    .pipe($.concat('app.css'))
    .pipe($.sourcemaps.write())
    .pipe(gulp.dest('www/css/'));
});

gulp.task('build-css', function() {
  return gulp.src('www/css/app.css')
    .pipe($.minifyCss())
    .pipe(gulp.dest('dist/css'));
});

gulp.task('fonts', function() {
  return gulp.src(paths['lib-fonts'])
    .pipe(gulp.dest('www/fonts/'))
});

gulp.task('mv-html', function() {
  return gulp.src('src/*.html')
    .pipe(gulp.dest('www/'));
});

gulp.task('clean', function() {
  return gulp.src(['www', 'dist'])
    .pipe($.rimraf({force: true}));
});

gulp.task('serve', ['default'], function() {
  browserSync({
    notify: false,
    port: 9001,
    server: {
      baseDir: ['www'],
      routes: {
        '/js': 'www/js'
      }
    }
  });

  gulp.watch('src/**/*.js', ['jshint']);
  gulp.watch('src/layout.html', ['mv-html']);
  gulp.watch(paths.cssapp, ['css']);

  gulp.watch([
    'src/*.html',
    'src/**/*.js',
    'src/css/**/*.css'
  ]).on('change', reload);
});


gulp.task('default', $.sequence('clean', ['mv-html', 'fonts', 'css', 'jshint', 'lib-css']));

gulp.task('build', $.sequence('default', ['build-js', 'build-css', 'build-html']));
