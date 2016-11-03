/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

var mongoose = require('mongoose');
//var Schema = mongoose.Schema;

/*var Todo = new Schema({
    user_id : String,
    content : String,
    updated_at : Date
});*/

//mongoose.model('Question', Todo);
var Question = mongoose.model('Question');

mongoose.connect('mongodb://user:pass@ds143737.mlab.com:43737/tp4');

exports.create = function(req, res) {
    new Question({
        domaine : "html",
        updated_at : Date.now()
    }).save(function(err, todo, count){
        res.render('/dashboard');
        //Retourner l'objet créer si err=null, sinon retourner une erreur : 400, 404 ect selon la situation
    });
};