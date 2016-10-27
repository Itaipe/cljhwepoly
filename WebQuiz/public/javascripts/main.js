$(function(){

    var titre = $(document).attr('title');
    //alert(titre);
    var nbquestionexam = 0;
    var nbquestionsexamrestantes = 0; // Le nombre de questions restantes au fur et a mesure que l'utilisateur répond
    var laBonneReponse = 0; // La variable qui contient la bonne réponse d'une quesiton
    var note = 0; // Variable contenant la note

    var nbquestionfasttest = 1;


    //Affichage des bonnes statistiques au chargement de la page
    $(".nb_fasttest_effectues").text(localStorage.getItem("nb_fasttest_effectues"));
    $(".nb_fasttest_reussis").text(localStorage.getItem("nb_fasttest_reussis"));
    $(".nb_exam_effectues").text(localStorage.getItem("nb_exam_effectues"));
    $(".nb_exam_abandonnes").text(localStorage.getItem("nb_exam_abandonnes"));

    //Si on vient de charger la page test rapide, on génère une question aléatoire
    if (titre === 'WebQuiz : Test Rapide') {
        $.getJSON("/ajax/fasttest", function(data) {
            laBonneReponse = data.bonnerep;
            sessionStorage.setItem("bonneReponse", laBonneReponse);
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
            sessionStorage.setItem("bonneReponse", laBonneReponse);
            $("#nombrequestion").text(nbquestionexam);
            $("#idquestion").text(nbquestionexam - data.id + 1);
            $("#domaine").text(data.domaine);
            $("#enonce").text(data.enonce);
            for (i = 0; i < data.nbreponses; i++) {
                $('.answer').prepend("<label draggable='true' ondragstart='drag(event)' id=\"answer" + i + "\" for=\"" + i + "\"><input type=\"hidden\" name=\"answer\" value=\"" + (i+1) + "\" id=\"" + i + "\"><span id=\"span" + i + "\"></span></label><br>");
                $('#span'+i).text("  " + data.reponses[i]);
            }
        });
    }

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

    //Quand on est déja en test rapide, pour obtenir une nouvelle question lorsqu'on valide
    $('#validerfasttest').on('click', function(e){

        $('#chosenAnswer').css('background-color', '#F5F5F5');

        var reponseCourante = $('#chosenAnswer input[name=answer]').val(); // La réponse de l'utilisateur
        console.log("Réponse de l'utilisateur: " + reponseCourante);
        console.log("La bonne réponse: " + laBonneReponse);
        if (laBonneReponse != reponseCourante)
        {
            console.log("Mauvaise réponse !");

        } else {
            console.log("Bonne réponse !");
            note++;
            //Si la réponse est juste, on change le nombre de fasttest réussis dans les statistiques (et donc dans la BD locale).
            var nb_fasttest_reussis = parseInt(localStorage.getItem("nb_fasttest_reussis")) + 1;
            localStorage.setItem("nb_fasttest_reussis", nb_fasttest_reussis);
            $(".nb_fasttest_reussis").text(nb_fasttest_reussis);
        }
        //On incrémente de 1 le nombre de fasttest effectues dans les statistiques (et donc dans la BD locale).
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
            sessionStorage.setItem("bonneReponse", laBonneReponse);
            for (i = 0; i < data.nbreponses; i++) {
                $('.answer').prepend("<label draggable='true' ondragstart='drag(event)' id=\"answer" + i + "\" for=\"" + i + "\"><input type=\"hidden\" name=\"answer\" value=\"" + (i+1) + "\" id=\"" + i + "\"><span id=\"span" + i + "\"></span></label><br>");
                $('#span'+i).text("  " + data.reponses[i]);
            }
        });
    });

    //Quand on est déja en examen, pour obtenir une nouvelle question lorsqu'on valide
    $('#nextquestionexam').on('click', function(e){

        $('#chosenAnswer').css('background-color', '#F5F5F5');

        var reponseCourante = $('#chosenAnswer input[name=answer]').val(); // La réponse de l'utilisateur
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
              sessionStorage.setItem("bonneReponse", laBonneReponse);
              for (i = 0; i < data.nbreponses; i++) {
                  $('.answer').prepend("<label draggable='true' ondragstart='drag(event)' id=\"answer" + i + "\" for=\"" + i + "\"><input type=\"hidden\" name=\"answer\" value=\"" + (i+1) + "\" id=\"" + i + "\"><span id=\"span" + i + "\"></span></label><br>");
                  $('#span'+i).text("  " + data.reponses[i]);
              }
          });
        }
    });

    if (titre === 'WebQuiz : Resulat examen') {
        var result = sessionStorage.getItem("note");
        var nombreTotaleDeQuestion = sessionStorage.getItem("nbquestion");
        // ICI IL RESTE PLUS QU'A SAUVEGARDER LA note DANS LA SESSION AFIN QU'ELLE APPARAISSE DANS LES STATS
        $("#noteFinale").text(result + "/" + nombreTotaleDeQuestion);

        //On incrémente de 1 le nombre d'examens effetué (ie fini sans avoir abandonné)
        var nb_exam_effectues = parseInt(localStorage.getItem("nb_exam_effectues")) + 1;
        localStorage.setItem("nb_exam_effectues", nb_exam_effectues);
        $(".nb_exam_effectues").text(nb_exam_effectues);
    }

    //Si on abandonne un examen, on va à la page terminale avec la note 0
    $('#abandonexam').on('click', function(e){
        sessionStorage.setItem("note", 0);
        var nb_exam_abandonnes = parseInt(localStorage.getItem("nb_exam_abandonnes")) + 1;
        localStorage.setItem("nb_exam_abandonnes", nb_exam_abandonnes);
        document.location.href="/examinationResult";
        //On incrémente le nombre d'examen abandonnés
    });



});

function allowDrop(ev) {
    ev.preventDefault();
}

function drag(ev) {
    ev.dataTransfer.setData("text", ev.target.id);
    var reponseCourante = ev.target.id;
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
    sessionStorage.setItem("reponseCouranteDrag",reponseCourante);
    console.log("Réponse séléctionnée : " + reponseCourante);
}

function drop(ev) {

    var laBonneReponse = sessionStorage.getItem("bonneReponse");
    var reponseCourante = sessionStorage.getItem("reponseCouranteDrag");

    ev.preventDefault();
    $('#chosenAnswer input').remove();
    var data = ev.dataTransfer.getData("text");
    ev.target.appendChild(document.getElementById(data));
    $('label').attr("draggable", 'false');
    $('#drag_and_drop').remove();
    console.log("_____________\nLa réponse : " + laBonneReponse + "\nRéponse choisie : " + reponseCourante);
    if (laBonneReponse != reponseCourante)
    {
        $('#chosenAnswer').css('background-color', '#FA8072');
    } else {
        $('#chosenAnswer').css('background-color', '#90EE90');
    }
}
