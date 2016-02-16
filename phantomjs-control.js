var page = require('webpage').create();
var system = require('system');
var args = system.args;

if (args.length <= 1) {
  console.log('Name and station id are required');
} else {
  
}

page.onResourceReceived = function(response) {
   console.log('Response (#' + response.id + ', stage "' + response.stage + '"): ' + JSON.stringify(response));
};

page.open('http://remotevalue.epitome.com.ng/control.html', function(status) {
    if (status !== 'success') {
        console.log('Unable to access network');
    } else {
        var body = page.evaluate(function(args) {
            var user = document.getElementById('user');
            if(user){
                user.value = args[1];
            }

            var password = document.getElementById('pass');
            if(password){
                password.value = args[2];
            }

            var station = document.getElementById('station');
            if(station){
                station.value = args[3];
            }

            var event_id = document.getElementById('event_name');
            if(event_id){
                event_id.value = args[4];
            }

            // var params = document.getElementById('params');
            // if(params){
            //     params.value = args[5];
            // }

            //document.getElementById('on').click();
        } , args);
        setTimeout(function(){
                console.log('rendering page')
                page.render('./public/control.png');
                setTimeout(function() { phantom.exit(); }, 2000)
            } , 1000)

    }
})


