var express = require('express');
var path = require('path')
var multer  = require('multer')
var router = express.Router({mergeParams: true});
var config = require('./config.json');
var mongoose = require('mongoose');
var image = require('./models/image');

var s3 = require('multer-s3');

var AWS_ACCESS_KEY = config.AWS_ACCESS_KEY;
var AWS_SECRET_KEY = config.AWS_SECRET_KEY;
var S3_BUCKET = config.S3_BUCKET
var S3_REGION = config.S3_REGION

var upload = multer({
  storage: s3({
    dirname: 'images',
    bucket: S3_BUCKET,
    secretAccessKey: AWS_SECRET_KEY,
    accessKeyId: AWS_ACCESS_KEY,
    region: S3_REGION,
    filename: function (req, file, cb) {
      cb(null, Date.now() + file.originalname)
    }
  })
})

router.get('/images',function(req,res){
  
  image.find(function(err,data){
    if(err) console.log(err);
    else {
      res.send(data);
    }
  });
});

router.delete('/images/:id',function(req,res){
 
  image.remove({ _id: req.params.id }, function(err) {
    if (err) {
      res.status(500).end()
    }
    else {
      res.status(200).end();
    }
  });
});


router.get('/' , function(req , res , next){
	res.sendFile(path.join(__dirname+'/public/templates/upload.html'));
})

router.post('/', upload.single('file') , function (req, res, next) {
	if(req.file){
		var url = 'https://s3-' + S3_REGION + '.amazonaws.com/' +  S3_BUCKET + '/' + req.file.key;
		var img = new image({url : url , name : req.body.name.toLowerCase()});
		img.save(function(err , data){
		    if (err) {
		    	console.log(err);
		    	res.status(500).end(err);
		    }
		    else {
		    	res.json(data);
		    }
		 });
	}
})


module.exports = router;