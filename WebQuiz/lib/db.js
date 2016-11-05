var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var bodyParser = require('body-parser');

var random = require('mongoose-simple-random');

var questionSchema = new Schema({
    id : Number,
    domaine : String,
    enonce : String,
    nbreponses : Number,
    reponses : [String],
    bonnerep : Number
});

questionSchema.plugin(random);

var Question = mongoose.model('questions', questionSchema);

mongoose.connect('mongodb://user:pass@ds143737.mlab.com:43737/tp4');

exports.createquestion = function(req, res) {
    console.log("debut create !!!");
    var domaine = req.body.domaine;
    console.log("db domaine : " + domaine);
    var enonce = req.body.enonce;
    console.log("db enonce : " + enonce);
    new Question({
        domaine : domaine,
        enonce : enonce
    }).save(function(err, todo, count){

        console.log("Données push avec succès dans la base de donnée");

        // C'est ici qu'il faut envoyer une confirmation de la sauvegarde dans la base de donnée
        res.send("Données push avec succès dans la base de donnée");

        // Il faut aussi gérer le cas ou il y a une erreur
    });
};

exports.getRandomQuestion = function(req, res) {
    Question.findOneRandom(function(err, results) {
        if (!err) {
           res.json(results);
           console.log("db : " + results);
        }
    });
};
