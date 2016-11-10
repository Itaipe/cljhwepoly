$(function(){

    // pour la page ajout de question.
    var r = 2; // c'est le numero de la reponse de la question qui est en train d'etre ajouter par un administrateur.

    var titre = $(document).attr('title');

    /*Nombre de questions total de l'examen, demandé par l'utilisateur
      (stocké en localstorage car pas critique vu que c'est l'utilisateur lui même qui le renseigne) */
    var nbquestionexam = 0;

    var laBonneReponse = 0; // La variable qui contient la bonne réponse d'une quesiton
    var note = 0; // Variable contenant la note

    var nbquestionfasttest = 1;


    //Affichage des bonnes statistiques au chargement de la page
    $.getJSON("/ajax/getstats", function(data) {
        $(".nb_fasttest_effectues").text(data.nb_fasttest_effectues);
        $(".nb_fasttest_reussis").text(data.nb_fasttest_reussis);
        $(".nb_exam_effectues").text(data.nb_exam_effectues);
        $(".nb_exam_abandonnes").text(data.nb_exam_abandonnes);
        if (data.tauxexam === null) {
            $(".tauxexamphrase").text("Aucun examen n'a été effectué pour l'instant");
        } else {
            $(".tauxexam").text(data.tauxexam + " % ");
        }
    });
    /*if (localStorage.getItem("nb_fasttest_effectues") !== null) {
        $(".nb_fasttest_effectues").text(localStorage.getItem("nb_fasttest_effectues"));
    }
    if (localStorage.getItem("nb_fasttest_reussis") !== null) {
        $(".nb_fasttest_reussis").text(localStorage.getItem("nb_fasttest_reussis"));
    }
    if (localStorage.getItem("nb_exam_effectues") !== null) {
        $(".nb_exam_effectues").text(localStorage.getItem("nb_exam_effectues"));
    }
    if (localStorage.getItem("nb_exam_abandonnes") !== null) {
        $(".nb_exam_abandonnes").text(localStorage.getItem("nb_exam_abandonnes"));
    }
    if (localStorage.getItem("tauxexam") === null) {
        $(".tauxexamphrase").text("Aucun examen n'a été effectué pour l'instant");
    } else {
        $(".tauxexam").text(localStorage.getItem("tauxexam") + " % ");
    }*/

    //Si on vient de charger la page test rapide, on génère une question aléatoire
    if (titre === 'WebQuiz : Test Rapide') {

        $.post('/ajax/initialize_note_to_zero', function() {});

        $.getJSON("/ajax/fasttest", function(data) {
            //laBonneReponse = data.bonnerep;
            //On stocke dans la session courante l'id et le domaine de la question pour pouvoir ensuite récupérer la réponse associée
            //alert("idfasttestcourant set : " + data.id);
            sessionStorage.setItem("idquestioncourante", data.id);
            //alert("iddomainecourant set : " + data.domaine);
            sessionStorage.setItem("domainecourant", data.domaine);

            //sessionStorage.setItem("bonneReponse", laBonneReponse);
            // Cette variable est mise dans la sessionStorage pour pouvoir la récupérer dans les fonctions qui permettent de gérer le drag and drop

            nbquestionfasttest = 1;
            $("#idquestion").text(nbquestionfasttest);
            $("#domaine").text(data.domaine);
            $("#enonce").text(data.enonce);
            for (i = 0; i < data.nbreponses; i++) {
                $('.answer').prepend("<label draggable='true' ondragstart='drag(event)' id=\"answer" + i + "\" for=\"" + i + "\"><input type=\"hidden\" name=\"answer\" value=\"" + (i+1) + "\" id=\"" + i + "\"><span id=\"span" + i + "\"></span></label><br>");
                $('#span'+i).text("  " + data.reponses[i]);
            }
        });
    }

    if (titre === 'WebQuiz : Examen') {

        $.post('/ajax/exam_in_progress', function(req, res) {});

        if(typeof(Storage) !== "undefined"){
            var field = sessionStorage.getItem("field");
            nbquestionexam = sessionStorage.getItem("nbquestion");
            //nbquestionsexamrestantes = nbquestionexam;
        } else {
            alert("Votre navigateur n'est pas compatible avec le stockage dans une session local");
        }
        //alert("field : " + field);
        //alert("nbquestion : " + nbquestion);
        //$.getJSON("/ajax/exam" + field + "?nbquestion=" + nbquestionexam, function(data) { //Modif TP4
        $.getJSON("/ajax/exam" + "?nbquestion=" + nbquestionexam + "&field=" + field, function(data) {
            //laBonneReponse = data.bonnerep;

            //sessionStorage.setItem("bonneReponse", laBonneReponse);
            // Cette variable est mise dans la sessionStorage pour pouvoir la récupérer dans les fonctions qui permettent de gérer le drag and drop

           sessionStorage.setItem("idquestioncourante", data.id);

            $("#nombrequestion").text(nbquestionexam);
            $("#idquestion").text(1);
            $("#domaine").text(data.domaine);
            //On stocke le domaine courant dans la session pour que l'on puisse l'afficher ensuite dans la bonne catégorie sur la page de résultats (détails)
            var domaine = data.domaine;
            if (sessionStorage.getItem("domaine") !== domaine) {
                sessionStorage.setItem("domaine", domaine);
            }
            sessionStorage.setItem("domainecourant", data.domaine);
            $("#enonce").text(data.enonce);
            for (i = 0; i < data.nbreponses; i++) {
                $('.answer').prepend("<label draggable='true' ondragstart='drag(event)' id=\"answer" + i + "\" for=\"" + i + "\"><input type=\"hidden\" name=\"answer\" value=\"" + (i+1) + "\" id=\"" + i + "\"><span id=\"span" + i + "\"></span></label><br>");
                $('#span'+i).text("  " + data.reponses[i]);
            }
        });
    }

    //A MAJ
    if (titre === 'WebQuiz : Resulat examen') {
        var result = sessionStorage.getItem("note");
        var nombreTotaleDeQuestion = sessionStorage.getItem("nbquestion");
        // ICI IL RESTE PLUS QU'A SAUVEGARDER LA note DANS LA SESSION AFIN QU'ELLE APPARAISSE DANS LES STATS
        $("#noteFinale").text(result + "/" + nombreTotaleDeQuestion);

        //Si l'examen a été abandonné (n'a pas été effectué), on ne fait rien
        if(sessionStorage.getItem("examcourantabandonne")==="true") {
            sessionStorage.setItem("examcourantabandonne", "false");
            $("#message").text("Vous avez abandonné l'examen. Il ne sera donc pas pris en compte pour la moyenne des examens effectués.");
        } else {
            //Si c'est le premier examen effectué, on met la variable initiale à 0
            if (localStorage.getItem("nb_exam_effectues") === null) {
                localStorage.setItem("nb_exam_effectues", 0);
            }
            //On incrémente de 1 le nombre d'examens effetués
            var nb_exam_effectues = parseInt(localStorage.getItem("nb_exam_effectues")) + 1;
            localStorage.setItem("nb_exam_effectues", nb_exam_effectues);
            $(".nb_exam_effectues").text(nb_exam_effectues);

            //Affichage du message de fin d'examen
            var notemessage = parseInt(100 * (parseInt(result) / parseInt(nombreTotaleDeQuestion)));
            if (notemessage < 25) {
                $("#message").text("Aïe, ça ne vas pas du tout !");
            } else if (notemessage < 50) {
                $("#message").text("Votre note n'est pas très bonne, vous pouvez progresser!");
            } else if (notemessage < 75) {
                $("#message").text("C'est bien mais vous pouvez encore mieux faire!");
            } else {
                $("#message").text("Excellent, félicitations !");
            }

            //Calcul du nouveau taux de réussite des examens effectués
            if(localStorage.getItem("nb_question_exam_correctes")===null){
                var nb_question_exam_correctes = parseInt(result);
            } else {
                var nb_question_exam_correctes = parseInt(result) + parseInt(localStorage.getItem("nb_question_exam_correctes"));
            }
            if (localStorage.getItem("nb_question_exam_totales")===null) {
                var nb_question_exam_totales = nombreTotaleDeQuestion;
            } else {
                var nb_question_exam_totales = parseInt(nombreTotaleDeQuestion) + parseInt(localStorage.getItem("nb_question_exam_totales"));
            }
            localStorage.setItem("nb_question_exam_correctes", nb_question_exam_correctes);
            localStorage.setItem("nb_question_exam_totales", nb_question_exam_totales);
            var tauxexam = parseInt(100 * (nb_question_exam_correctes / nb_question_exam_totales));
            localStorage.setItem("tauxexam", tauxexam);
            $(".tauxexam").text(tauxexam + " % ");

            var now = new Date();
            var annee   = now.getFullYear();
            var mois    = now.getMonth() + 1;
            var jour    = now.getDate();
            var heure   = now.getHours();
            if (parseInt(heure) < 10) {
                heure = "0"+heure;
            }
            var minute  = now.getMinutes();
            if (parseInt(minute) < 10) {
                minute = "0"+minute;
            }
            var seconde = now.getSeconds();
            if (parseInt(seconde) < 10) {
                seconde = "0"+seconde;
            }
            var domaine = sessionStorage.getItem("domaine");
            //Insertion de l'examen dans la BD localStorage
            var ligne_exam = {
                domaine : domaine,
                note : result + "/" + nombreTotaleDeQuestion,
                date : jour + "/" + mois + "/" + annee,
                heure : heure + ":" + minute + ":" + seconde
            };
            var ligne_exam_json = JSON.stringify(ligne_exam);
            localStorage.setItem("ligne_exam_" + localStorage.getItem("nb_exam_effectues"), ligne_exam_json);
        }
    }

    //Quand on est déja en test rapide, pour obtenir une nouvelle question lorsqu'on valide
    $('#validerfasttest').on('click', function(e){

        $('#chosenAnswer').css('background-color', '#F5F5F5'); // Remet la couleur de base de la case où l'utilisateur dépose la réponse

        var reponseCourante = $('#chosenAnswer input[name=answer]').val(); // La réponse de l'utilisateur
        //console.log("Réponse de l'utilisateur: " + reponseCourante);
        //console.log("La bonne réponse: " + laBonneReponse);

        var reponseJson = {
            reponsefournie : reponseCourante,
            id : sessionStorage.getItem("idquestioncourante"),
            domaine : sessionStorage.getItem("domainecourant")
        };
        $.ajax({
            type: 'POST',
            url: '/ajax/validerfasttest',
            dataType: 'json',
            data: reponseJson,
            success: function(data) {
                console.log('SUCCESS : Save done : ' + data.data);
                $(".nb_fasttest_reussis").text(data.nb_fasttest_reussis);
                $(".nb_fasttest_effectues").text(data.nb_fasttest_effectues);
                $("#nbquestionreussies").text(data.note_courante);
            },
            error: function() {
                console.log('Erreur dans le post de la réponse courante');
            }
        });
        /*if (laBonneReponse != reponseCourante)
        {
            console.log("Mauvaise réponse !");
        } else {
            console.log("Bonne réponse !");
            note++;
            //Si la réponse est juste, on change le nombre de fasttest réussis dans les statistiques (et donc dans la BD locale).
            if (localStorage.getItem("nb_fasttest_reussis") === null) {
                localStorage.setItem("nb_fasttest_reussis", 0);
            }
            var nb_fasttest_reussis = parseInt(localStorage.getItem("nb_fasttest_reussis")) + 1;
            localStorage.setItem("nb_fasttest_reussis", nb_fasttest_reussis);
            $(".nb_fasttest_reussis").text(nb_fasttest_reussis);
        }
        //On incrémente de 1 le nombre de fasttest effectues dans les statistiques (et donc dans la BD locale).
        if (localStorage.getItem("nb_fasttest_effectues") === null) {
            localStorage.setItem("nb_fasttest_effectues", 0);
        }
        var nb_fasttest_effectues = parseInt(localStorage.getItem("nb_fasttest_effectues")) + 1;
        localStorage.setItem("nb_fasttest_effectues", nb_fasttest_effectues);
        $(".nb_fasttest_effectues").text(nb_fasttest_effectues);
        console.log(">>>>> Note: " + note);
        */
        $.getJSON("/ajax/fasttest", function(data) {
            sessionStorage.setItem("idquestioncourante", data.id); //On set l'ID de la question pour que l'on puisse ensuite l'envoyer au serveur pour qu'il cherche la réponse correspondante
            $('label, .answer br').remove();
            $("#nbquestionposees").text(nbquestionfasttest);
            nbquestionfasttest = nbquestionfasttest + 1;
            $("#idquestion").text(nbquestionfasttest);
            $("#domaine").text(data.domaine);
            sessionStorage.setItem("domainecourant", data.domaine); //On set le domaine en local pour que le client puisse ensuite l'envoyer au serveur en meme temps que la réponse, pour que le serveur puisse savoir de quelle question il s'agit (avec l'id et le domaine)
            $("#enonce").text(data.enonce);
            $("#nbquestionreussies").text(note);
            //laBonneReponse = data.bonnerep;
            //sessionStorage.setItem("bonneReponse", laBonneReponse); // Pour l'appel des fonctions pour drag and drop
            for (i = 0; i < data.nbreponses; i++) {
                $('.answer').prepend("<label draggable='true' ondragstart='drag(event)' id=\"answer" + i + "\" for=\"" + i + "\"><input type=\"hidden\" name=\"answer\" value=\"" + (i+1) + "\" id=\"" + i + "\"><span id=\"span" + i + "\"></span></label><br>");
                $('#span'+i).text("  " + data.reponses[i]);
            }
        });
    });

    //Quand on lance l'exmamen : récupération des paramètres
    $('#commencerexamen').on('click', function(e){
        var field = $('#fieldinput').val();
        nbquestionexam = $('#nbquestioninput').val();

        //On récupère sur le serveur le nombre maximum de questions en fonction du domaine
        $.getJSON("/ajax/nombremaxquestions?field=" + field, function(data) {
            var nombremaxquestion = data[0].nombrequestions;

            if (nbquestionexam > nombremaxquestion) {
                //Si le nombre fourni est trop grand, on envoie un message d'erreur et on reste sur la meme page
                alert("Vous ne pouvez avoir qu'au plus " + nombremaxquestion + " questions d'examen pour le domaine " + field + ".");
            } else {
                //Sinon, on stocke le domaine et nombre questions en localstorage (car non critiques vu que saisies par l'utilisateur) et on va sur la page examen
                if(typeof(Storage) !== "undefined"){
                    //alert("nbr de clefs stockees avant : " + sessionStorage.length);
                    sessionStorage.setItem("field", field);
                    sessionStorage.setItem("nbquestion", nbquestionexam);
                    //alert("nbr de clefs stockees apres : " + sessionStorage.length);
                } else {
                    alert("Votre navigateur n'est pas compatible avec le stockage local");
                }
                document.location.href="/examination";
            }
        });
    });

    //Quand on est déja en examen, pour obtenir une nouvelle question lorsqu'on valide
    $('#nextquestionexam').on('click', function(e){

        $('#chosenAnswer').css('background-color', '#F5F5F5');

        var reponseCourante = $('#chosenAnswer input[name=answer]').val(); // La réponse de l'utilisateur
        //console.log("Réponse de l'utilisateur: " + reponseCourante);
        //console.log("La bonne réponse: " + laBonneReponse);


        var reponseJson = {
            reponsefournie : reponseCourante,
            id : sessionStorage.getItem("idquestioncourante"),
            domaine : sessionStorage.getItem("domainecourant")
        };
        $.ajax({
            type: 'POST',
            url: '/ajax/repondreexam',
            dataType: 'json',
            data: reponseJson,
            success: function(data) {
                $("#nbquestionreussies").text(data.note_courante);
                console.log('SUCCESS : Save done : ' + data.data);
            },
            error: function() {
                console.log('Erreur dans le post de la réponse courante');
            }
        });

       /* if (laBonneReponse != reponseCourante)
        {
            console.log("Mauvaise réponse !");
        } else {
            console.log("Bonne réponse !");
            note++;
        }
        console.log(">>>>> Note: " + note);*/

        /*On récupère l'avancée de l'examen sur le serveur (et l'appel de cette fonction
          décrémente le nombre de questions automatiquement côté serveur) */
        $.get("/ajax/getnbquestionsrestantes", function(data, status){
            //alert("Data: " + data + "\nStatus: " + status);
            var nbquestionsexamrestantes = data[0].nbquestionsexamrestantes;

            // Si l'examen est fini, on va sur la page de fin d'examen
            if (parseInt(nbquestionsexamrestantes) - 1 === 0) {
                sessionStorage.setItem("note", note);
                sessionStorage.setItem("examcourantabandonne", "false");
                document.location.href="/examinationResult";
            }
            else {
                var field = sessionStorage.getItem("field");
                $.getJSON("/ajax/next?field=" + field, function(data) {
                    //alert(numeroquestion);
                    $('label, .answer br').remove();
                    //$("#nbquestionposees").text(nbquestionexam - data.id);
                    $("#nbquestionposees").text(nbquestionexam - nbquestionsexamrestantes + 1);
                    //$("#idquestion").text(nbquestionexam - data.id + 1);
                    $("#idquestion").text(nbquestionexam - nbquestionsexamrestantes + 2);
                    $("#domaine").text(data.domaine);
                    $("#enonce").text(data.enonce);
                    //$("#nbquestionreussies").text(note);
                    sessionStorage.setItem("idquestioncourante", data.id);
                    sessionStorage.setItem("domainecourant", data.domaine);
                    laBonneReponse = data.bonnerep;
                    sessionStorage.setItem("bonneReponse", laBonneReponse);
                    for (i = 0; i < data.nbreponses; i++) {
                        $('.answer').prepend("<label draggable='true' ondragstart='drag(event)' id=\"answer" + i + "\" for=\"" + i + "\"><input type=\"hidden\" name=\"answer\" value=\"" + (i+1) + "\" id=\"" + i + "\"><span id=\"span" + i + "\"></span></label><br>");
                        $('#span'+i).text("  " + data.reponses[i]);
                    }
                });
            }
        });
    });

    //Si on abandonne un examen, on va à la page terminale avec la note 0
    $('#abandonexam').on('click', function(e){
        sessionStorage.setItem("note", 0);
        //Si c'est le premier examen abandonné, on set la variable à 0
        if (localStorage.getItem("nb_exam_abandonnes") === null) {
            localStorage.setItem("nb_exam_abandonnes", 0);
        }
        var nb_exam_abandonnes = parseInt(localStorage.getItem("nb_exam_abandonnes")) + 1;
        localStorage.setItem("nb_exam_abandonnes", nb_exam_abandonnes);
        sessionStorage.setItem("examcourantabandonne", "true");
        document.location.href="/examinationResult";
        //On incrémente le nombre d'examen abandonnés
    });


    //Quand on clique sur "remise à zéro : on efface tout le contenu du localstorage
    $('#remiseazero').on('click', function(e){
        $.post('/ajax/remiseazero', function(req, res) {});
        alert("Vous avez remis à zéro");
        /*localStorage.clear();
        sessionStorage.clear();
        //On change dynamiquement le contenu (pour que l'utilisateur ait un retour sans avoir à recharger la page)
        $(".nb_fasttest_effectues").text("0");
        $(".nb_fasttest_reussis").text("0");
        $(".nb_exam_effectues").text("0");
        $(".nb_exam_abandonnes").text("0");
        $(".tauxexamphrase").text("Aucun examen n'a été effectué pour l'instant");*/

        //On réinitialise la liste des résultats des examens (details)
        $("#htmlresults").html("<tr><td><strong>Note</strong></td><td><strong>Date</strong></td><td><strong>Heure</strong></td></tr>");
        $("#cssresults").html("<tr><td><strong>Note</strong></td><td><strong>Date</strong></td><td><strong>Heure</strong></td></tr>");
        $("#javascriptresults").html("<tr><td><strong>Note</strong></td><td><strong>Date</strong></td><td><strong>Heure</strong></td></tr>");
    });

    //Si on est sur la page du tableau de bord (ou sont les détails des résultats), on charge la BD (localStorage) des examens effectués pour les afficher
    //$('#details').on('click', function(e){
    if (titre === 'WebQuiz : Tableau de bord') {
        var nb_totaux_exam_effectues = localStorage.getItem("nb_exam_effectues");
        //alert("nb totaux : " + nb_totaux_exam_effectues);
        for(i=1; i < parseInt(nb_totaux_exam_effectues)+1; i++) {
            //alert("i " + i);
            var ligne_exam_courant_json = localStorage.getItem("ligne_exam_" + i);
            var ligne_exam_courant = JSON.parse(ligne_exam_courant_json);
            var domaine = ligne_exam_courant.domaine;
            if (domaine === "HTML") {
                $("#htmlresults").append("<tr><td>" + ligne_exam_courant.note + "</td><td>" + ligne_exam_courant.date + "</td><td>" + ligne_exam_courant.heure + "</td></tr>");
            } else if (domaine === "CSS") {
                $("#cssresults").append("<tr><td>" + ligne_exam_courant.note + "</td><td>" + ligne_exam_courant.date + "</td><td>" + ligne_exam_courant.heure + "</td></tr>");
            } else if (domaine === "JavaScript") {
                $("#javascriptresults").append("<tr><td>" + ligne_exam_courant.note + "</td><td>" + ligne_exam_courant.date + "</td><td>" + ligne_exam_courant.heure + "</td></tr>");
            }
        }
    }

    //TP 4 :

    // Supprime les message d'alerte lorsque l'on essaye de réctifier le probleme
    $('input').on('click', function(e) {
        $('#formulaireQuestion').html("");
        $('#formulaireQuestion1').html("");
    });

    $('#ajouterquestion').on('click', function(e){

        var a = 0;

        $('.input').each(function(){
            if ($(this).val() === "") a++;
        });

        // Ceci alerte l'utilisateur qu'aucun des champs ne doit etre vide
        if(a != 0) {
            $('#formulaireQuestion').html("<span id='messageAlerteAjoutQuestionNOK'>Aucun des champs ne doit être vide</span>");
            $('#formulaireQuestion1').html("<br><span id='messageAlerteAjoutQuestionNOK'>Aucun des champs ne doit être vide</span><br><br>");
            return;
        }

        $('#formulaireQuestion').html("");
        $('#formulaireQuestion1').html("");

        var domaine = $('#domaineinput').val();
        var enonce = $('#enonceinput').val();
        var nbreponses = $('#selectbonnereponse option').last().attr('value');
        var bonnerep = $('#selectbonnereponse option:selected').val();

        var question = {
            domaine : domaine,
            enonce : enonce,
            nbreponses : nbreponses,
            reponses: [],
            bonnerep : bonnerep
        }

        for(i=0; i<nbreponses; i++) {
            var j = $("#reponse" + (i+1)).val();
            question.reponses.push(j);
        }

        console.log(question);

        $.ajax({
            type: 'POST',
            url: '/ajax/ajoutquestion',
            dataType: 'json',
            data: question,
            success: function(data) {
                initializeFormAddQuestion(r);
                r = 2;
                console.log('SUCCESS : Save done : ' + data.data);
                $('#formulaireQuestion').html("<span id='messageAlerteAjoutQuestionOK'>Votre question a été ajouté avec succès</span>");
                $('#formulaireQuestion1').html("<br><span id='messageAlerteAjoutQuestionOK'>Votre question a été ajouté avec succès</span><br><br>");
            },
            error: function(data) {
                console.log('ERROR : Save not done : ' + data.data);
                $('#formulaireQuestion').html("<span id='messageAlerteAjoutQuestionNOK'>Votre question n'a pas pu être ajouté</span>");
                $('#formulaireQuestion1').html("<br><span id='messageAlerteAjoutQuestionNOK'>Votre question n'a pas pu être ajouté</span><br><br>");
            }
        });
    });

    // Suppression de la base de donnée
    $('#supprimeBD').on('click', function(e){
        $.post('/ajax/deleteBD', function(data){
            console.log(data.data);
        })
            .done(function(){ // OK
                $('#formulaireQuestion').html("<span id='messageAlerteAjoutQuestionOK'>Base de donnée supprimée</span>");
                $('#formulaireQuestion1').html("<br><span id='messageAlerteAjoutQuestionOK'>Base de donnée supprimée</span><br><br>");
            })
            .fail(function(){ // NOK
                $('#formulaireQuestion').html("<span id='messageAlerteAjoutQuestionNOK'>Erreur : Base de donnée non supprimée</span>");
                $('#formulaireQuestion1').html("<br><span id='messageAlerteAjoutQuestionNOK'>Erreur : Base de donnée non supprimée</span><br><br>");
            })
    });

    // Initialisation du formulaire "Ajout de Question"
    $('#initilizeFormAddQuestion').on('click', function(e) {
        initializeFormAddQuestion(r);
        r = 2;
    });


    // Ajout d'un input text pour ajouter des réponses en plus
    $('#boutonAjouterReponse').on('click', function(e) {
        r++;
        $('#reponsesAjoutees').append("<br><label for='reponse" + r + "'>Réponse " + r + " <input class='input' id='reponse" + r + "' type='text' name='reponse" + r  + "' required=''>");
        $('#selectbonnereponse').append("<option value='" + r + "'>" + r + "</option>");
    });

});

