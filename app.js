var express = require('express');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var telerivet = require('telerivet');
var config = require('./config.json');
var http =require('http');
var vm = require('vm');
var jsonfile = require('jsonfile');
var fs = require('fs');
var mongoose = require('mongoose');
var aws = require('aws-sdk');
var image = require('./models/image');

var path = require('path')
var childProcess = require('child_process')
var phantomjs = require('phantomjs-prebuilt')
var binPath = phantomjs.path

var app = express();

var tr = new telerivet.API(config.TELERIVET_API_KEY);

var stations = config.STATIONS;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

var AWS_ACCESS_KEY = config.AWS_ACCESS_KEY;
var AWS_SECRET_KEY = config.AWS_SECRET_KEY;
var S3_BUCKET = config.S3_BUCKET

mongoose.connect(config.DB_URI);

// CONNECTION EVENTS
// When successfully connected
mongoose.connection.on('connected', function () {  
  console.log('Mongoose default connection opened');
}); 

// If the connection throws an error
mongoose.connection.on('error',function (err) {  
  console.log('Mongoose default connection error: ' + err);
}); 

// When the connection is disconnected
mongoose.connection.on('disconnected', function () {  
  console.log('Mongoose default connection disconnected'); 
});
////////////////////////////////////MONGODB SCHEMA///////////////////////////////////////////////////////////
var Schema = mongoose.Schema;
var messages = new Schema({sender_id:String , 
                            sender_number: String ,
                            content:String ,
                            displayed_content : String,
                            time:String ,
                            status:Boolean,
                            failure_reason:String});
var message = mongoose.model('message', messages);

///////////////////////////////ROUTERS////////////////////////////////////////////////////////////

var upload = require('./upload');
app.use('/upload' , upload);

var json = require('./json');
app.use('/json' , json);

app.get('/',function(req,res){
  res.sendFile(path.join(__dirname+'/public/templates/index.html'));
});

app.delete('/sms/:id',function(req,res){
  message.remove({ _id: req.params.id }, function(err) {
    if (err) {
      res.status(500).end()
    }
    else {
      res.status(200).end();
    }
  });
});

app.get('/allMessages',function(req,res){
  
  message.find(function(err,data){
    if(err) console.log(err);
    else {
      res.send(data);
    }
  });
});

app.post('/webhook',
   function(req, res) {
    console.log('In webhook');
    //console.log(req.body);
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
        // var obj = {'station_id':getStationId(content) , 'name':extractName(content) , 'username':config.USERNAME , 'password':config.PASSWORD , 'event':config.EVENT};
        // jsonfile.writeFileSync(file, obj);
        if(checkSAF(content)){
          if(checkstation(content)){
            var data = {'sender_id' : contact_id , 'sender_number' : from_number ,
                        'content' : content , 'displayed_content' : extractName(content) , 'time' : time , 'status' : 1} ;
            AddSMS(data);
            //TODO: to redirect to wards third party javascript file
            data.station_id = getStationId(content);
            data.name = extractName(content);
            var image_name = extractImage(content);

            image.findOne({name : (image_name || '').toLowerCase()} , function(err , image){
              if(err) throw err;
              else{
                data.image = image;
                //submitForm(data);
                var file = './' + data.station_id+'.json';

                var obj = {'name':data.name , 'url' : image.url};
                jsonfile.writeFileSync(file, obj);
                res.json({
                messages: [
                        { content: config.SUCCESS_MESSAGE} 
                    ]
                });
              }
            })             
            

          }else{
            var reason = config.FAILURE_MESSAGE ;
            var data = {'sender_id' : contact_id , 'sender_number' : from_number ,
                        'failure_reason' : reason , 'time' : time , 'status' : 0 , 'content' : content} ;
            AddSMS(data);
            res.json({
                messages: [
                        { content: reason }
                    ]
                });
            }
        }else{
            var reason = config.FAILURE_MESSAGE ;
            var data = {'sender_id' : contact_id , 'sender_number' : from_number ,
                        'failure_reason' : reason , 'time' : time , 'content' : content, 'status' : 0} ;
            AddSMS(data);
            //sendsms({'smsContent' : reason , 'to' : from_number});
            res.json({
                messages: [
                        { content: reason }
                    ]
                });
        }
      }  
      //res.status(200).end();
   }
);

////////////////////APP SERVER RUNNING///////////////////////////////////////

app.listen(process.env.PORT || 3000, function () {
  console.log('Example app listening on port 3000!');
});

///////////////////////LOCAL FUNCTIONS////////////////////////////////////////


var checkSAF = function(sms){
  key = sms.split(" ")[0] ;
  if(key && config.COMPAIGN_CODE && key.toLowerCase() == config.COMPAIGN_CODE.toLowerCase()){
    return 1;
  }else{
    return 0;
  }
}
var checkstation = function(sms){
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
  msg = msg.split('//')[0];
  return msg;
}
var extractImage = function(sms){ 
  var msg = sms.split(" ")[2] ;
  msg = msg.split('//')[1];
  return msg;
}
var getStationId = function(sms){ 
  var id = sms.split(" ")[1] ;
  return id;
}
var AddSMS = function(sms){
  // console.log(sms);
  // var query = connection.query("INSERT INTO messages SET ?" ,sms,
  //   function(err,rows){
  //     if(err) throw err;
  //   });
  // console.log(query);
  var msg = new message(sms);
  msg.save(function(err,data){
    if(err) console.log(err);
    else console.log('saved: ',data);
  });
}
var submitForm = function(data){
    // console.log(data)
    // var shareFeelArgs = [
    //     path.join(__dirname, 'phantomjs-sharefeel.js'),
    //     data.name , data.station_id
    // ]

    // var shareFeel = childProcess.execFile(binPath, shareFeelArgs, function(err, stdout, stderr) {
      
    // })

    // shareFeel.stdout.on('data', function(data) {
    //     console.log('stdout: ' + data);
    // });
    // shareFeel.stderr.on('data', function(data) {
    //     console.log('stderr: ' + data);
    // });
    // shareFeel.on('close', function(code) {
    //     console.log('closing code: ' + code);
    // });

    // var sendCommandArgs = [
    //     path.join(__dirname, 'phantomjs-sendcommand.js'),
    //     config.USERNAME , config.PASSWORD , data.station_id , config.EVENT , data.name
    // ]

    // var sendCommand = childProcess.execFile(binPath, sendCommandArgs, function(err, stdout, stderr) {
      
    // })

    // sendCommand.stdout.on('data', function(data) {
    //     console.log('stdout: ' + data);
    // });
    // sendCommand.stderr.on('data', function(data) {
    //     console.log('stderr: ' + data);
    // });
    // sendCommand.on('close', function(code) {
    //     console.log('closing code: ' + code);
    // });

    var controlArgs = [
        path.join(__dirname, 'phantomjs-control.js'),
        config.USERNAME , config.PASSWORD , data.station_id , config.EVENT
    ]

    var control = childProcess.execFile(binPath, controlArgs, function(err, stdout, stderr) {
      
    })

    control.stdout.on('data', function(data) {
        console.log('stdout: ' + data);
    });
    control.stderr.on('data', function(data) {
        console.log('stderr: ' + data);
    });
    control.on('close', function(code) {
        console.log('closing code: ' + code);
    });
}
var checkMongo = function(){

  var m = new message({sender_id:'22' ,
                    sender_number:'03215991429' ,
                    content:'Hello!..' ,
                    failure_reason:'Ambigous',
                    status:1});
  m.save(function(err , data){
    if (err) console.log(err);
    else console.log('Saved : ', data );
  });
}