$(function(){
  $('.answer .button').on('click', function(e){
    $.get( '/ajax/next');
  });
});
