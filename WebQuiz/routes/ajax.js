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

/* TP3 : 
router.get('/examhtml', function(req, res, next) {
    var nbquestion = req.param("nbquestion");
    //nbquestion = req.param("nbquestion");
    questionsrestantes = nbquestion - 1;
    console.log(nbquestion);
    res.json(eval(questions[questionsrestantes]));
    console.log(questions[questionsrestantes]);
});

router.get('/examcss', function(req, res, next) {
    var nbquestion = req.param("nbquestion");
    //nbquestion = req.param("nbquestion");
    questionsrestantes = nbquestion - 1 + 10;
    console.log(questionsrestantes);
    res.json(eval(questions[questionsrestantes]));
});

router.get('/examjavascript', function(req, res, next) {
    var nbquestion = req.param("nbquestion");
    //nbquestion = req.param("nbquestion");
    questionsrestantes = nbquestion - 1 + 20;
    console.log(questionsrestantes);
    res.json(eval(questions[questionsrestantes]));
});*/

router.get('/next', function(req, res, next) {
  /*questionsrestantes = questionsrestantes - 1;
  if (questionsrestantes === -1 || questionsrestantes === 9 || questionsrestantes === 19) {
    //console.log("fin de l'examen");
    //COMPLETER LACTION A FAIRE
    // /!\/!\ On fait la redirection vers la page du résultat du coté du client,
    // pas besoin de passer par le serveur (On ne doit récupérer aucune information, la note est du coté client !)
  } else {
    res.json(eval(questions[questionsrestantes]));
    console.log(questions[questionsrestantes]);
  }*/
    //Condition d'arrêt de l'examen (côté serveur)
   /* if (parseInt(questioncourante) === parseInt(nbquestion)-1) {
        console.log("render");
        document.location.href="/examinationResult";
        //res.render('examinationResult', { title: 'WebQuiz : Resulat examen', nav: 'true'});
    } else {*/
      //  console.log("else");
        questioncourante = questioncourante + 1;
        db.getExamQuestions(req, res, questioncourante);   
    //}
});

//TP 4 :

router.post('/ajoutquestion', function(req, res, next) {
    db.createquestion(req,res);
});

router.get('/getnbquestionsrestantes', function(req, res, next) {
    db.getNombreQuestionsRestantes(req,res);
});


module.exports = router;
