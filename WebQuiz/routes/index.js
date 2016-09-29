var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'WebQuiz : Accueil', nav: 'false'});
});

router.get('/dashboard', function(req, res, next) {
  res.render('dashboard', { title: 'WebQuiz : Tableau de bord', nav: 'true'});
});

module.exports = router;
