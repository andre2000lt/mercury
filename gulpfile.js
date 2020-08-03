"use strict";

const sourceFolder = 'source/';
const destinationFolder = 'build/';

const path = {
    src: {
        img: sourceFolder + 'img/',
        html: sourceFolder + '*.html',
        scss: sourceFolder + 'sass/style.scss',
        js: sourceFolder + 'js/**/',
        fonts: sourceFolder + 'fonts/'
    },

    dest: {
        img: destinationFolder + 'img/',
        html: destinationFolder,
        css: destinationFolder + 'css/',
        js: destinationFolder + 'js/',
        fonts: destinationFolder + 'fonts/'
    },

    watch: {
        img: sourceFolder + 'img/',
        html: sourceFolder + '**/*.html',
        scss: sourceFolder + 'sass/**/*.scss',
        js: sourceFolder + 'js/**/*.js'
    }
}

const gulp = require("gulp");
const server = require("browser-sync").create();
const fileInclude = require("gulp-file-include");

var plumber = require("gulp-plumber");
var sourcemap = require("gulp-sourcemaps");
var sass = require("gulp-sass");
var postcss = require("gulp-postcss");
var autoprefixer = require("autoprefixer");

const del = require("del");

// Startы the server
gulp.task("server", function () {
    server.init({
        server: "build/",
        notify: false,
        open: true,
        cors: true,
        ui: false
    });

    gulp.watch(path.watch.scss, gulp.series("scssToCss"));
    // gulp.watch("source/img/icon-*.svg", gulp.series("sprite", "refresh"));
    gulp.watch(path.watch.html, gulp.series("html", "refresh"));
});

// Refreshes the server  
gulp.task("refresh", function (done) {
    server.reload();
    done();
});

// Copies html files to the build directory
gulp.task("html", function () {
    return gulp.src(path.src.html)
    .pipe(fileInclude())
    .pipe(gulp.dest(path.dest.html));
});

// Deletes the build directory
gulp.task("clean", function () {
    return del("destinationFolder");
});

// Converts SCSS to CSS
gulp.task("scssToCss", function () {
    return gulp.src(path.src.scss)
      .pipe(plumber())
      .pipe(sourcemap.init())
      .pipe(sass())
      .pipe(postcss([
        autoprefixer()
      ]))
      .pipe(sourcemap.write("."))
      .pipe(gulp.dest(path.dest.css))
      .pipe(server.stream());
  });

gulp.task("start", gulp.series("clean", "html", "scssToCss", "server"));



