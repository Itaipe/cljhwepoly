$(function(){

  $('#boutondetest').on('click', function(e){
    //alert("avanttt get");
    //$.get('/ajax/next');

    $.getJSON("/ajax/next", function(data) {
    //alert(data.enonce);
      $("#domaine").text(data.domaine);
      $("#enonce").text(data.enonce);
    });

  //alert("apres get");


  /*
  var $qq = $('#testajax');
  $.ajax({
    type: 'GET',
    url: '/data/data.json',
    success: function(questions){
      $.each(questions, function(i, question){
        $qq.text('TEST');
      });
    }
  });*/

});
});
