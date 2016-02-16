var express = require('express');
var path = require('path')
var jsonfile = require('jsonfile');
var router = express.Router({mergeParams: true});

router.get('/:id/data.json' , function(req , res , next){
  var file = req.params.id + '.json';
  jsonfile.readFile(file, function(err, obj) {
    if(err) res.json({});
    else res.json(obj);
  })
})
module.exports = router;