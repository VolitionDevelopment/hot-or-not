var express = require('express');
var router = express.Router();
var mongodb = require('mongodb');
var mongoClient = mongodb.MongoClient;
var mongoURL = 'mongodb://localhost:27017/hot-or-not';
var db;

mongoClient.connect(mongoURL, function(error, database){
  if(error){
    console.log(error);
  }else{
    db = database;
    console.log('Connected to Mongo Successfully!');
  }
});

router.get('/', function(req, res, next) {
  db.collection('images').find().toArray(function(error, photos){
    var randomNum = Math.floor(Math.random() * photos.length);
    var randomPhoto = photos[randomNum].image;

    res.render('index', { imageToRender: randomPhoto });
  });
});

router.post('/hotornot', function(req, res, next){
  db.collection('votes').insertOne({
    ip: req.ip,
    vote: req.body.submit,
    image: req.body.image
  });

  res.redirect('/')
});

module.exports = router;