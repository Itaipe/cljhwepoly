$(function(){

    var titre = $(document).attr('title');
    //alert(titre);
    var nbquestion = 0;
    
    //Si on vient de charger la page test rapide, on génère une question aléatoire
    if (titre === 'WebQuiz : Test Rapide') {
        $.getJSON("/ajax/fasttest", function(data) {
            $("#idquestion").text(data.id);
            $("#domaine").text(data.domaine);
            $("#enonce").text(data.enonce);
            for (i = 0; i < data.nbreponses; i++) {
              $('.answer').prepend("<label id=\"answer" + i + "\" for=\"" + i + "\"><input type=\"radio\" name=\"answer\" value=\"" + i + "\" id=\"" + i + "\"><span id=\"span" + i + "\"></span></label><br>");
              $('#span'+i).text("  " + data.reponses[i]);
            }
        });
    }

    if (titre === 'WebQuiz : Examen') {
        if(typeof(Storage) !== "undefined"){
            var field = sessionStorage.getItem("field");
            var nbquestion = sessionStorage.getItem("nbquestion");
        } else {
            alert("Votre navigateur n'est pas compatible avec le stockage dans une session local");
        }
        //alert("field : " + field);
        //alert("nbquestion : " + nbquestion);
        $.getJSON("/ajax/exam" + field + "?nbquestion=" + nbquestion, function(data) {
            $("#nombrequestion").text(nbquestion);
            $("#idquestion").text(nbquestion - data.id + 1);
            $("#domaine").text(data.domaine);
            $("#enonce").text(data.enonce);
            for (i = 0; i < data.nbreponses; i++) {
                $("#reponse" + i).text(data.reponses[i]);
            }
        });
    }
    
    //Quand on lance l'exmamen : récupération des paramètres
    $('#commencerexamen').on('click', function(e){
        var field = $('#fieldinput').val();
        nbquestion = $('#nbquestioninput').val();
        //alert(field);
        //alert(nbquestion);
        if(typeof(Storage) !== "undefined"){
            //alert("nbr de clefs stockees avant : " + sessionStorage.length);
            sessionStorage.setItem("field", field);
            sessionStorage.setItem("nbquestion", nbquestion);
            //alert("nbr de clefs stockees apres : " + sessionStorage.length);
        } else {
            alert("Votre navigateur n'est pas compatible avec le stockage local");
        }
    });

    //Quand on est déja en test rapide, pour obtenir une nouvelle question lorsqu'on valide

    $('#validerfasttest').on('click', function(e){
        $.getJSON("/ajax/fasttest", function(data) {
            $('label, .answer br').remove();
            $("#idquestion").text(data.id);
            $("#domaine").text(data.domaine);
            $("#enonce").text(data.enonce);
            for (i = 0; i < data.nbreponses; i++) {
                $('.answer').prepend("<label id=\"answer" + i + "\" for=\"" + i + "\"><input type=\"radio\" name=\"answer\" value=\"" + i + "\" id=\"" + i + "\"><span id=\"span" + i + "\"></span></label><br>");
                $('#span'+i).text("  " + data.reponses[i]);
            }
        });
    });
  
    $('#nextquestionexam').on('click', function(e){
        $.getJSON("/ajax/next", function(data) {
           // var numeroquestion = nbquestion - data.id + 1;
            //alert(numeroquestion);
            $("#idquestion").text(nbquestion - data.id + 1);
            $("#domaine").text(data.domaine);
            $("#enonce").text(data.enonce);
            for (i = 0; i < data.nbreponses; i++) {
                $("#reponse" + i).text(data.reponses[i]);
            }
        });
    });

});
