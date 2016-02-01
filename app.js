var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var mysql = require('mysql');
var telerivet = require('telerivet');
var config = require('./config.json');
var http =require('http');
var vm = require('vm');
var concat = require('concat-stream');
var child_process = require('child_process');
var jsonfile = require('jsonfile');
var fs = require('fs');

var app = express();

var tr = new telerivet.API(config.TELERIVET_API_KEY);

var stations = config.STATIONS;
var file = './data.json';

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

////////////////////////////DB CONNECTION/////////////////////////////////////////////////////////
var connection = mysql.createConnection({
  host     : config.DB_HOST,
  user     : config.DB_USER,
  password : config.DB_PASSWORD
});

connection.connect(function(err){
  if(err) throw err;
  console.log('You are successfully connected to DB');
  connection.query('USE '+config.DB_NAME);
    console.log('You are successfully connected to test database');

});

///////////////////////////////ROUTERS////////////////////////////////////////////////////////////

app.get('/',function(req,res){
  console.log(__dirname);
  res.sendFile(path.join(__dirname+'/public/templates/index.html'));
});

app.get('/allMessages',function(req,res){
  console.log('alldata');
  connection.query('select * from messages' , function(err , rows){
    res.send(rows);
  });
});

app.post('/webhook',
   function(req, res) {
    console.log('In webhook');
    console.log(req.body);
      var secret = req.body.secret;
      if (secret != config.WEBHOOK_SECRET) {
          res.status(403).end();
          return;
      }
       
      if (req.body.event == 'incoming_message') {
       
        var content = req.body.content;
        var from_number = req.body.from_number;
        var contact_id = req.body.contact_id;
        var phone_id = req.body.phone_id;
        var time = req.body.time_created;
        var obj = {'station_id':getStationId(content) , 'name':extractName(content) , 'username':config.USERNAME , 'password':config.PASSWORD , 'event':config.EVENT};
        jsonfile.writeFileSync(file, obj);
        if(checkSAF(content)){
          if(checkstation(content)){
            var data = {'sender_id' : contact_id , 'sender_number' : from_number ,
                        'content' : content , 'time' : time , 'status' : 1} ;
            AddSMS(data);
            //TODO: to redirect to wards third party javascript file
            submitForm();
            res.json({
                messages: [
                        { content: config.SUCCESS_MESSAGE }
                    ]
                });
          }else{
            var reason = config.FAILURE_MESSAGE ;
            var data = {'sender_id' : contact_id , 'sender_number' : from_number ,
                        'failure_reason' : reason , 'time' : time , 'status' : 0} ;
            AddSMS(data);
            //sendsms({'smsContent' : reason , 'to' : from_number});
            res.json({
                messages: [
                        { content: reason }
                    ]
                });
            }
        }else{
            var reason = config.FAILURE_MESSAGE ;
            var data = {'sender_id' : contact_id , 'sender_number' : from_number ,
                        'failure_reason' : reason , 'time' : time , 'status' : 0} ;
            AddSMS(data);
            //sendsms({'smsContent' : reason , 'to' : from_number});
            res.json({
                messages: [
                        { content: reason }
                    ]
                });
        }
      }  
      res.status(200).end();
   }
);

////////////////////APP SERVER RUNNING///////////////////////////////////////

app.listen(3000, function () {
  console.log('Example app listening on port 3000!');
});

///////////////////////LOCAL FUNCTIONS////////////////////////////////////////


var checkSAF = function(sms){
  console.log(sms);
  key = sms.split(" ")[0] ;
  if(key == "SAF"){
    return 1;
  }else{
    return 0;
  }
}
var checkstation = function(sms){
  console.log(sms);
  key = sms.split(" ")[1] ;
  if(stations.indexOf(parseInt(key)) > -1){
    console.log('station exists!..');
    return 1;
  }else{
    return 0;
  }
}


var sendsms = function(response){
  var project = tr.initProjectById(project_id);

  project.sendMessage({
      content: response.smsContent , 
      to_number: response.to
  }, function(err, message) {

  });
}
var extractMessage = function(sms){ 
  var msg = sms.split(" ")[3] ;
  return msg;
}
var extractName = function(sms){ 
  var msg = sms.split(" ")[2] ;
  return msg;
}
var getStationId = function(sms){ 
  var id = sms.split(" ")[1] ;
  return id;
}
var AddSMS = function(sms){
  console.log(sms);
  var query = connection.query("INSERT INTO messages SET ?" ,sms,
    function(err,rows){
      if(err) throw err;
    });
  console.log(query);
}
var submitForm = function(data){
 var worker_process = child_process.fork("nightwatch.js");

}