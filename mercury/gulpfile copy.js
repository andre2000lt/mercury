"use strict";

var gulp = require("gulp");
var plumber = require("gulp-plumber");
var sourcemap = require("gulp-sourcemaps");
var less = require("gulp-less");
var sass = require("gulp-sass");
var postcss = require("gulp-postcss");
var autoprefixer = require("autoprefixer");
var csso = require("gulp-csso");
var rename = require("gulp-rename");
var server = require("browser-sync").create();

var imagemin = require('gulp-imagemin');
var webp = require("gulp-webp");
var svgstore = require("gulp-svgstore");

var del = require("del");

var minify = require('gulp-minify');
var htmlmin = require('gulp-htmlmin');

// Сжатие картинок
gulp.task("images", function () {
  return gulp.src([
    "source/img/**/*.{png,jpg,svg,webp}",
    "!source/img/models/**/*.*"
  ])
  .pipe(imagemin([
    imagemin.optipng({optimizationLevel: 3}),
    imagemin.mozjpeg({quality: 75, progressive: true}),
    imagemin.svgo()
  ]))
  .pipe(gulp.dest("build/img"));
});

// Преобразование в webp
gulp.task("webp", function () {
  return gulp.src("source/img/**/*.{png,jpg}")
    .pipe(webp({quality: 90}))
    .pipe(gulp.dest("source/img"));
});

// Создание SVG спрайта
gulp.task("sprite", function () {
  return gulp.src("build/img/icon-*.svg")
  .pipe(svgstore({
    inlineSvg: true
  }))
  .pipe(rename("sprite.svg"))
  .pipe(gulp.dest("build/img"));
});

// Копирование файлов в build
gulp.task("copy", function () {
  return gulp.src([
    "source/fonts/**/*.{woff,woff2}",
    "source/js/**/*.min.js",
    "source/*.html",
    "source/*.ico",
    "source/css/normalize.css"

  ], {
    base: "source"
  })
  .pipe(gulp.dest("build"));
});

// Копирование html файлов в build
gulp.task("copy_html", function () {
  return gulp.src([
    "source/*.html"
  ], {
    base: "source"
  })
  .pipe(htmlmin({ collapseWhitespace: true }))
  .pipe(gulp.dest("build"));
});

// Сжатие JS файлов
gulp.task("min_js", function () {
  return gulp.src([
    "source/js/**",
    "!source/js/**/*.min.js"
  ], {
    base: "source"
  })
  .pipe(minify({
    ext:{
      src:'.js',
      min:'.min.js'
    }
  }))
  .pipe(gulp.dest("build"));
});

// Удалкние папки build
gulp.task("clean", function () {
return del("build");
});

// Less в CSS
gulp.task("copy_css", function () {
  return gulp.src("source/sass/style.scss")
    .pipe(plumber())
    .pipe(sass())
    .pipe(postcss([
      autoprefixer()
    ]))
    .pipe(gulp.dest("build/css"))
    .pipe(server.stream());
});

// Less в min CSS
gulp.task("css", function () {
  return gulp.src("source/sass/style.scss")
    .pipe(plumber())
    .pipe(sourcemap.init())
    .pipe(sass())
    .pipe(postcss([
      autoprefixer()
    ]))
    .pipe(csso())
    .pipe(rename("style.min.css"))
    .pipe(sourcemap.write("."))
    .pipe(gulp.dest("build/css"))
    .pipe(server.stream());
});

gulp.task("server", function () {
  server.init({
    server: "build/",
    notify: false,
    open: true,
    cors: true,
    ui: false
  });

  gulp.watch("source/sass/**/*.scss", gulp.series("copy_css", "css"));
  gulp.watch("source/img/icon-*.svg", gulp.series("sprite", "refresh"));
  gulp.watch("source/*.html", gulp.series("copy_html", "refresh"));
});

gulp.task("refresh", function (done) {
  server.reload();
  done();
});

gulp.task("build", gulp.series("clean", "copy", "min_js", "copy_css", "css", "images", "copy_html", "sprite"));
gulp.task("start", gulp.series("build", "server"));
