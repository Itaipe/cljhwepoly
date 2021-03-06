var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');
require('./../data');

var db = require('../lib/db');

//var questionsrestantes = 0;
var questioncourante = 0;
//var nbquestion = 0;

router.use(bodyParser.json());


router.get('/fasttest', function(req, res, next) {
    db.getRandomQuestion(req, res);
});

router.get('/exam', function(req, res, next) {
    console.log("debutexam");
    //nbquestion = req.param("nbquestion");
    questioncourante = 0;
    //On met à jour le nombre de questions de l'examen sur la base de données
    db.setNombreQuestionsRestantes(req, res, parseInt(req.param("nbquestion")));
    db.getExamQuestions(req, res, questioncourante);

});

router.get('/next', function(req, res, next) {
        questioncourante = questioncourante + 1;
        db.getExamQuestions(req, res, questioncourante);
});

router.post('/ajoutquestion', function(req, res, next) {
    db.createquestion(req,res);
});

router.post('/deleteBD', function(req, res, next) {
    db.deleteBD(req,res);
});

router.get('/getnbquestionsrestantes', function(req, res, next) {
    db.getNombreQuestionsRestantes(req,res);
});

router.get('/nombremaxquestions', function(req, res, next) {
    console.log("debut ajax");
   db.getNombreMaxQuestions(req, res);
   console.log("fin ajax");
});

router.post('/validerfasttest', function(req, res, next) {
    db.getReponseFastTest(req, res);
});

router.post('/repondreexam', function(req, res, next) {
    db.postexam(req, res);
});

router.post('/initialize_exam_note', function(req, res, next) {
    db.initialize_exam_note(req, res);
});

router.post('/initialize_note_to_zero', function(req, res, next) {
    db.initialize_note_to_zero(req, res);
});

router.get('/getbooleanreponsejuste', function(req, res, next) {
    db.getBooleanreponsejuste(req,res);
});

router.get('/getstats', function(req, res, next) {
    db.getstats(req,res);
});

router.post('/remiseazero', function(req, res, next) {
    db.remiseazero(req,res);
});

router.get('/getnoteexam', function(req, res, next) {
    db.getnoteexam(req,res);
});

router.get('/getnbexaneffectue', function(req, res, next) {
    db.getnbexaneffectue(req,res);
});

router.get('/getligneexam', function(req, res, next) {
    db.getligneexam(req,res);
});

router.post('/majstatexam', function(req, res, next) {
    db.majstatexam(req,res);
});


router.post('/abandonne', function(req, res, next) {
    db.abandonne(req,res);
});

router.post('/insererexam', function(req, res, next) {
    db.insererexam(req,res);
});


module.exports = router;
