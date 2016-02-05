var page = require('webpage').create();
var system = require('system');
var args = system.args;

if (args.length <= 1) {
  console.log('Name and station id are required');
} else {
  
}

page.open('http://remotevalue.epitome.com.ng/shareAFeeling.html', function(status) {
    if (status !== 'success') {
        console.log('Unable to access network');
    } else {
        var body = page.evaluate(function(args) {
            var input = document.getElementsByName('msg1')[0];

            if(input){
                input.value = args[1];
            }
            document.getElementById('btn1').click();
        } , args);
        setTimeout(function(){
                console.log('rendering page')
                page.render('./public/shareAFeeling.png');
                setTimeout(function() { phantom.exit(); }, 2000)
            } , 1000)

    }
})


