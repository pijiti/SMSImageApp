var path = require('path')
var childProcess = require('child_process')
var phantomjs = require('phantomjs-prebuilt')
var binPath = phantomjs.path

var childArgs = [
  path.join(__dirname, 'phantomjs-sharefeel.js'),
  'ahmed'
]
 
var child = childProcess.execFile(binPath, childArgs, function(err, stdout, stderr) {
  // handle results 

})

child.stdout.on('data', function(data) {
    console.log('stdout: ' + data);
});
child.stderr.on('data', function(data) {
    console.log('stderr: ' + data);
});
child.on('close', function(code) {
    console.log('closing code: ' + code);
});