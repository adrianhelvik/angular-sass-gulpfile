module.exports = (function () {

    var root  = '';
    var base  = 'src/';
    var app   = base + 'app/';
    var dev   = root + 'dev-build/';
    var build = root + 'build/';
    var cssd  = dev + 'css/style.css';
    var cssb  = build + 'css/';
    var sass  = [base + 'sass/app.scss', base + 'scss/**/*.scss'];
    var allhtml  = [
        app + '**/*.html',
        '!' + app + 'index.html'
    ];

    // TODO: Add js shims before anything else
    var config = {
        alljs: [
            app + '**/*.shim.js',
            app + '**/*.module.js',
            app + '**/*.controller.js',
            app + '**/*.service.js',
            app + '**/*.directive.js',
            app + '**/*.filter.js',
            app + '**/*.js',
            '!' + app + '**/ignore.*.js'
        ],
        // dirs
        sass  : sass,
        dev   : dev,   // dev dir
        build : build, // build dir
        cssd  : cssd,  // compiled css dir - dev
        cssb  : cssb,  // compiled css dir - build

        // all html files except index.html
        allhtml  : allhtml,
        
        // index.html source
        index : base + 'index.html',

        // compiled js files
        jsdc  : dev + 'app.js',
        jsbc  : build + 'app.js',
        
        // autoprefixer options
        autoprefixer: {
            browsers: ['last 2 versions'],
            cascade: true // for dev version
        },

        // Bower and NPM locations
        bower: {
            json: require('./bower.json'),
            directory: './bower_components',
            ignorePath: '..'
        }
    };

    config.getWiredepDefaultOptions = function() {
        var options = {
            bowerJson: config.bower.json,
            directory: config.bower.directory,
            ignorePath: config.bower.ignorePath
        };

        return options;
    };

    config.getAutoprefixerDefaultOptions = function() {
        return config.autoprefixer;
    };

    return config;

})();
