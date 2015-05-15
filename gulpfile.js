var gulp = require('gulp');
var path = require('path');
var webpack = require('gulp-webpack');
var jscs = require('gulp-jscs');
var stylish = require('gulp-jscs-stylish');
var karma = require('karma').server;

var noop = function () {};
var baseDir = './src';

gulp.task('lint', function () {
    return gulp.src('src/**/*.js')
      .pipe(jscs())
      .on('error', noop) // don't stop on error
      .pipe(stylish());
});

gulp.task('webpack', function() {
  return gulp.src('./src/bootstrap.js')
    .pipe(
      webpack({
        output: {
          filename: 'engine.js',
          library: 'ptm'
        },
        devtool: '#inline-source-map',
        resolve: {
          extensions: ['', '.js']
        },
        module: {
          loaders: [
            { test: /\.js$/, exclude: /node_modules/, loader: 'babel-loader'}
          ]
        }
      })
    )
    .pipe(gulp.dest('./dist'));
});

gulp.task('test', function (done) {
  karma.start({
    configFile: __dirname + '/karma.conf.js',
    singleRun: true
  }, done);
});

gulp.task('coverage', function (done) {
  karma.start({
    configFile: __dirname + '/karma.coverage.conf.js',
    singleRun: true
  }, done);
});

gulp.task('watch', function() {
  gulp.watch(['./src/**/*', './test/**/*'], ['lint', 'test', 'webpack']);
});

gulp.task('default', ['watch']);
