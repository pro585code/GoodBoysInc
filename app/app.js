var express = require('express');
var reload = require('reload');
var app = express();
var bodyParser = require('body-parser');
var clientsessions = require('client-sessions');
var randomstring = require("randomstring");
var mysql = require('mysql');

var pool      =    mysql.createPool({
    connectionLimit : 100, //important
    host     : process.env.IP,
    user     : 'mws5966',
    password : '',
    database : 'users',
    debug    :  false
});

var handle_database = function (req,res,next) {
    
    pool.getConnection(function(err,connection){
        if (err) {
          res.json({"code" : 100, "status" : "Error in connection database"});
          return;
        }   

        console.log('connected as id ' + connection.threadId);
        
        connection.query("select * from user",function(err,rows){
            connection.release();
            if(!err) {
                res.json(rows);
            }           
        });

        connection.on('error', function(err) {      
              res.json({"code" : 100, "status" : "Error in connection database"});
              return;     
        });
  });
  
  next();
}

app.set('port', process.env.PORT || 3000);
//app.set('appData', dataFile);
app.set('view engine', 'ejs');
app.set('views', 'app/views');

app.locals.siteTitle = 'Good Boys Inc';

app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies
app.use(clientsessions({
  cookieName: 'session',
  secret: randomstring.generate(),
  duration: 30 * 60 * 1000,
  activeDuratoin: 5 * 60 * 1000,
}));
app.use(handle_database);
app.use(express.static('app/public'));
app.use(require('./routes/index'));
app.use(require('./routes/personality'));
app.use(require('./routes/twitter'));
app.use(require('./routes/facebook'));
app.use(require('./routes/information'));
app.use(require('./routes/report'));
app.use(require('./routes/login'));


var server = app.listen(app.get('port'), function() {
  console.log('Listening on port ' + app.get('port'));
});

reload(server, app);
