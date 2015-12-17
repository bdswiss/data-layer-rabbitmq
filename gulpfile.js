'use strict';

const gulp = require('gulp');
const gutil = require('gulp-util');
const exec = require('child_process').exec;
const jshint = require('gulp-jshint');
const console = require('better-console');

const config = {
  paths: {
    js: ['./*.js', './src/**/*.js']
  }
};

gulp.task('default', function() {
  gutil.log('GULP READY');
  gulp.watch(config.paths.js, [
    'console-clear',
    'lint'
  ]);
});

gulp.task('rmq-info', function(){
  console.clear();
  exec('./bash-scripts/rmq-info.sh', function (err, stdout, stderr) {
    console.log('RABBITMQ INFO:');
    console.log(stdout);
    console.log('ERRORS:');
    console.log(stderr);
    console.log(err);
  // cb(err);
  });
});

gulp.task('rmq-delete-all', function(){
  exec('./bash-scripts/rmq-delete-all.sh', function (err, stdout, stderr) {
    console.log('RABBITMQ DELETE ALL:');
    console.log(stdout);
    console.log('ERRORS:');
    console.log(stderr);
    console.log(err);
  // cb(err);
  });
});

gulp.task('console-clear', function(){
  console.clear();
});

gulp.task('lint', function() {
  return gulp.src(config.paths.js)
    .pipe(jshint())
    .pipe(jshint.reporter('default'));
});