var gulp = require('gulp')
var uglify = require('gulp-uglify')
var minifyCSS = require('gulp-minify-css')

gulp.task('uglifyjs', function () {
    gulp.src('src/js/**/*.js')
        .pipe(uglify())
        .pipe(gulp.dest('dist/js'))
})

gulp.task('css', function () {
    // 1. 找到文件
    gulp.src('src/css/**/*.css')
    // 2. 压缩文件
        .pipe(minifyCSS())
    // 3. 另存为压缩文件
        .pipe(gulp.dest('dist/css'))
})