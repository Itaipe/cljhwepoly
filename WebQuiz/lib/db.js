/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Question = new Schema({
    domaine : String,
    enonce : String
});

mongoose.model('Question', Question);
//var Question = mongoose.model('Question');

mongoose.connect('mongodb://user:pass@ds143737.mlab.com:43737/tp4');

createquestion = function(req, res) {
    alert("debut create !!!");
    new Question({
        domaine : "html",
        enonce : "a"
    }).save(function(err, todo, count){
        res.redirect('/dashboard');
        //Retourner l'objet créer si err=null, sinon retourner une erreur : 400, 404 ect selon la situation
    });
};