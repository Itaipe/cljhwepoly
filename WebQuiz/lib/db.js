/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

var mongoose = require( 'mongoose');
var Schema = mongoose.Schema;

var Todo = new Schema({
    user_id : String,
    content : String,
    updated_at : Date
});

mongoose.model('Todo', Todo);
mongoose.connect('mongodb://localhost/express-todo');