var https = require('https');
var htmlparser = require("htmlparser2");
var express = require('express');
var path = require('path');
var logger = require('morgan');
var bodyParser = require('body-parser');
var jwt = require('express-jwt');
var app = express();
app.use(logger('dev'));
app.use(bodyParser.json());

var arr = [];
var record = false;
var itemArray = [];
var finalRecord = false;
var options = {
  hostname: 'www.sefaz.rs.gov.br',
  port: 443,
  path: '/ASP/AAE_ROOT/NFE/SAT-WEB-NFE-NFC_2.asp?chaveNFe=43151007718633003447650010000813231001813234&HML=false&NF=1CA06FD1F',
  method: 'GET'
};


var getAllDataFromQR = function(req, res){
  https.get(options, function(response) {
    var body = '';
    response.on('data', function(chunk) {
      body += chunk;
    });
    response.on('end', function() {
      parser.write(body);
      var note = {
        items : arr.slice(0,arr.length-5),
        total : arr.slice(-4,arr.length)
      };
      res.json(note);
      arr = [];
    });
  }).on('error', function(e) {
    console.log("Got error: " + e.message);
  }); 
};
var parser = new htmlparser.Parser({
    onopentag: function(name, attribs){
        if(name === "td" && attribs.class === "NFCDetalhe_Item"){
            record= true;
        }
    },
    ontext: function(text){
        if(record){
          itemArray.push(text);
        }
    },
    onclosetag: function(tagname){
        if(tagname === "td" && record == true){
            record = false;
        }
        if(tagname === "tr"){
          if(itemArray.length > 0)
            arr.push(itemArray);
          itemArray = [];
        }
    }
}, {decodeEntities: true});


app.all('/*', function(req, res, next) {
  // CORS headers
  res.header("Access-Control-Allow-Origin", "*"); // restrict it to the required domain
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
  // Set custom headers for CORS
  res.header('Access-Control-Allow-Headers', 'Content-type,Accept,X-Access-Token,X-Key');
  if (req.method == 'OPTIONS') {
    res.status(200).end();
  } else {
    next();
  }
});
// Auth Middleware - This will check if the token is valid
// Only the requests that start with /api/v1/* will be checked for the token.
// Any URL's that do not follow the below pattern should be avoided unless you 
// are sure that authentication is not needed

app.all('/api/v1/*', jwt({secret: 'shhhhhhared-secret'}));

app.get('/api/v1/qrdata', getAllDataFromQR);
app.get('/qrdata', getAllDataFromQR);

// If no route is matched by now, it must be a 404
app.use(function(err, req, res, next) {
  err.status = 404;
  if (err.name === 'UnauthorizedError') { 
    res.send(401, 'invalid token...');
  }
  next(err);
});
// Start the server
app.set('port', process.env.PORT || 3000);
  var server = app.listen(app.get('port'), function() {
  console.log('Express server listening on port ' + server.address().port);
});