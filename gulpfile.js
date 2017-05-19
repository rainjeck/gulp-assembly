var
  gulp = require('gulp'),
  concat = require('gulp-concat'),
  sourcemaps = require('gulp-sourcemaps'),
  del = require('del'),
  replace = require('gulp-replace'),
  sass = require('gulp-sass'),
  pug = require('gulp-pug'),
  spritesmith = require('gulp.spritesmith'),
  svgmin = require('gulp-svgmin'),
  cheerio = require('gulp-cheerio'),
  svgSprite = require('gulp-svg-sprite'),
  notify = require("gulp-notify"),
  autoprefixer = require('gulp-autoprefixer'),
  bs = require('browser-sync').create(),
  reload = bs.reload;

// Paths
var paths = {
  'build': './public',
  'assets': './public/assets',
  'source': './app'
};

// Files
var foundationJs = [
  'bower_components/jquery/dist/jquery.min.js'
];

var foundationCss = [
  'bower_components/normalize-css/normalize.css'
];

var jsFiles = [
  paths.source + '/js/app.js',
  paths.source + '/js/modules/*.js'
];

var sassFiles = [
  paths.source + '/style/app.scss'
];

var pugFiles = [
  paths.source + '/templates/*.pug'
];

// Delete Build folder before start
gulp.task('clean', function() {
  return del.sync([ paths.build ]);
});

// FoundationJs Concat
gulp.task('foundation:js', function() {
  return gulp.src(foundationJs)
      .pipe(concat('foundation.js'))
    .pipe(gulp.dest(paths.assets + '/js'));
});

// FoundationCss Concat
gulp.task('foundation:css', function(){
  return gulp.src(foundationCss)
      .pipe(concat('foundation.css'))
    .pipe(gulp.dest(paths.assets + '/css'))
});

// Copy fonts
gulp.task('copy:fonts', function() {
  return gulp.src(paths.source + '/fonts/*.*')
    .pipe(gulp.dest(paths.assets + '/fonts/'))
});

// Sprite PNG
gulp.task('sprite:png', function() {
  var spriteData = gulp.src(paths.source + '/sprites/png/*.png')
  .pipe(spritesmith({
    algorithm: 'left-right',
    padding: 40,
    imgPath: '../images/sprite.png',
    imgName: 'sprite.png',
    cssName: '../sprites/spritePng.scss',
    cssFormat: 'scss'
  }));
  return spriteData.pipe(gulp.dest(paths.source + '/images'));
});

// Sprite SVG
gulp.task('sprite:svg', function() {
  return gulp.src(paths.source + '/sprites/svg/*.svg')
    .pipe(svgmin({ js2svg: { pretty: true } }))
    .pipe(cheerio({
      run: function ($) {
        $('[fill]').removeAttr('fill');
        $('[stroke]').removeAttr('stroke');
        $('[style]').removeAttr('style');
      },
      parserOptions: { xmlMode: true }
    }))
    .pipe(replace('&gt;', '>'))
    .pipe(svgSprite({
      mode : {
        symbol: {
          sprite: 'sprite.svg', // имя файла
          bust: false, // отключаем хэш в имени файла
          dest: '', // отключаем файловую струтуру (по умолчанию, создаем в папке gulp.dest)
          example: {
            dest: '../sprites/spriteSvgDemo.html'
          },
          render: {
            scss: {
              dest: '../sprites/spriteSvg' // куда кладем файл стилей и имя файла
            }
          }
        }
      }
    }))
  .pipe(gulp.dest(paths.source + '/images/'))
});

// Copy images
gulp.task('copy:images', ['sprite:png', 'sprite:svg'], function() {
  return gulp.src(paths.source + '/images/*.*')
    .pipe(gulp.dest(paths.assets + '/images/'))
});

// Js
gulp.task('js', function() {
  return gulp.src(jsFiles)
    .pipe(sourcemaps.init())
      .pipe(concat('app.js'))
    .pipe(sourcemaps.write('../maps'))
    .pipe(gulp.dest(paths.assets + '/js'))
});

// Sass
gulp.task('sass', function() {
  return gulp.src(sassFiles)
    .pipe(sourcemaps.init())
      .pipe(sass().on('error', notify.onError({ title: 'SCSS'})))
      .pipe(autoprefixer({ browsers: ['last 5 version', '> 1%', 'ie 8', 'ie 9', 'Opera 12.1']
        }))
    .pipe(sourcemaps.write('../maps'))
    .pipe(gulp.dest(paths.assets + '/css'))
});

// Pug
gulp.task('pug', function() {
  return gulp.src(pugFiles)
    .pipe(pug({pretty: true}) )
    .pipe(gulp.dest(paths.build))
});

// Build
gulp.task('build', ['clean', 'copy:images', 'copy:fonts', 'foundation:js', 'foundation:css',
  'js', 'sass', 'pug'], function() {});

// Watch
gulp.task('watch', ['build'], function() {
  gulp.watch(paths.source + '/js/**/*.js', ['js']);
  gulp.watch(paths.source + '/style/**/*.scss', ['sass']);
  gulp.watch(paths.source + '/templates/**/*.pug', ['pug']);
});

// Default
gulp.task('default', ['build'], function() {
  gulp.watch(paths.source + '/js/**/*.js', ['js']);
  gulp.watch(paths.source + '/style/**/*.scss', ['sass']);
  gulp.watch(paths.source + '/templates/**/*.pug', ['pug']);

  bs.init({ open: false, server: "./public/" });
  bs.watch(['./public/**/*.*'], bs.reload);
});
