var
	gulp = require('gulp'),
	plugin = require('gulp-load-plugins')(),
	browserSync = require('browser-sync').create();

var list = require('./vendor-list.js');

/*---------------------------------------
    VENDOR
---------------------------------------*/
gulp.task('vendor', function() {
  var stream = gulp.src(list.js)
    .pipe(plugin.concat('vendor.js'))
    .pipe(gulp.dest('./js'));
  var stream = gulp.src(list.css)
    .pipe(plugin.concat('vendor.css'))
    .pipe(gulp.dest('./css'));
  var stream = gulp.src(list.js)
    .pipe(gulp.dest('js/vendor'))
  var stream = gulp.src(list.css)
    .pipe(gulp.dest('js/vendor'))
  return stream;
});

/*---------------------------------------
    SVG
---------------------------------------*/
gulp.task('svg', function () {
	return gulp.src('./images/svg/*.svg')
		.pipe(plugin.svgmin({
			plugins: [{
				removeAttrs: {
					attrs: '(fill|stroke)'
				}
			}]
		}))
		.pipe(plugin.svgSprite({
			mode : {
				symbol: {
					sprite: 'sprite.svg', // имя файла
					bust: false, // отключаем хэш в имени файла
					dest: '', // отключаем файловую струтуру (по умолчанию, создаем в папке gulp.dest)
	        }
	      }
	    }))
		.pipe(gulp.dest('./images'));
});

/*---------------------------------------
    LESS
---------------------------------------*/
gulp.task('less', function () {
	return gulp.src('./less/app.less')
		.pipe(plugin.sourcemaps.init())
		.pipe(plugin.less()).on("error", plugin.notify.onError("*** LESS ***: <%= error.message %>"))
		.pipe(plugin.autoprefixer({browsers: ['last 5 versions'], cascade: false}))
		.pipe(plugin.sourcemaps.write('../css'))
		.pipe(gulp.dest('./css'));
});

/*---------------------------------------
    PUG
---------------------------------------*/
gulp.task('pug', function () {
	return gulp.src('template/!(_*).pug')
		.pipe(plugin.pug({pretty: true})).on("error", plugin.notify.onError("*** PUG ***: <%= error.message %>"))
		.pipe(gulp.dest('./'));
});

/*---------------------------------------
    RELOADS
---------------------------------------*/
gulp.task('reload:pug', ['pug'], function (done) {
    browserSync.reload();
    done();
});
gulp.task('reload:less', ['less'], function (done) {
    browserSync.reload();
    done();
});
gulp.task('reload:vendor', ['vendor'], function (done) {
  browserSync.reload();
  done();
});

/*---------------------------------------
    BUILD
---------------------------------------*/
gulp.task('build', ['vendor','pug', 'less']);


/*---------------------------------------
    WATCH
---------------------------------------*/
gulp.task('watch', function() {
    browserSync.init({
        server: {
            baseDir: "./"
        }
    });

    gulp.watch("js/*.js").on('change', browserSync.reload);
    gulp.watch("./vendor-list.js", ['reload:vendor']);
    gulp.watch("less/*.less", ['reload:less']);
    gulp.watch("template/*.pug", ['reload:pug']);
});
