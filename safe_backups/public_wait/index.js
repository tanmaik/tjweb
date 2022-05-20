var express = require('express')
var app = express();

var https = require('https')
var http = require('http')

var hbs = require('hbs')
app.set('view engine', 'hbs')

var cookieParser = require('cookie-parser')
app.use(cookieParser())

var path = require('path')
app.use(express.static(path.join(__dirname, 'static')));

const { AuthorizationCode } = require('simple-oauth2');
var mysql = require('mysql');

app.set('trust proxy', 1)
var cookieSession = require('cookie-session')
app.use(cookieSession({
    name: 'papa',
    keys: ['secret123', 'secret456']
}))


var ion_client_id = 'tgN8b2NvVfSyH6F5RsdzdwCcSSGNRgp4fukWjSr5'
var ion_client_secret = 'FSjCI89T22B7B7QdaqMdILd0XoXWp1GfvjeE72FUDG9juEAs30QQqeBn0JMVfaC9eF2NPxIzd3zXb1M54S51jjbLIVQtuNqIq0sNXhB642Rq8cGm8PwTHFdeJgYKjRtv'
var ion_redirect_uri = 'https://user.tjhsst.edu/2023tkalisip/login_worker'
var client = new AuthorizationCode({
    client: {
        id: ion_client_id,
        secret: ion_client_secret
    },
    auth: {
        tokenHost: 'https://ion.tjhsst.edu/oauth/',
        authorizePath: 'https://ion.tjhsst.edu/oauth/authorize',
        tokenPath: 'https://ion.tjhsst.edu/oauth/token'
    }
})
var authorizationUri = client.authorizeURL({
    scope: "read",
    redirect_uri: ion_redirect_uri
})
console.log(authorizationUri)

function checkAuthentication(req, res, next) {
    if ('authenticated' in req.session) {
        next()
    }
    else {
        res.render('unverified', {'login_link' : authorizationUri})
    }
}

function getUserName(req, res, next) {
    var access_token = req.session.token.access_token;
    var profile_url = 'https://ion.tjhsst.edu/api/profile?format=json&access_token=' + access_token;
    
    https.get(profile_url, function(response) {
        var rawData = '';
        response.on('data', function(chunk) {
            rawData += chunk;
        })
        
        response.on('end', function() {
            res.locals.profile = JSON.parse(rawData);
            req.session.profile = res.locals.profile;
            var profile = req.session.profile;
            
            var sql = "SELECT nickname FROM profiles WHERE username = ?";
            pool.query(sql, [profile.ion_username], function(error, results, fields){
                if (error) throw error;
                console.log(results)
                var nickname = results[0]
                if (nickname === undefined) {
                    console.log('doesnt exist')
                    var sql = "INSERT INTO profiles (username, nickname) VALUES (?,\"" + profile.ion_username + "\");"
                    pool.query(sql, [profile.ion_username], function(error1, results1, fields1){
                        if (error1) throw error;
                        next()
                     })
                }
                else {
                    next()
                }
            }) 
            next();
        })
    }).on('error', function(err) {
        next(err);
    })
}

var sql_params = {
  connectionLimit : 10,
  user            : process.env.DIRECTOR_DATABASE_USERNAME,
  password        : process.env.DIRECTOR_DATABASE_PASSWORD,
  host            : process.env.DIRECTOR_DATABASE_HOST,
  port            : process.env.DIRECTOR_DATABASE_PORT,
  database        : process.env.DIRECTOR_DATABASE_NAME
}

var pool = mysql.createPool(sql_params);

app.get('/', [checkAuthentication, getUserName], function(req, res){
    var profile = res.locals.profile;
    var first_name = profile.first_name;
    console.log(profile.full_name)
    res.render('home', {'login_link': 'https://user.tjhsst.edu/2023tkalisip/logout', 'title': 'Logout', 'username':first_name});
});


const current1 = require('./routes/numberfacts.js');
app.use(current1);

const current2 = require('./routes/madlib.js');
app.use(current2)

