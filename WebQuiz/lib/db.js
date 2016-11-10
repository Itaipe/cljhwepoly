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
});
questionSchema.plugin(random);
var Tests = mongoose.model('tests', questionSchema);
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

var ligneExamen = new Schema ({
    id : Number,
    ligne : String
});
var ligneexam = mongoose.model('listeexam', ligneExamen);

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

            new Reponse({
                id : id,
                domaine : domaine,
                bonnerep : bonnerep
            }).save(function(err) {
                if (err !== null) { throw err; }
            });

            //Création de l'objet Question puis insertion dans la base de données
            new Tests({
                id : id,
                domaine : domaine,
                enonce : enonce,
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


exports.getReponseFastTest = function(req, res) {
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
                    stats.find({id: "note"}, function(err, resultsnote) {
                        if (err) { throw err; };
                        nouvellenote = parseInt(resultsnote[0].note);
                    });

                    var docjsonreturn = {
                        nb_fasttest_effectues : nouvellestatvalueeffectue,
                        note_courante : nouvellenote
                    };
                    res.json(eval(docjsonreturn));
                    console.log("Mauvaise réponse !");
                } else {
                    //Si c'est le cas, on récupère la note de l'utilsateur puis on l'incrémente
                    stats.find({id: "note"}, function(err, resultsnote) {
                        if (err) { throw err; };
                        nouvellenote = parseInt(resultsnote[0].note) + 1;
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
                                nb_fasttest_effectues : nouvellestatvalueeffectue,
                                note_courante : nouvellenote
                            };
                            res.json(eval(docjsonreturn));
                        })
                    });
                }
            })
        });
    });
};