function allowDrop(ev) {
    ev.preventDefault();
}

function drag(ev) {
    ev.dataTransfer.setData("text", ev.target.id);
    var reponseCourante = ev.target.id; // On récupére la réponse de l'utilisateur (Pendant le drag)
    if (reponseCourante == "answer0") {
        reponseCourante = 1;
    } else if (reponseCourante == "answer1") {
        reponseCourante = 2;
    } else if (reponseCourante == "answer2") {
        reponseCourante = 3;
    } else if (reponseCourante == "answer3") {
        reponseCourante = 4;
    } else if (reponseCourante == "answer4") {
        reponseCourante = 5;
    }
    sessionStorage.setItem("reponseFournieDrag",reponseCourante);
    //Ceci pour pouvoir accéder à la variable dans les fonctions pour le drag and drop
    //le fait qu'elle soit stockée en local ne pose pas de problème car c'est l'utilisateur qui l'a renseignée

    //alert("Réponse séléctionnée : " + reponseCourante);
}

function drop(ev) {

    // On récupére les deux variables concernant la bonne réponse et la réponse choisi par l'utilisateur
    //var laBonneReponse = sessionStorage.getItem("bonneReponse");
    //A commenter la ligne au dessus

    var reponsefournie = sessionStorage.getItem("reponseFournieDrag");
    //alert("reponse fournie drop : " + reponsefournie);

    var id = sessionStorage.getItem("idquestioncourante");
    //alert("idfasttestcourant drop : " + id);

    var domaine = sessionStorage.getItem("domainecourant");

    //alert("domainefasttestcourant drop : " + domaine);

    ev.preventDefault();
     $('#chosenAnswer input').remove();
        var data = ev.dataTransfer.getData("text");
        ev.target.appendChild(document.getElementById(data));
        $('label').attr("draggable", 'false');
        $('#drag_and_drop').remove();
    $.getJSON("/ajax/getbooleanreponsejuste?id=" + id + "&domaine=" + domaine + "&reponsefournie=" + reponsefournie, function(data, status){

        //console.log("_____________\nLa réponse : " + laBonneReponse + "\nRéponse choisie : " + reponseCourante);

        // On fixe la couleur en fonction de la réponse même avant de valider la réponse
        if (data.questionbonne === false) {
            $('#chosenAnswer').css('background-color', '#FA8072');
        } else {
            $('#chosenAnswer').css('background-color', '#90EE90');
        }
    });

}

// Fonction qui initialise le formulaire
function initializeFormAddQuestion(r) {
    for (i=r; i>2; i--){
        $('#reponsesAjoutees label').last().remove();
        $('#reponsesAjoutees br').last().remove();
        $('#selectbonnereponse option').last().remove();
    }
    $('#enonceinput').val("");
    $('#reponse1').val("");
    $('#reponse2').val("");
}
