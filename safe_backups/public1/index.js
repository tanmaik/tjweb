#!/usr/bin/nodejs

// initialize express and app class object
var express = require('express')
var app = express();

// initialize handlebars templating engine
var hbs = require('hbs')
app.set('view engine', 'hbs')

var mysql = require('mysql');

var path = require('path')
app.use(express.static(path.join(__dirname, 'static')));


// -------------- mysql initialization -------------- //
// USE PARAMETERS FROM DIRECTOR DOCS!!!
var sql_params = {
  connectionLimit : 10,
  user            : process.env.DIRECTOR_DATABASE_USERNAME,
  password        : process.env.DIRECTOR_DATABASE_PASSWORD,
  host            : process.env.DIRECTOR_DATABASE_HOST,
  port            : process.env.DIRECTOR_DATABASE_PORT,
  database        : process.env.DIRECTOR_DATABASE_NAME
}

var pool  = mysql.createPool(sql_params);

// -------------- express 'get' handlers -------------- //


app.get('/', function(req,res){

    var sql = "SELECT player,num_votes,display_form FROM nba_voting";
    
    pool.query(sql, function(error, results, fields){
        if (error) throw error;
        console.log(results)
        results[0].percentage = parseInt(((results[0].num_votes) / (results[0].num_votes + results[1].num_votes) )* 100)
        results[1].percentage = parseInt(((results[1].num_votes) / (results[0].num_votes + results[1].num_votes) )* 100)
        res.render('mainvoting', {'player_data':results});
    }) 
    
})

app.get('/:player', function(req,res){

    var name = req.params.player;
    var sql = "UPDATE nba_voting SET num_votes=num_votes+1 WHERE player = ?";
    
    pool.query(sql, [name], function(error, results, fields){
        if (error) throw error;
        res.redirect('https://user.tjhsst.edu/2023tkalisip/');
    }) 
})





// -------------- listener -------------- //
// // The listener is what keeps node 'alive.' 

var listener = app.listen(process.env.PORT || 8080, process.env.HOST || "0.0.0.0", function() {
    console.log("Express server started");
});