const { task, series, parallel, src, dest, watch } = require('gulp')
const sass = require('gulp-sass')
const browserSync = require('browser-sync')
const notify = require('gulp-notify')
const csscomb = require('gulp-csscomb')
const autoprefixer = require('autoprefixer')
const mqpacker = require('css-mqpacker')
const sortCSSmq = require('sort-css-media-queries')
const cssnano = require('cssnano')
const rename = require('gulp-rename')
const postcss = require('gulp-postcss')
const uglifu = require('gulp-uglify')
const terser = require('gulp-terser')
const concat = require('gulp-concat')
const htmlmin = require('gulp-htmlmin')

const PATH = {
  scssFolder: './assets/scss/',
  scssFiles: './assets/scss/**/*.scss',
  scssFile: './assets/scss/style.scss',
  cssFolder: './assets/css/',
  cssDestFolder: './dest/css',
  cssFiles: './assets/css/*.css',
  cssFile: './assets/css/style.css',
  htmlFiles: './*.html',
  htmlFolder: './dest/html',
  jsFiles: ['./assets/js/**/*.js', '!./assets/js/**/*.min.js', '!./assets/js/**/all.js'],
  jsFolder: './assets/js',
  jsDestFolder: './dest/js',
  jsBundleName: 'all.js'
}

const plugins = [
  autoprefixer({
    overrideBrowserslist: [
      'last 25 versions',
      '> 1%'
    ],
    cascade: true
  }),
  mqpacker({ sort: sortCSSmq })
]

function scss () {
  return src(PATH.scssFile)
    .pipe(sass({ outputStyle: 'expanded' }).on('error', sass.logError))
    .pipe(postcss(plugins))
    .pipe(dest(PATH.cssFolder))
    .pipe(notify({
      message: 'Compiled--scss!',
      sound: false
    }))
    .pipe(browserSync.reload({ stream: true }))
}
function scssMin () {
  const pluginsExtended = plugins.concat([cssnano({ preset: 'default' })])
  return src(PATH.scssFile)
    .pipe(sass({ outputStyle: 'expanded' }).on('error', sass.logError))
    .pipe(postcss(pluginsExtended))
    .pipe(rename({ suffix: '.min' }))
    .pipe(dest(PATH.cssFolder))
    .pipe(notify({
      message: 'Compiled--min!',
      sound: false
    }))
    .pipe(browserSync.reload({ stream: true }))
}
function scssDev () {
  return src(PATH.scssFile, { sourcemaps: true })
    .pipe(sass({ outputStyle: 'expanded' }).on('error', sass.logError))
    .pipe(postcss(plugins))
    .pipe(dest(PATH.cssFolder, { sourcemaps: true }))
    .pipe(notify({
      message: 'Compiled!',
      sound: false
    }))
    .pipe(browserSync.reload({ stream: true }))
}

function comb () {
  return src(PATH.scssFiles)
    .pipe(csscomb('./.csscomb.json'))
    .on('error', notify.onError((error) => `File: + ${error.message}`))
    .pipe(dest(PATH.scssFolder))
}

function bundelJs () {
  return src(PATH.jsFolder + '/all.js')
    .pipe(terser({ toplevel: true, output: { quote_style: 3 } }))
    .pipe(rename({ suffix: '.min' }))
    .pipe(dest(PATH.jsDestFolder))
}

function bundelCSS () {
  return src(PATH.cssFolder + '/*.min.css')
    .pipe(dest(PATH.cssDestFolder))
}

function bundeHTML () {
  return src(PATH.htmlFiles)
    .pipe(htmlmin({ collapseWhitespace: true }))
    .pipe(rename({ suffix: '.min' }))
    .pipe(dest(PATH.htmlFolder))
}

async function bunde () {
  bundeHTML()
  bundelCSS()
  bundelJs()
}

function concatJS () {
  return src(PATH.jsFiles)
    .pipe(concat(PATH.jsBundleName))
    .pipe(dest(PATH.jsFolder))
}

function uglifuJs () {
  return src(PATH.jsFiles)
    .pipe(uglifu({ toplevel: true, output: { quote_style: 3 } }))
    .pipe(rename({ suffix: '.min' }))
    .pipe(dest(PATH.jsFolder))
}

function uglifuJsS6 () {
  return src(PATH.jsFiles)
    .pipe(terser({ toplevel: true, output: { quote_style: 3 } }))
    .pipe(rename({ suffix: '.min' }))
    .pipe(dest(PATH.jsFolder))
}

function syncInit () {
  browserSync({
    server: { baseDir: './' },
    notify: false
  })
}

async function sync () {
  browserSync.reload()
}

function watchFiles () {
  syncInit()
  watch(PATH.scssFiles, parallel(scss, scssMin))
  watch(PATH.htmlFiles, sync)
  watch(PATH.jsFiles, sync)
  watch(PATH.cssFiles, sync)
}

task('comb', series(comb))
task('scss', parallel(scss, scssMin))
task('dev', series(scssDev))
task('watch', watchFiles)
task('concatjs', concatJS)
task('uglifuJs', uglifuJs)
task('uglifuJses6', uglifuJsS6)
task('bundel', bunde)
