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

//Modèle représentant les réponses aux questions fournies
var reponseSchema = new Schema({
   id : Number,
   domaine : String,
   bonnerep : Number
});
var Reponse = mongoose.model('reponses', reponseSchema);

//Modèle représentant le nombre de questions par domaine dans la BD (dans la collection nombrequestions)
var nombreQuestionsSchema = new Schema ({
   domaine : String,
   nombrequestions : Number
});
var nombreQuestions = mongoose.model('nombrequestions', nombreQuestionsSchema);


var statsSchema = new Schema ({
    id : String,
    nbquestionsexamrestantes : Number,
    note : Number,
    statvalue : Number
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

exports.getReponse = function(req, res) {
    var domaine = req.body.domaine;
    var id = req.body.id;
    console.log("id stats : " + id);
    var reponsefournie = req.body.reponsefournie;
    console.log("reponsefournie stats : " + reponsefournie);
    
    //On récupère la réponse correspondant à la question courante
    Reponse.find({domaine : domaine, id : id}, function (err, results) {
        var bonnerep = results[0].bonnerep;
        //On récupère le nombre de fasttest effectués puis on l'incrémente
        stats.find({id: "nb_fasttest_effectues"}, function(err, resultsfasttesteffectue) {
            if (err) { throw err; };
            var nouvellestatvalueeffectue = parseInt(resultsfasttesteffectue[0].statvalue) + 1;
            stats.update({id: "nb_fasttest_effectues"}, {statvalue: nouvellestatvalueeffectue}, {multi : true}, function (err) {
                if (err) { throw err; };
                
                console.log("bonnerep stats : " + bonnerep);

                //On vérifie que la réponse fournie est bonne
                if (bonnerep != reponsefournie) {
                    console.log("Mauvaise réponse !");
                } else {
                    //Si c'est le cas, on récupère la note de l'utilsateur puis on l'incrémente
                    stats.find({id: "note"}, function(err, resultsnote) {
                        if (err) { throw err; };
                        var nouvellenote = parseInt(resultsnote[0].note) + 1;
                        stats.update({id: "note"}, {note: nouvellenote}, {multi : true}, function (err) {
                            if (err) { throw err; };
                        })
                    });
                    //et On récupère le nombre de fasttest réussis puis on l'incrémente
                    stats.find({id: "nb_fasttest_reussis"}, function(err, resultsreussi) {
                        if (err) { throw err; };
                        var nouvellestatvaluereussi = parseInt(resultsreussi[0].statvalue) + 1;
                        stats.update({id: "nb_fasttest_reussis"}, {statvalue: nouvellestatvaluereussi}, {multi : true}, function (err) {
                            if (err) { throw err; };
                            var docjsonreturn = {
                                nb_fasttest_reussis : nouvellestatvaluereussi,
                                nb_fasttest_effectues : nouvellestatvalueeffectue
                            };
                            res.json(docjsonreturn);
                        })
                    });
                }                
            })
        });
    });
};

exports.getBooleanreponsejuste = function(req, res) {
    var domaine = req.param("domaine");
    console.log("domaine db : " + domaine);
    var id = req.param("id");
    console.log("id db : " + id);
    var reponsefournie = req.param("reponsefournie");
    console.log("rep fournie db : " + reponsefournie);
    
    Reponse.find({domaine : domaine, id : id}, function (err, results) {
        console.log("bonnerep db : " + results[0].bonnerep);
        if (results[0].bonnerep != reponsefournie) {
            //var jsonresult = {"questionbonne" : false};
            //console.log("false : " + jsonresult);
            ///res.json(jsonresult);
            console.log("false");
            res.json({questionbonne : false});   
        } else {
            //var jsonresult = {"questionbonne" : true};
            //console.log("true : " + jsonresult);
            //res.json(jsonresult);
            console.log("true");
            res.json({questionbonne : true});   
        }
    });
    console.log("fin bd bollean");
};