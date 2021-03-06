
var basePaths = {
    src: 'app/assets/',
    dest: 'public/assets/',
    bower: 'public/assets/vendors/'
};
var paths = {
    images: {
        src: basePaths.src + 'images/',
        dest: basePaths.dest + 'images/min/'
    },
    scripts: {
        src: basePaths.src + 'js/',
        dest: basePaths.dest + 'js/min/'
    },
    styles: {
        src: basePaths.src + 'sass/',
        dest: basePaths.dest + 'css/min/'
    },
    sprite: {
        src: basePaths.src + 'sprite/*'
    }
};

var appFiles = {
    styles: paths.styles.src + '**/*.scss',
    scripts: [paths.scripts.src + 'scripts.js']
};

var vendorFiles = {
    styles: '',
    scripts: ''
};

// var spriteConfig = {
//     imgName: 'sprite.png',
//     cssName: '_sprite.scss',
//     imgPath: paths.images.dest + 'sprite.png' // Gets put in the css
// };






/*
    Let the magic begin
*/

var gulp = require('gulp');

var livereload = require('gulp-livereload'),
    connect = require('gulp-connect');


var es = require('event-stream');
var gutil = require('gulp-util');

var plugins = require("gulp-load-plugins")({
    pattern: ['gulp-*', 'gulp.*'],
    replaceString: /\bgulp[\-.]/
});

// Allows gulp --dev to be run for a more verbose output
var isProduction = true;
var sassStyle = 'compressed';
var sourceMap = false;

if(gutil.env.dev === true) {
    sassStyle = 'expanded';
    sourceMap = true;
    isProduction = false;
}

var changeEvent = function(evt) {
    gutil.log('File', gutil.colors.cyan(evt.path.replace(new RegExp('/.*(?=/' + basePaths.src + ')/'), '')), 'was', gutil.colors.magenta(evt.type));
};





// Connect
// ===================================================

gulp.task('connect', function() {
  connect.server({
    root: 'public',
    livereload: true,
    port:4040 
  });
});



gulp.task('css', function(){

    var sassFiles = gulp.src(appFiles.styles)
    .pipe(plugins.rubySass({
        style: sassStyle, precision: 2, compass:true
    }))
    .pipe(connect.reload())
    .on('error', function(err){
        new gutil.PluginError('CSS', err, {showStack: true});
    });

    return es.concat(gulp.src(vendorFiles.styles), sassFiles)
        .pipe(plugins.concat('style.min.css'))
        .pipe(plugins.autoprefixer('last 2 version', 'safari 5', 'ie 8', 'ie 9', 'opera 12.1', 'ios 6', 'android 4'))
        .pipe(isProduction ? plugins.combineMediaQueries({
            log: true
        }) : gutil.noop())
        .pipe(isProduction ? plugins.cssmin() : gutil.noop())
        .pipe(plugins.size())
        .pipe(gulp.dest(paths.styles.dest))
        .pipe(connect.reload());
 });

gulp.task('scripts', function(){

    gulp.src(vendorFiles.scripts.concat(appFiles.scripts))
        .pipe(plugins.concat('app.js'))
        .pipe(gulp.dest(paths.scripts.dest))
        .pipe(isProduction ? plugins.uglify() : gutil.noop())
        .pipe(plugins.size())
        .pipe(connect.reload());

});

/*
    Sprite Generator
*/
// gulp.task('sprite', function () {
//     var spriteData = gulp.src(paths.sprite.src).pipe(plugins.spritesmith({
//         imgName: spriteConfig.imgName,
//         cssName: spriteConfig.cssName,
//         imgPath: spriteConfig.imgPath,
//         cssVarMap: function (sprite) {
//             sprite.name = 'sprite-' + sprite.name;
//         }
//     }));
//     spriteData.img.pipe(gulp.dest(paths.images.dest));
//     spriteData.css.pipe(gulp.dest(paths.styles.src));
// });

gulp.task('watch', [/*'sprite',*/ 'css', 'scripts' , 'connect'], function(){
    gulp.watch(appFiles.styles, ['css']).on('change', function(evt) {
        changeEvent(evt);
    });    

    gulp.watch(paths.scripts.src + '*.js', ['scripts']).on('change', function(evt) {
        changeEvent(evt);
    });    

    gulp.watch(paths.styles.src + '*.scss', ['css']).on('change', function(evt) {
        changeEvent(evt);
    });
});

gulp.task('default', ['connect', 'css', 'scripts']);