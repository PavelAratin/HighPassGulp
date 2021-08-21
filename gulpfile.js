const { src, dest, parallel, series, watch } = require('gulp');
const browserSync = require('browser-sync').create();
const concat = require('gulp-concat');
const uglify = require('gulp-uglify-es').default;
const sass = require('gulp-sass')(require('sass'));
const autoprefixer = require('gulp-autoprefixer');
const imagecomp = require('compress-images');

function browsersync() {
  browserSync.init({
    server: { baseDir: 'app/' },
    notify: false,
    online: true,
    browser: 'chrome'
  });
};

function scripts() {
  return src([
    'node_modules/jquery/dist/jquery.min.js',
    'app/js/scripts.js',
  ])
    .pipe(concat('app.min.js'))
    .pipe(uglify())
    .pipe(dest('app/js/'))
    .pipe(browserSync.stream())
}

function styles() {
  return src('app/sass/main.scss')
    .pipe(sass())
    .pipe(concat('app.min.css'))
    .pipe(autoprefixer({ overrideBrowserlist: ['last 10 versions'], grid: true }))
    .pipe(dest('app/css/'))
    .pipe(browserSync.stream())
}

function fonts() {
  return src('app/fonts/**/*.*')
  .pipe(dest('dist/fonts'))
}

async function images() {
  imagecomp(
    "app/img/imageshard/**/*", // Берём все изображения из папки источника
    "app/img/imagesmin/", // Выгружаем оптимизированные изображения в папку назначения
    { compress_force: false, statistic: true, autoupdate: true }, false, // Настраиваем основные параметры
    { jpg: { engine: "mozjpeg", command: ["-quality", "75"] } }, // Сжимаем и оптимизируем изображеня
    { png: { engine: "pngquant", command: ["--quality=75-100", "-o"] } },
    { svg: { engine: "svgo", command: "--multipass" } },
    { gif: { engine: "gifsicle", command: ["--colors", "64", "--use-col=web"] } },
    function (err, completed) { // Обновляем страницу по завершению
      if (completed === true) {
        browserSync.reload()
      }
    }
  )
}


function buildcopy() {
  return src([
    'app/css/**/*min.css',
    'app/js/**/*min.js',
    'app/img/imagesmin/**/*',
    'app/**/*.html'
  ],{base: 'app'})
  .pipe(dest('dist'))
}



function startwatch() {
  watch('app/**/*.scss', styles)
  watch(['app/**/*.js', '!app/**/*.min.js'], scripts)
  watch('app/**/*.html').on('change', browserSync.reload)
  watch('app/img/imageshard/**/*', images);

}


exports.browsersync = browsersync;
exports.scripts = scripts;
exports.styles = styles;
exports.images = images;
exports.build = series(styles,scripts,images,buildcopy)
exports.default = parallel(scripts, fonts, styles, browsersync, startwatch);