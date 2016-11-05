var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Questionschema = new Schema({
    domaine : String,
    enonce : String
});


var Todo = mongoose.model('Question', Questionschema);

//var Question = mongoose.model('Question');

mongoose.connect('mongodb://user:pass@ds143737.mlab.com:43737/tp4');

exports.createquestion = function(req, res) {
    console.log("debut create !!!");
    var domaine = req.param("field");
    console.log("db domaine : " + domaine);
    var enonce = req.param("enonce");
    console.log("db enonce : " + enonce);
    new Todo({
        domaine : domaine,
        enonce : enonce
    }).save(function(err, todo, count){
        res.redirect('/dashboard');
        //Retourner l'objet créer si err=null, sinon retourner une erreur : 400, 404 ect selon la situation
    });
};
