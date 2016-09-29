var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'WebQuiz : Accueil', nav: 'false'});
});

router.get('/dashboard', function(req, res, next) {
  res.render('dashboard', { title: 'WebQuiz : Tableau de bord', nav: 'true'});
});

router.get('/examination', function(req, res, next) {
  res.render('examination', { title: 'WebQuiz : Examen', nav: 'true'});
});

router.get('/examination2', function(req, res, next) {
  res.render('examination2', { title: 'WebQuiz : Examen', nav: 'true'});
});

router.get('/examinationResult', function(req, res, next) {
  res.render('examinationResult', { title: 'WebQuiz : Resulat examen', nav: 'true'});
});

router.get('/fastTest', function(req, res, next) {
  res.render('fastTest', { title: 'WebQuiz : Test Rapide', nav: 'true'});
});

router.get('/fastTest2', function(req, res, next) {
  res.render('fastTest2', { title: 'WebQuiz : Test Rapide', nav: 'true'});
});

router.get('/results', function(req, res, next) {
  res.render('results', { title: 'WebQuiz : Resultats', nav: 'true'});
});

router.get('/instructions', function(req, res, next) {
  res.render('instructions', { title: 'WebQuiz : Instructions', nav: 'true'});
});

module.exports = router;
