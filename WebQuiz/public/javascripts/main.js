$(function(){

    var titre = $(document).attr('title');
    //alert(titre);
    var nbquestionexam = 0;
    var nbquestionsexamrestantes = 0; // Le nombre de questions restantes au fur et a mesure que l'utilisateur répond
    var laBonneReponse = 0; // La variable qui contient la bonne réponse d'une quesiton
    var note = 0; // Variable contenant la note

    var nbquestionfasttest = 1;
        
    //Affichage des bonnes statistiques au chargement de la page
    if (localStorage.getItem("nb_fasttest_effectues") !== null) {
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
    }

    //Si on vient de charger la page test rapide, on génère une question aléatoire
    if (titre === 'WebQuiz : Test Rapide') {
        $.getJSON("/ajax/fasttest", function(data) {
            laBonneReponse = data.bonnerep;
            nbquestionfasttest = 1;
            $("#idquestion").text(nbquestionfasttest);
            $("#domaine").text(data.domaine);
            $("#enonce").text(data.enonce);
            for (i = 0; i < data.nbreponses; i++) {
              $('.answer').prepend("<label id=\"answer" + i + "\" for=\"" + i + "\"><input type=\"radio\" name=\"answer\" value=\"" + (i+1) + "\" id=\"" + i + "\"><span id=\"span" + i + "\"></span></label><br>");
              $('#span'+i).text("  " + data.reponses[i]);
            }
        });
    }

    if (titre === 'WebQuiz : Examen') {
        if(typeof(Storage) !== "undefined"){
            var field = sessionStorage.getItem("field");
            nbquestionexam = sessionStorage.getItem("nbquestion");
            nbquestionsexamrestantes = nbquestionexam;
        } else {
            alert("Votre navigateur n'est pas compatible avec le stockage dans une session local");
        }
        //alert("field : " + field);
        //alert("nbquestion : " + nbquestion);
        $.getJSON("/ajax/exam" + field + "?nbquestion=" + nbquestionexam, function(data) {
            laBonneReponse = data.bonnerep;
            $("#nombrequestion").text(nbquestionexam);
            $("#idquestion").text(nbquestionexam - data.id + 1);
            $("#domaine").text(data.domaine);
            //On stocke le domaine courant dans la session pour que l'on puisse l'afficher ensuite dans la bonne catégorie sur la page de résultats (détails)
            var domaine = data.domaine;
            if (sessionStorage.getItem("domaine") !== domaine) {
                sessionStorage.setItem("domaine", domaine);
            }
            $("#enonce").text(data.enonce);
            for (i = 0; i < data.nbreponses; i++) {
                $('.answer').prepend("<label id=\"answer" + i + "\" for=\"" + i + "\"><input type=\"radio\" name=\"answer\" value=\"" + (i+1) + "\" id=\"" + i + "\"><span id=\"span" + i + "\"></span></label><br>");
                $('#span'+i).text("  " + data.reponses[i]);
            }
        });
    }
    
    if (titre === 'WebQuiz : Resulat examen') {
        var result = sessionStorage.getItem("note");
        var nombreTotaleDeQuestion = sessionStorage.getItem("nbquestion");
        // ICI IL RESTE PLUS QU'A SAUVEGARDER LA note DANS LA SESSION AFIN QU'ELLE APPARAISSE DANS LES STATS
        $("#noteFinale").text(result + "/" + nombreTotaleDeQuestion);
        
        //Si l'examen a été abandonné (n'a pas été effectué), on ne fait rien
        if(sessionStorage.getItem("examcourantabandonne")==="true") {
            sessionStorage.setItem("examcourantabandonne", "false");
        } else {
            //Si c'est le premier examen effectué, on met la variable initiale à 0
            if (localStorage.getItem("nb_exam_effectues") === null) {
                localStorage.setItem("nb_exam_effectues", 0);
            }
            //On incrémente de 1 le nombre d'examens effetués
            var nb_exam_effectues = parseInt(localStorage.getItem("nb_exam_effectues")) + 1;
            localStorage.setItem("nb_exam_effectues", nb_exam_effectues);
            $(".nb_exam_effectues").text(nb_exam_effectues);
            
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

        var reponseCourante = $('input[name=answer]:checked').val(); // La réponse de l'utilisateur
        console.log("Réponse de l'utilisateur: " + reponseCourante);
        console.log("La bonne réponse: " + laBonneReponse);
        if (laBonneReponse != reponseCourante)
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

        $.getJSON("/ajax/fasttest", function(data) {
            $('label, .answer br').remove();
            $("#nbquestionposees").text(nbquestionfasttest);
            nbquestionfasttest = nbquestionfasttest + 1;
            $("#idquestion").text(nbquestionfasttest);
            $("#domaine").text(data.domaine);
            $("#enonce").text(data.enonce);
            $("#nbquestionreussies").text(note);
            laBonneReponse = data.bonnerep;
            for (i = 0; i < data.nbreponses; i++) {
                $('.answer').prepend("<label id=\"answer" + i + "\" for=\"" + i + "\"><input type=\"radio\" name=\"answer\" value=\"" + (i+1) + "\" id=\"" + i + "\"><span id=\"span" + i + "\"></span></label><br>");
                $('#span'+i).text("  " + data.reponses[i]);
            }
        });
    });
    
    //Quand on lance l'exmamen : récupération des paramètres
    $('#commencerexamen').on('click', function(e){
        var field = $('#fieldinput').val();
        nbquestionexam = $('#nbquestioninput').val();
        //alert(field);
        //alert(nbquestion);
        if(typeof(Storage) !== "undefined"){
            //alert("nbr de clefs stockees avant : " + sessionStorage.length);
            sessionStorage.setItem("field", field);
            sessionStorage.setItem("nbquestion", nbquestionexam);
            //alert("nbr de clefs stockees apres : " + sessionStorage.length);
        } else {
            alert("Votre navigateur n'est pas compatible avec le stockage local");
        }
    });

    //Quand on est déja en examen, pour obtenir une nouvelle question lorsqu'on valide
    $('#nextquestionexam').on('click', function(e){

        var reponseCourante = $('input[name=answer]:checked').val(); // La réponse de l'utilisateur
        console.log("Réponse de l'utilisateur: " + reponseCourante);
        console.log("La bonne réponse: " + laBonneReponse);
        if (laBonneReponse != reponseCourante)
        {
          console.log("Mauvaise réponse !");
        } else {
          console.log("Bonne réponse !");
          note++;
        }
        console.log(">>>>> Note: " + note);

        console.log("Le nombre de questions choisi par l'utilisateur: " + nbquestionexam);
        nbquestionsexamrestantes = nbquestionsexamrestantes - 1 ;
        console.log("Nombre des questions restantes: " + nbquestionsexamrestantes);

        // On fait la redirection vers le resutat du coté du client car passer par le serveur n'est pas nécessaire /!\
        if (nbquestionsexamrestantes === 0) {
          sessionStorage.setItem("note", note);
          sessionStorage.setItem("examcourantabandonne", "false");
          document.location.href="/examinationResult";
        }
        else {
          $.getJSON("/ajax/next", function(data) {
              //alert(numeroquestion);
              $('label, .answer br').remove();
              $("#nbquestionposees").text(nbquestionexam - data.id);
              $("#idquestion").text(nbquestionexam - data.id + 1);
              $("#domaine").text(data.domaine);
              $("#enonce").text(data.enonce);
              $("#nbquestionreussies").text(note);
              laBonneReponse = data.bonnerep;
              for (i = 0; i < data.nbreponses; i++) {
                  $('.answer').prepend("<label id=\"answer" + i + "\" for=\"" + i + "\"><input type=\"radio\" name=\"answer\" value=\"" + (i+1) + "\" id=\"" + i + "\"><span id=\"span" + i + "\"></span></label><br>");
                  $('#span'+i).text("  " + data.reponses[i]);
              }
          });
        }
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
        localStorage.clear();
        sessionStorage.clear();
        //On change dynamiquement le contenu (pour que l'utilisateur ait un retour sans avoir à recharger la page)
        $(".nb_fasttest_effectues").text("0");
        $(".nb_fasttest_reussis").text("0");
        $(".nb_exam_effectues").text("0");
        $(".nb_exam_abandonnes").text("0");
        $(".tauxexamphrase").text("Aucun examen n'a été effectué pour l'instant");
        
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
          
});
