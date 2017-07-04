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
  cssunit = require('gulp-css-unit'),
  bs = require('browser-sync').create();

// Paths
var paths = {
  'public': './public',
  'app': './app'
};

/*
  FILES
*/
  // Vendor JS
var vendorJs = [
  'bower_components/jquery/dist/jquery.min.js',
];
  // Vendor CSS
var vendorCss = [
  'bower_components/normalize-css/normalize.css',
];

  // App JS
var appJs = [
  paths.app + '/js/_app.js',
  paths.app + '/js/js_*.js',
];

  // APP Sass
var appSass = [
  paths.app + '/style/app.scss',
  paths.app + '/style/grid.scss',
];

  // APP Pug
var appPug = [
  paths.app + '/templates/*.pug',
];

// Delete Public folder before start
gulp.task('clean', function() {
  return del.sync([ paths.public ]);
});

// vendorJs Copy
gulp.task('foundation:js', ['vendor:js'], function() {
  return gulp.src(vendorJs)
    .pipe(gulp.dest(paths.public + '/js'));
});
// concat vendor js
gulp.task('vendor:js', function () {
  return gulp.src(vendorJs)
    .pipe(concat('vendor.js'))
    .pipe(gulp.dest(paths.public + '/js'))
});

// vendorCss Copy
gulp.task('foundation:css', ['vendor:css'], function(){
  return gulp.src(vendorCss)
    .pipe(gulp.dest(paths.public + '/css'))
});
// concat vendor css
gulp.task('vendor:css', function () {
  return gulp.src(vendorCss)
    .pipe(concat('vendor.css'))
    .pipe(gulp.dest(paths.public + '/css'))
});

// Copy fonts
gulp.task('copy:fonts', function() {
  return gulp.src(paths.app + '/fonts/*.*')
    .pipe(gulp.dest(paths.public + '/fonts/'))
});

// Copy PHP
gulp.task('copy:php', function() {
  return gulp.src(paths.app + '/php/**/*.*')
    .pipe(gulp.dest(paths.public + '/php/'))
});

// Sprite PNG
gulp.task('sprite:png', function() {
  var spriteData = gulp.src(paths.app + '/sprites/png/*.png')
  .pipe(spritesmith({
    algorithm: 'left-right',
    padding: 40,
    imgPath: '../images/sprite.png',
    imgName: 'sprite.png',
    cssName: '../sprites/spritePng.scss',
    cssFormat: 'scss'
  }));
  return spriteData.pipe(gulp.dest(paths.app + '/images'));
});

// Sprite SVG
gulp.task('sprite:svg', function() {
  return gulp.src(paths.app + '/sprites/svg/*.svg')
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
  .pipe(gulp.dest(paths.app + '/images/'))
});

// Copy images
gulp.task('copy:images', ['sprite:png', 'sprite:svg'], function() {
  return gulp.src(paths.app + '/images/*.*')
    .pipe(gulp.dest(paths.public + '/images/'))
});

gulp.task('copy:uploads', function() {
  return gulp.src(paths.app + '/uploads/**/*.*')
    .pipe(gulp.dest(paths.public + '/uploads/'))
});

// Js
gulp.task('js', function() {
  return gulp.src(appJs)
    .pipe(sourcemaps.init())
      .pipe(concat('app.js'))
    .pipe(sourcemaps.write('../maps'))
    .pipe(gulp.dest(paths.public + '/js/'))
});

// Sass
gulp.task('sass', function() {
  return gulp.src(appSass)
    .pipe(sourcemaps.init())
      .pipe(sass().on('error', notify.onError({ title: 'SCSS'})))
      .pipe(autoprefixer({ browsers: ['last 5 version', '> 1%', 'ie 8', 'ie 9', 'Opera 12.1']
        }))
      .pipe(cssunit({
        type: 'px-to-rem',
        rootSize: 16,
      }))
    .pipe(sourcemaps.write('../maps'))
    .pipe(gulp.dest(paths.public + '/css/'))
});

// Pug
gulp.task('pug', function() {
  return gulp.src(appPug)
    .pipe( pug({pretty: true}) )
      .on('error', notify.onError(function(err) { return { title: 'PUG', message: err.message }
        }))
    .pipe(gulp.dest(paths.public))
});

// Build
gulp.task('build', ['clean', 'copy:images', 'copy:uploads', 'copy:fonts', 'copy:php', 'foundation:js', 'foundation:css',
  'js', 'sass', 'pug'], function() {});

// Watch
gulp.task('watch', ['build', 'connect'], function() {
  gulp.watch(paths.app + '/**/*.js', ['js']);
  gulp.watch(paths.app + '/**/*.scss', ['sass']);
  gulp.watch(paths.app + '/**/*.pug', ['pug']);
});

gulp.task('reload', ['js', 'sass', 'pug', 'copy:php'], function (done) {
    bs.reload();
    done();
});

// Default
gulp.task('default', ['build'], function() {
  bs.init({
    open: false,
    server: "./public/",
    notify: false
  });
  gulp.watch(paths.app + '/**/*{.js,.scss,.pug,.php}', ['reload']);
});
