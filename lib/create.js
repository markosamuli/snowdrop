var async  = require('async')
, readline = require('readline')
, path     = require('path')
, fs       = require('fs')
, clc      = require('cli-color')
;

var rl = readline.createInterface({
  input  : process.stdin,
  output : process.stdout
});

var config = {
  source: process.cwd(),
  destination: '',
  port: '',
  ignore: ["\\.git", "tags$"],
  init: [],
  rsync: {
    "flags": ['a','u','v','z','x','i'],
    "options": {}
  }
};

module.exports = {
  write: function(markerFileName, options) {
    for(key in options) {
      config[key] = options[key];
    }
    fs.writeFileSync(
      process.cwd() + path.sep + markerFileName,
      JSON.stringify(config, null, 4)
    );
  },
  create: function(markerFileName) {
    async.series({
      destination: function(callback) {
        rl.question("Use rsync? ", function(answer) {
          if(answer.match('^[Yy]') != null) {
            rl.question("Destination: ", function(answer) {
              callback(null, answer);
            });
          } else {
            callback(null, false);
          }
        });
      },
      port: function(callback) {
        rl.question("Port: ", function(answer) {
          if(answer.length > 0) {
            callback(null, answer);
          } else {
            callback(null, 22);
          }
        });
      },
      ctags: function(callback) {
        rl.question("Use ctags? ", function(answer) {
          if(answer.match('^[Yy]') != null) {
            callback(null, true);
          } else {
            callback(null, false);
          }
        });
      },
      init: function(callback) {
        rl.question("Anything you want to run on start? ", function(answer){
          if(answer.match('^[Yy]') != null) {
            var initCommands = [];
            var another = true;
            async.whilst(
              function() {return another},
              function(callback) {
                rl.question("Command: ", function(answer){
                  initCommands.push(answer);
                  rl.question("Another? ", function(answer){
                    if(answer.match('^[Yy]') != null) {
                      another = true;
                    } else {
                      another = false;
                    }
                    callback();
                  });
                });
              },
              function() {
                callback(null, initCommands);
              }
            );
          } else {
            callback(null, false);
          }
        });
      }
    },
    function(err, results){
      module.exports.write(markerFileName, results);
      if(config.destination) {
        rl.question("Update now? ", function(answer){
          rl.close();
          if(answer.match('^[Yy]') != null) {
            require('./update').update(process.cwd() + path.sep + markerFileName);
          } else {
            console.log(clc.green('Done.'));
          }
        });
      } else {
        rl.close();
        console.log(clc.green('Done.'));
      }
    });
  }
}
