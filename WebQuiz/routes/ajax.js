var express = require('express');
var router = express.Router();
require('./../public/data/data');

router.get('/next', function(req, res, next) {
  res.json(eval(questions[0]));
  console.log(questions[0]);
});

module.exports = router;
