$(function(){

    var titre = $(document).attr('title');
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

    $('#boutondetest').on('click', function(e){
        $.getJSON("/ajax/next", function(data) {
            $("#idquestion").text(data.id);
            $("#domaine").text(data.domaine);
            $("#enonce").text(data.enonce);
            for (i = 0; i < data.nbreponses; i++) {
                $("#reponse" + i).text(data.reponses[i]);
            }
        });
    });

});
