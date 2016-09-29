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

module.exports = router;
