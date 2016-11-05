var express = require('express');
var router = express.Router();
require('./../data');

var db = require('../lib/db');

var questionsrestantes = 0;

router.get('/fasttest', function(req, res, next) {
    db.getRandomQuestion(req, res);
    //console.log("db : " + result); 
    //res.json();
    //res.json(eval(questions[numquestion]));
    //console.log(questions[numquestion]);
});


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
});

router.get('/next', function(req, res, next) {
  questionsrestantes = questionsrestantes - 1;
  if (questionsrestantes === -1 || questionsrestantes === 9 || questionsrestantes === 19) {
    //console.log("fin de l'examen");
    //COMPLETER LACTION A FAIRE
    // /!\/!\ On fait la redirection vers la page du résultat du coté du client,
    // pas besoin de passer par le serveur (On ne doit récupérer aucune information, la note est du coté client !)
  } else {
    res.json(eval(questions[questionsrestantes]));
    console.log(questions[questionsrestantes]);
  }

});

//TP 4 :

/*router.post('/ajouterQuestion', function(req, res, next) {
    console.log("debut ajax post ajout question");
    db.createquestion(req, res);
    var domaine = req.param("field");
    console.log("ajax domaine : " + domaine);
    var enonce = req.param("enonce");
    console.log("ajax enonce : " + enonce);
});*/

module.exports = router;
