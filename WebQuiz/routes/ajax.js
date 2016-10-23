var express = require('express');
var router = express.Router();

router.get('/next', function(req, res, next) {

  var val = "Avec JSON !";
  // Ceci pour le debugg
  console.log(val);


  var question = {
      "id" : 1,
      "domaine" : "ExDomaine",
      "enonce" : "Exemple de question",
      "reponses" : ["réponse 1", "réponse 2", "réponse 3"]
  };

  res.json(eval(question));
  //console.log(question);
  // On revient sur la page de l'examen
  //res.render('examination');
});

module.exports = router;
