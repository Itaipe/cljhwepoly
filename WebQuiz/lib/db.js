var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var bodyParser = require('body-parser');

var random = require('mongoose-simple-random');

//Modèle représentant une question dans la collection "questions" de la BD
var questionSchema = new Schema({
    id : Number,
    domaine : String,
    enonce : String,
    nbreponses : Number,
    reponses : [String],
    bonnerep : Number
});
questionSchema.plugin(random);
var Question = mongoose.model('tests', questionSchema);

//Modèle représentant le nombre de questions par domaine dans la BD (dans la collection nombrequestions)
var nombreQuestionsSchema = new Schema ({
   domaine : String,
   nombrequestions : Number
});
var nombreQuestions = mongoose.model('nombrequestions', nombreQuestionsSchema);

//Connexion à la base de données mongodb hébergée sur mongolab, avec l'utilisateur "user" ayant pour password : "pass"
mongoose.connect('mongodb://user:pass@ds143737.mlab.com:43737/tp4');

exports.createquestion = function(req, res, next) {
    var domaine = req.body.domaine;
    var enonce = req.body.enonce;
    var bonnerep = req.body.bonnerep;
    var nbreponses = req.body.nbreponses;
    var reponses = req.body['reponses[]'];

    /*
    if ( !(domaine === "HTML" || domaine === "CSS" || domaine === "JavaScript")
    || (enonce === "") || (parseInt(nbreponses) < 2) || (nbreponses === "") || (bonnerep === "")
    || (parseInt(bonnerep) < 1) || (parseInt(nbreponses) > parseInt(nbreponses)) || (reponses.length < 2) ) {
        res.status(400);
    } else {
    */
        //détermination de l'id de la question en fonction du domaine
        nombreQuestions.find({domaine : domaine}, function (err, comms) {
            if (err) { throw err; }
            var id = parseInt(comms[0].nombrequestions) + 1;
            //Création de l'objet Question puis insertion dans la base de données
            new Question({
                id : id,
                domaine : domaine,
                enonce : enonce,
                bonnerep: bonnerep,
                nbreponses: nbreponses,
                reponses: reponses
            }).save(function(err, todo, count){

                if(err!==null) {
                    //Si il y a une erreur, on la gère
                    console.log('ERROR : Save not done');

                } else {
                    //Si l'insertion est réussie, on modifie le nombre de questions de la base de données
                    nombreQuestions.update({ domaine : domaine}, { nombrequestions : id }, { multi : true }, function (err) {
                        if (err) {
                            console.log('Error thrown');
                            throw err;
                        }
                        console.log('update ok');
                    });
                    console.log('SUCCESS : Save done');
                    res.json(eval({'data': 'OK'}));
                }
            });

        });
    /*
    }
    */
};

//Récupère une question aléatoire de la base de données (pour les tests rapides)
exports.getRandomQuestion = function(req, res) {
    Question.findOneRandom(function(err, results) {
        if (!err) {
           res.json(results);
        }
    });
};
