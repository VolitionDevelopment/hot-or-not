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
  db.collection('votes').find({
    ip: req.ip
  }).toArray(function(error, result){
    var photosVoted = [];
    if(error){
      console.log("Error fetching data...");
      console.log(error);
    }else{
      for(var i = 0; i < result.length; i++){
        photosVoted.push(result[i].image);
      }
    }

    console.log(photosVoted);

    db.collection('images').find({
      image: {$nin: photosVoted}
    }).toArray(function(error, photos){
      if(photos.length == 0){
        res.redirect('/standings')
      }else{
        // console.log(photos);
        var randomNum = Math.floor(Math.random() * photos.length);
        var randomPhoto = photos[randomNum].image;

        res.render('index', { imageToRender: randomPhoto });
      }
    });
  });
});

router.get('/standings', function(req, res, next){
  db.collection('images').find().toArray(function(error, allResults){
    var standingsArray = [];
    allResults.sort(function(a,b){
      return (b.totalVotes - a.totalVotes);
    });
    res.render('standings', {theStandings: allResults});
  });

});

router.post('/hotornot', function(req, res, next){
  db.collection('votes').insertOne({
    ip: req.ip,
    vote: req.body.submit,
    image: req.body.image
  });

  db.collection('images').find({image: req.body.image}).toArray(function(error, results){
    var total;
    if (isNaN(results[0].totalVotes)) {
      total = 0;
    } else {
      total = results[0].totalVotes;
    }

    db.collection('images').updateOne(
        {
          image: req.body.image
        },
        {
          $set: (req.body.submit === 'Hot') ? {"totalVotes": (total + 1)} : {"totalVotes": (total - 1)}
        },
        function(error, results){

        }
    )
  });

  res.redirect('/')
});

module.exports = router;