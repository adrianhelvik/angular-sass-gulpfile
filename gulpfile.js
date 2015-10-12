//
// Notes:
// - for livereload to work, the chrome plugin 'livereload' must be installed
//
// TODO: Separate build and dev-build tasks
// 

var gulp = require('gulp');
var ncp = require('ncp');               // think cp -r
var $ = require('gulp-load-plugins')(); // gulp-some-plugin -> $.somePlugin
var es = require('event-stream');       // combine streams into one stream
var sync = $.sync(gulp).sync;           // sync tasks with sync(['sync', ['async' ['sync'], 'async'], 'sync']) (odd children are async)
var history = require('connect-history-api-fallback');

// configuration options
var config = require('./_gulp.config.js');

//
// Combined tasks
//

gulp.task('default', ['compile', 'watch', 'connect']);

// watch and compile all files
gulp.task('watch', function() {
    $.livereload.listen();
    return gulp
        .watch([config.index, 'src/sass/**/*.sass', 'src/app/**/*.js'], ['compile']);
});

// compile js, sass and inject js and css into index.html (bower packages are also injected)
gulp.task('compile', sync( [
    // async tasks in brackets
    ['js', 'sass', 'copy-html'], 'inject'
]));

//
// Single purpose tasks
//

// Concatenate js and minify for build
gulp.task('js', function() {
    return gulp
        .src(config.alljs)              // find js files
        .pipe($.iife())                 // surround all files in iifes
        .pipe($.concat('app.js'))       // mash files together
        .pipe($.ngAnnotate({single_quotes: true})) // add dependency injections in angular
        .pipe(gulp.dest(config.dev))    // store dev js
        .pipe($.uglify())               // uglify for production
        .pipe(gulp.dest(config.build)); // save build js
});

// TODO: make all sass files be compiled
gulp.task('sass', function() {
    // Important note: don't prefix path with ./
    var prefixerOptions = config.getAutoprefixerDefaultOptions();

    var infiles = ['src/sass/app.scss'];

    return gulp
        .src(config.sass)
        .pipe($.expectFile(infiles))
        .pipe($.sass())                              // compile sass to css
        .pipe($.autoprefixer(prefixerOptions))       // prefix necessary css
        .pipe(gulp.dest(config.cssd))                // save pretty css to dev TODO: check that $.sass doesn't minify
        .pipe($.minifyCss({ compatibility: 'ie8' })) // minify the css
        .pipe(gulp.dest(config.cssb));               // save minified css to build
});

// Inject js and css into index.html TODO: css injection
gulp.task('inject', function() {
    var options = config.getWiredepDefaultOptions();
    var wiredep = require('wiredep').stream;

    // dev
    var dev = gulp
        .src(config.index)                     // fetch index.html
        .pipe(wiredep(options))                // inject bower components
        // inject compiled js
        .pipe($.inject(gulp.src(config.jsdc, {read: false}), {ignorePath: config.dev}))
        // TODO: inject css
        .pipe(gulp.dest(config.dev));          // store to dev folder
        
    // build
    var build = gulp
        .src(config.index)                     // fetch index.html
        .pipe(wiredep(options))                // inject bower components
        // inject compiled js
        .pipe($.inject(gulp.src(config.jsbc, {read: false }), {ignorePath: config.build}))
        // TODO: inject css
        .pipe(gulp.dest(config.build));        // store to dev folder
    
    // copy bower componencts to dev and build folders
    ncp('./bower_components', config.dev + 'bower_components', function(err) {
        if (err) {
            return console.log('Could not bower files to dev-build', err);
        }
    });

    ncp('./bower_components', config.build + 'bower_components', function(err) {
        if (err) {
            return console.log('Could not bower files to build', err);
        }
    });
    
    // return as stream
    return es.concat(dev, build)
        .pipe($.livereload());
});

gulp.task('copy-html', function() {
    return gulp
        .src(config.allhtml)
        .pipe(gulp.dest(config.dev))
        .pipe(gulp.dest(config.build));
});

// Connect to dev server
gulp.task('connect', function() {
    $.connect.server({
        root: config.dev,
        port: 8888
    });
});

// Connect to build server
gulp.task('connect-build', function() {
    $.connect.server({
        root: config.build,
        port: 8888,
        middleware: function(connect, options) {
            return [history()];
        }
    });
});
