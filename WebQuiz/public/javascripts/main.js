$(function(){

   // $('.answer .button').on('click', function(e){
   //     alert("avanttt get");
        //$.get('/ajax/next');
   //     $.getJSON("/ajax/next", function(data) {
   //         alert(data.enonce);
   //         $("#domaine").text(data.domaine);
   //         $("#enonce").text(data.enonce);
   //     });
   //     alert("apres get");
  //});
  
  //alert("apres fonction click" + $("#domaine".text()));
  
  $('#boutondetest').on('click', function(e){
    $.getJSON("/ajax/next", function(data) {
      $("#domaine").text(data.domaine);
      $("#enonce").text(data.enonce);
    });
  });
  
});
