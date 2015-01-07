'use strict';

var gulp      = require('gulp');
var gutil     = require('gulp-util');
var NwBuilder = require('node-webkit-builder');
var config    = require('../config');

gulp.task('nodeWebkit', function() {

  var nw = new NwBuilder({
    version: config.nwVersion,
    files: ['./build/**'],
    buildDir: config.webkitBuildDir,
    macIcns: './app/images/monolist.icns',
    winIco: './favicon.ico', // Must have Wine installed (if on OSX) for this option to work
    platforms: ['osx', 'win']
  });

  nw.on('log', function (msg) {
    gutil.log('node-webkit-builder:', msg);
  });

  return nw.build().catch(function (err) {
    gutil.log('node-webkit-builder:', err);
  });

});