/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */


const d = require('./src/differify.min');

var a = {age: 1, name: function(){}, extra: 'hola'};
var b = {age: 1, name: function(){return;}, extra: 'holo'};
console.log(d.getDiff(a,b));