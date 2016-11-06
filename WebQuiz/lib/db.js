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
var Question = mongoose.model('questions', questionSchema);

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

exports.createquestion = function(req, res) {
    var domaine = req.body.domaine;
    var enonce = req.body.enonce;
    console.log(domaine);
    
    //détermination de l'id de la question en fonction du domaine
    nombreQuestions.find({domaine : domaine}, function (err, comms) {
        if (err) { throw err; }
        var id = parseInt(comms[0].nombrequestions) + 1;
        //Création de l'objet Question puis insertion dans la base de données        
        new Question({
            id : id,
            domaine : domaine,
            enonce : enonce
        }).save(function(err, todo, count){
            
            if(err!==null) {
                //Si il y a une erreur, on la gère
                
            } else {
                //Si l'insertion est réussie, on modifie le nombre de questions de la base de données
                nombreQuestions.update({ domaine : domaine}, { nombrequestions : id }, { multi : true }, function (err) {
                    if (err) { throw err; }
                    console.log('update ok');
                });
                
                console.log("Données push avec succès dans la base de donnée");

                // C'est ici qu'il faut envoyer une confirmation de la sauvegarde dans la base de donnée
                res.send("Données push avec succès dans la base de donnée");

                // Il faut aussi gérer le cas ou il y a une erreur
            }            
        });
    });
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