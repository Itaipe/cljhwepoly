$(function(){
  $('#boutondetest').on('click', function(e){
    $.getJSON("/ajax/next", function(data) {
      $("#numero").text("2/2");
      $("#domaine").text(data.domaine);
      $("#enonce").text(data.enonce);
    });
  });
});
