var express = require('express');
var router = express.Router();

router.get('/next', function(req, res, next) {

  var val = "Hello World !";

  // Ceci pour le debugg
  console.log(val);

  // On revient sur la page de l'examen
  res.render('examination');
});

module.exports = router;