const current3 = require('./routes/weather.js');
app.use(current3)

app.get('/nba_voting', function(req,res){

    var sql = "SELECT player,num_votes,display_form FROM nba_voting";
    
    pool.query(sql, function(error, results, fields){
        if (error) throw error;
        results[0].percentage = parseInt(((results[0].num_votes) / (results[0].num_votes + results[1].num_votes) )* 100)
        results[1].percentage = parseInt(((results[1].num_votes) / (results[0].num_votes + results[1].num_votes) )* 100)
        res.render('mainvoting', {'player_data':results});
    }) 
    
})

app.get('/nba_voting/:player', function(req,res){

    var name = req.params.player;
    var sql = "UPDATE nba_voting SET num_votes=num_votes+1 WHERE player = ?";
    
    pool.query(sql, [name], function(error, results, fields){
        if (error) throw error;
        res.redirect('https://user.tjhsst.edu/2023tkalisip/nba_voting');
    }) 
})


app.get('/cookie', function(req, res) {
    var cookie_key = 'count'
    
    if (cookie_key in req.cookies === false) {
        res.cookie(cookie_key, 0)
    }
    
    if ('visited_count' in req.session === false) {
        req.session.visited_count = 0
    } else {
        req.session.visited_count += 1
    }
    
    if (req.session.visited_count > 4 && !('authenticated' in req.session)) {
        res.render('error_login')
    }
    
    if ('authenticated' in req.session) {
        var profile = req.session.profile;
        var sql = "SELECT nickname FROM profiles WHERE username = ?";
        pool.query(sql, [profile.ion_username], function(error, results, fields){
            if (error) throw error;
            var nickname = results[0].nickname
            console.log(nickname)
            res.render("cookieclickr", {'visited': 'infinity', 'user': ", " + nickname})
        })
    } else {
        res.render("cookieclickr", {'visited': (5 - req.session.visited_count), 'user':''})
    }
})


async function convertCodeToToken(req, res, next) {
    var theCode = req.query.code;
    
    var options = {
        'code': theCode,
        'redirect_uri': ion_redirect_uri,
        'scope': 'read'
    };
    
    try {
        var accessToken = await client.getToken(options);
        res.locals.token = accessToken.token;
        next()
    }
    catch (error) {
        console.log('Access Token Error', error.message);
        res.send(502);
    }
}

app.get('/login_worker', [convertCodeToToken], function(req, res) {
    req.session.authenticated = true;
    req.session.token = res.locals.token;
    
    res.redirect('https://user.tjhsst.edu/2023tkalisip')
})


app.get('/logout', function(req, res) {
    delete req.session.authenticated;
    delete req.session.profile;
    res.redirect("https://user.tjhsst.edu/2023tkalisip")
})

app.get('/myprofile', function(req, res) {
    if(!('authenticated' in req.session)) {
        res.redirect("https://user.tjhsst.edu/2023tkalisip")
    }
    var profile = req.session.profile;
    var sql = "SELECT nickname FROM profiles WHERE username = ?";
    pool.query(sql, [profile.ion_username], function(error, results, fields){
        if (error) throw error;
        var nickname = results[0].nickname
        console.log(nickname)
        var params = {
            'full_name': profile.full_name,
            'nickname': nickname,
            'email': profile.emails,
            'grade': profile.grade.name,
            'phones': profile.phones,
        }
    
        res.render('profile', params)
    }) 
    
})

app.get('/changed_nickname', function(req, res) {
    var new_nickname = req.query.f_nickname;
    var sql = "UPDATE profiles SET nickname=\"" + new_nickname + "\" WHERE username = \"" + req.session.profile.ion_username + "\";";
    pool.query(sql, function(error, results, fields){
        if (error) throw error;
        res.redirect('https://user.tjhsst.edu/2023tkalisip/myprofile');
    }) 
})

app.use(function (req, res, next) {
  res.status(404).render("404")
})

var listener = app.listen(process.env.PORT || 8080, process.env.HOST || "0.0.0.0", function() {
    console.log("Express server started");
});