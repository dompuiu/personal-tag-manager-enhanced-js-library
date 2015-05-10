var gulp = require('gulp');
var karma = require('karma').server;
var $ = require('gulp-load-plugins')();

/**
 * Run test once and exit
 */
gulp.task('test', function (done) {
  karma.start({
    configFile: __dirname + '/karma.conf.js',
    singleRun: true
  }, done);
});

gulp.task('default', function() {
});
