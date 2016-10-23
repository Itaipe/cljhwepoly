var express = require('express');
var router = express.Router();
require('./../public/data/data');

router.get('/next', function(req, res, next) {
  res.json(eval(questions[0]));
  console.log(questions[0]);
});

router.get('/fasttest', function(req, res, next) {
  var numquestion = 2; //a genere aleatoirement entre 0 et 29
  res.json(eval(questions[numquestion]));
  console.log(questions[numquestion]);
  //res.render('fastTest', { title: 'WebQuiz : Test Rapide', nav: 'true', note_courante:''});
});

module.exports = router;
