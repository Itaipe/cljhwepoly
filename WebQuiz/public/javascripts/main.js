$(function(){
  $('#boutondetest').on('click', function(e){
    $.getJSON("/ajax/next", function(data) {
      $("#domaine").text(data.domaine);
      $("#enonce").text(data.enonce);
    });
  });
});
