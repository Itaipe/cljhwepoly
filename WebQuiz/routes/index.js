var express = require('express');
var router = express.Router();
var db = require('../lib/db');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'WebQuiz : Accueil', nav: 'false'});
});

router.get('/dashboard', function(req, res, next) {
  res.render('dashboard', { title: 'WebQuiz : Tableau de bord', nav: 'true'});
});

router.get('/examination', function(req, res, next) {
  res.render('examination', { title: 'WebQuiz : Examen', nav: 'true', note_courate:''});
});

router.get('/examination2', function(req, res, next) {
  res.render('examination2', { title: 'WebQuiz : Examen', nav: 'true', note_courante:'1/1'});
});

router.get('/examinationResult', function(req, res, next) {
  res.render('examinationResult', { title: 'WebQuiz : Resulat examen', nav: 'true'});
});

router.get('/fastTest', function(req, res, next) {
  res.render('fastTest', { title: 'WebQuiz : Test Rapide', nav: 'true', note_courante:''});
});

router.get('/fastTest2', function(req, res, next) {
  res.render('fastTest2', { title: 'WebQuiz : Test Rapide', nav: 'true', note_courante:'1/1'});
});

router.get('/results', function(req, res, next) {
  res.render('results', { title: 'WebQuiz : Resultats', nav: 'true'});
});

router.get('/instructions', function(req, res, next) {
  res.render('instructions', { title: 'WebQuiz : Instructions', nav: 'true'});
});


//TP 4 : 

router.get('/ajouterQuestion', function(req, res, next) {
    console.log("router.get ajouterquestion")
  res.render('ajouterQuestion', { title: 'WebQuiz : Ajouter Question', nav: 'true'});
});

router.post('/ajouterQuestion', function(req, res){
    console.log("router.post ajouter question");
    db.createquestion(req,res);
});

module.exports = router;
