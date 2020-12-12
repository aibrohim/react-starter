"use strict";

const PROJECT_FOLDER = "public";
const SOURCE_FOLDER = "template";

const Path = {
  BUILD: {
    css: PROJECT_FOLDER + "/css/",
    img: PROJECT_FOLDER + "/img/",
    fonts: PROJECT_FOLDER + "/fonts/"
  },
  SRC: {
    css: SOURCE_FOLDER + "/sass/main.scss",
    img: SOURCE_FOLDER + "/img/**/*.{jpg,png,svg,gif,ico,webp}",
    fonts: SOURCE_FOLDER + "/fonts/*"
  },
  WATCH: {
    css: SOURCE_FOLDER + "/sass/**/*.scss",
    img: SOURCE_FOLDER + "/img/**/*.{jpg,png,svg,gif,ico,webp}",
  },
  CLEAN: [PROJECT_FOLDER + "/css", PROJECT_FOLDER + "/img", PROJECT_FOLDER + "/fonts"]
}

var gulp = require("gulp");
var sass = require("gulp-sass");
var plumber = require("gulp-plumber");
var sourcemap = require("gulp-sourcemaps")
var postcss = require("gulp-postcss");
var autoprefixer = require("gulp-autoprefixer");
var server = require("browser-sync").create();
var csso = require("gulp-csso");
var rename = require("gulp-rename");
var imagemin = require("gulp-imagemin");
var webp = require("gulp-webp");
var svgstore = require("gulp-svgstore");
var del = require("del");
var posthtml = require("gulp-posthtml");
var include = require("posthtml-include");

gulp.task("css", function () {
  return gulp.src("markup/src/sass/main.scss")
    .pipe(plumber())
    .pipe(sourcemap.init())
    .pipe(sass())
    .pipe(autoprefixer())
    .pipe(gulp.dest("markup/src/css"))
    .pipe(gulp.dest("markup/dist/css"))
    .pipe(csso())
    .pipe(rename("main.min.css"))
    .pipe(sourcemap.write("."))
    .pipe(gulp.dest("markup/src/css"))
    .pipe(gulp.dest("markup/dist/css"))
    .pipe(rename("main.css"))
    .pipe(gulp.dest("public/css"));
})

gulp.task("imagemin", function () {
  return gulp.src("markup/src/img/**/*.{png,jpg,svg}")
    .pipe(imagemin([
      imagemin.optipng({
        optimizationLevel: 3
      }),
      imagemin.mozjpeg({
        quality: 75,
        progressive: true
      }),
      imagemin.svgo()
    ]))
    .pipe(gulp.dest("markup/src/img"));
})

gulp.task("webp", function () {
  return gulp.src("markup/src/img/**/*.{png,jpg}")
    .pipe(webp({
      quality: 90
    }))
    .pipe(gulp.dest("markup/src/img"))
})

gulp.task("html", function () {
  return gulp.src("markup/src/*.html")
    .pipe(posthtml([
      include()
    ]))
    .pipe(gulp.dest("markup/dist"))
})

gulp.task("public-html", () => {
  return gulp.src("public-template/*.html")
    .pipe(posthtml([
      include()
    ]))
    .pipe(gulp.dest("public/"))
})

gulp.task("sprite", function () {
  return gulp.src("markup/src/img/icon-*.svg")
    .pipe(svgstore({
      inlineSvg: true
    }))
    .pipe(rename("sprite.svg"))
    .pipe(gulp.dest("markup/src/img"))
    .pipe(gulp.dest("markup/dist/img"))
    .pipe(gulp.dest("public/img"))
})

gulp.task("server", function () {
  server.init({
    server: "markup/dist/",
    notify: false
  });

  gulp.watch("markup/src/sass/**/*.{sass,scss}", gulp.series("css", "refresh"));
  gulp.watch("markup/src/img/icon-*.svg", gulp.series("sprite", "html", "refresh", "public-html"));
  gulp.watch("markup/src/*.html", gulp.series("refresh", "html", "public-html"));
});

gulp.task("refresh", function (done) {
  server.reload();
  done();
})

gulp.task("copy", function () {
  return gulp.src([
      "markup/src/fonts/**/*.{woff2,woff}",
      "markup/src/img/**",
      "markup/src/*.ico"
    ], {
      base: "markup/src/"
    })
    .pipe(gulp.dest("markup/dist/"))
    .pipe(gulp.dest("public/"));
})

gulp.task("clean", function () {
  return del(["public/css", "markup/dist", "markup/src/css", "public/img", "public/fonts"]);
})

gulp.task("build", gulp.series("clean", "copy", "css", "sprite", "html", "public-html"));
gulp.task("start", gulp.series("build", "server"));