exports.postexam = function(req, res) {
    var domaine = req.body.domaine;
    var id = req.body.id;
    var reponsefournie = req.body.reponsefournie;

    Reponse.find({domaine : domaine, id : id}, function (err, results) {
        var bonnerep = results[0].bonnerep;
        if (bonnerep != reponsefournie) {
            stats.find({id: "noteexam"}, function(err, resultsnote) {
                if (err) { throw err; };
                nouvellenote = parseInt(resultsnote[0].note);
                var docjsonreturn = {
                    note_courante : nouvellenote
                };
                res.json(eval(docjsonreturn));
            });
            console.log("Mauvaise réponse !");
        } else {
            stats.find({id: "noteexam"}, function(err, resultsnote) {
                if (err) { throw err; };
                nouvellenote = parseInt(resultsnote[0].note) + 1;
                stats.update({id: "noteexam"}, {note: nouvellenote}, {multi : true}, function (err) {
                    if (err) { throw err; };
                    var docjsonreturn = {
                        note_courante : nouvellenote
                    };
                    res.json(eval(docjsonreturn));
                });
            });
        }
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

exports.getstats = function(req, res) {
    stats.find({id: "nb_fasttest_effectues"}, function(err, resultsfasttesteffectue) {
        if (err) { throw err; };
        var statvalueeffectue = resultsfasttesteffectue[0].statvalue;
        stats.find({id: "nb_fasttest_reussis"}, function(err, resultsfasttestreussi) {
            if (err) { throw err; };
            var statvaluereussi = resultsfasttestreussi[0].statvalue;
            stats.find({id: "nb_exam_effectues"}, function(err, resultsexameffectue) {
                if (err) { throw err; };
                var statvalueexameff = resultsexameffectue[0].statvalue;
                stats.find({id: "nb_exam_abandonnes"}, function(err, resultsexamabandon) {
                    if (err) { throw err; };
                    var statvalueexamabandon = resultsexamabandon[0].statvalue;
                    stats.find({id: "tauxexam"}, function(err, resultstaux) {
                        if (err) { throw err; };
                        var taux = resultstaux[0].statvalue;
                        var docjsonreturn = {
                            nb_fasttest_reussis : statvaluereussi,
                            nb_fasttest_effectues : statvalueeffectue,
                            nb_exam_effectues : statvalueexameff,
                            nb_exam_abandonnes : statvalueexamabandon,
                            tauxexam : taux
                        };
                        res.json(eval(docjsonreturn));
                    });
                });
            });
        });
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

exports.initialize_note_to_zero = function() {
    stats.find({id: "note"}, function(err, resultsnote) {
        if (err) { throw err; };
        stats.update({id: "note"}, {note: 0}, {multi : true}, function (err) {
            if (err) { throw err; };
        });
    });
};


exports.initialize_exam_note = function() {
    stats.find({id: "noteexam"}, function(err, resultsnote) {
        if (err) { throw err; };
        stats.update({id: "noteexam"}, {note: 0}, {multi : true}, function (err) {
            console.log("--------------------------------------------");
            if (err) { throw err; };
        });
    });
};

exports.remiseazero = function() {
    stats.update({id : "nb_fasttest_reussis"}, {statvalue: 0}, {multi : true}, function (err) {
        if (err) { throw err; }
    });
    stats.update({id : "nb_fasttest_effectues"}, {statvalue: 0}, {multi : true}, function (err) {
        if (err) { throw err; }
    });
    stats.update({id : "nb_exam_effectues"}, {statvalue: 0}, {multi : true}, function (err) {
        if (err) { throw err; }
    });
    stats.update({id : "nb_exam_abandonnes"}, {statvalue: 0}, {multi : true}, function (err) {
        if (err) { throw err; }
    });
    stats.update({id : "tauxexam"}, {statvalue: null}, {multi : true}, function (err) {
        if (err) { throw err; }
    });
    stats.update({id : "nb_question_exam_correctes"}, {statvalue: 0}, {multi : true}, function (err) {
        if (err) { throw err; }
    });
    stats.update({id : "nb_question_exam_totales"}, {statvalue: 0}, {multi : true}, function (err) {
        if (err) { throw err; }
    });
    
    ligneexam.remove({}, function(err, removed){
    });
};

exports.getnoteexam = function(req, res) {
    stats.find({id: "noteexam"}, function(err, note) {
        if (err) { throw err; };
        stats.find({id: "nb_question_exam_correctes"}, function(err, nbcorrect) {
            if (err) { throw err; };
            stats.find({id: "nb_question_exam_totales"}, function(err, nbtotal) {
                if (err) { throw err; };
                stats.find({id: "nb_exam_effectues"}, function(err, nbexam) {
                    if (err) { throw err; };
                    res.json({noteexam : note[0].note, nb_question_exam_correctes : nbcorrect[0].statvalue, nb_question_exam_totales : nbtotal[0].statvalue, nb_exam_effectues : nbexam[0].statvalue});
                });
            });
        });
    });
};

exports.getnbexaneffectue = function(req, res) {
    stats.find({id: "nb_exam_effectues"}, function(err, nbexam) {
       res.json({nb_totaux_exam_effectues: nbexam[0].statvalue});  
    });
};

exports.getligneexam = function(req, res) {
    var id = req.param("id");
    ligneexam.find({id: id}, function(err, lignes) {
       res.json({ligne : lignes[0].ligne});  
    });
};

exports.majstatexam = function(req, res) {
    var nb_exam_effectues = req.body.nb_exam_effectues;
    var nb_question_exam_correctes = req.body.nb_question_exam_correctes;
    var nb_question_exam_totales = req.body.nb_question_exam_totales;
    var tauxexam = req.body.tauxexam;

    stats.update({id : "nb_exam_effectues"}, {statvalue: nb_exam_effectues}, {multi : true}, function (err) {
        if (err) { throw err; }
    });

    stats.update({id : "nb_question_exam_correctes"}, {statvalue: nb_question_exam_correctes}, {multi : true}, function (err) {
        if (err) { throw err; }
    });

    stats.update({id : "nb_question_exam_totales"}, {statvalue: nb_question_exam_totales}, {multi : true}, function (err) {
        if (err) { throw err; }
    });

    stats.update({id : "tauxexam"}, {statvalue: tauxexam}, {multi : true}, function (err) {
        if (err) { throw err; }
    });
};

exports.insererexam = function (req, res) {
    console.log("insere exam");
    var id = req.body.id;
    var ligne = req.body.ligne;
    console.log(id);
    console.log(ligne);
    new ligneexam({
        id : id,
        ligne : ligne
    }).save(function(err) {
        if (err !== null) { throw err; }
    });
};

exports.abandonne = function(req, res) {
    stats.find({id: "nb_exam_abandonnes"}, function(err, data) {
        if (err) { throw err; };
        var nb = parseInt(data[0].statvalue) + 1;
        stats.update({id: "nb_exam_abandonnes"}, {statvalue: nb}, {multi : true}, function (err) {
            if (err) { throw err; };
        });
    });
}
