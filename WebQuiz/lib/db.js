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
var Tests = mongoose.model('tests', questionSchema);

//Modèle représentant le nombre de questions par domaine dans la BD (dans la collection nombrequestions)
var nombreQuestionsSchema = new Schema ({
   domaine : String,
   nombrequestions : Number
});
var nombreQuestions = mongoose.model('nombrequestions', nombreQuestionsSchema);


var statsSchema = new Schema ({
    id : String,
    nbquestionsexamrestantes : Number
});
var stats = mongoose.model('stats', statsSchema);

//Connexion à la base de données mongodb hébergée sur mongolab, avec l'utilisateur "user" ayant pour password : "pass"
mongoose.connect('mongodb://user:pass@ds143737.mlab.com:43737/tp4');


exports.createquestion = function(req, res, next) {
    var domaine = req.body.domaine;
    var enonce = req.body.enonce;
    var bonnerep = req.body.bonnerep;
    var nbreponses = req.body.nbreponses;
    var reponses = req.body['reponses[]'];

    console.log(enonce);

    // Validation du formulaire de création de question (Côté serveur)
    if ( enonce === "" || domaine==="" || reponses.length < 2 || reponses[0] === ""
    || reponses[1] === "" || nbreponses === "" || bonnerep === ""  || parseInt(bonnerep) < 1
    || parseInt(bonnerep) > parseInt(nbreponses) ) {

        console.log("Erreur 400 envoyée au client");
        res.status(400);
        res.end();

    } else {

        //détermination de l'id de la question en fonction du domaine
        nombreQuestions.find({domaine : domaine}, function (err, comms) {
            if (err) { throw err; }
            var id = parseInt(comms[0].nombrequestions) + 1;
            //Création de l'objet Question puis insertion dans la base de données
            new Tests({
                id : id,
                domaine : domaine,
                enonce : enonce,
                bonnerep: bonnerep,
                nbreponses: nbreponses,
                reponses: reponses
            }).save(function(err, todo, count){

                if(err!==null) {
                    //Si il y a une erreur
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
    }
};

//Récupère une question aléatoire de la base de données (pour les tests rapides)
exports.getRandomQuestion = function(req, res) {
    Question.findOneRandom(function(err, results) {
        if (!err) {
           res.json(results);
        }
    });
};

exports.getExamQuestions = function(req, res, questioncouranteexam) {
    //console.log("debut getquestions");
    var field = req.param("field");
    //console.log("field : " + field);
    var query = Question.find({domaine : field});

    query.exec(function(err, results) {
        if (!err) {
           //console.log("results quest courante : " + results[questioncouranteexam]);
           res.json(results[questioncouranteexam]);
        }
    });
};

exports.setNombreQuestionsRestantes = function(req, res, nbquestion) {
    stats.update({id: "questionsrestantes"}, {nbquestionsexamrestantes : nbquestion} , { multi : true }, function (err) {
        if (err) { throw err; }
        console.log('update ok');
    });
};

exports.getNombreQuestionsRestantes = function(req, res) {
    //On récupère le nombre de questions restantes qu'on envoie au client
    stats.find({id: "questionsrestantes"}, function (err, data) {
        if (err) { throw err; }
        res.json(data);
        //Puis on décrémente ce nombre (pour update l'avancée de l'examen)
        var nouveaunombrequestions = parseInt(data[0].nbquestionsexamrestantes) - 1;
        stats.update({id: "questionsrestantes"}, {nbquestionsexamrestantes : nouveaunombrequestions} , { multi : true }, function (err) {
            if (err) { throw err; }
            console.log('decrementation ok');
        });
    });
};

exports.getNombreMaxQuestions = function(req, res) {
    var domaine = req.param("field");
    nombreQuestions.find({domaine : domaine}, function (err, results) {
        if (err) { throw err; }
        res.json(results);
    });
};

// Supprime toutes les questions de la base de donnée.
exports.deleteBD = function(rea, res, next) {
    Tests.remove({}, function(err, removed){
        if(err != null) {
            res.json(eval({'data': 'Error : BD can not be deleted'}));
        } else {
            res.json(eval({'data': 'Success : BD deleted'}));
        }
    });
};
