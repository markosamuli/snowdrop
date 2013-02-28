var clc = require('cli-color')
, watch = require('watch')
, fs    = require('fs')
, path  = require('path')
;

var options = null;

module.exports = {
  observe: function(markerFileName, configFile) {
    console.log();
    console.log(clc.white('      |\\__/,|   (`\\'));
    console.log(clc.white('    _ |') + clc.green('. .') + clc.white('  |_  _) )'));
    console.log(
      clc.blue('---') +
      clc.white('(((') +
      clc.blue('---') +
      clc.white('(((') +
      clc.blue('-----------------------------------------------')
    );
    console.log();

    options = require(configFile);
    watch(process.cwd() + path.sep);
    walk(process.cwd(), function(err, results){
    });
  }
}

var matchesIgnores = function(string) {
  for(var i in options.ignore) {
    var test = new RegExp(options.ignore[i]);
    if(string.match(test) !== null) {
      return true;
    }
  }
  return false;
}

var walk = function(dir, done) {
  var results = [];
  fs.readdir(dir, function(err, list) {
    if (err) return done(err);
    var pending = list.length;
    if (!pending) return done(null, results);
    list.forEach(function(file) {
      file = dir + '/' + file;
      fs.stat(file, function(err, stat) {
        if (stat && stat.isDirectory()) {
          watch(file);
          walk(file, function(err, res) {
            results = results.concat(res);
            if (!--pending) done(null, results);
          });
        } else {
          // File listing
          if(!matchesIgnores(file)) {
            results.push(file);
          }
          if (!--pending) done(null, results);
        }
      });
    });
  });
};

var watch = function(dir) {
  if(!matchesIgnores(dir)) {
    fs.watch(dir, function(event, filename) {
      if(dir.match(/\/$/) == null) {
        dir += path.sep;
      }
      console.log(event, dir + filename);
    });
  }
}