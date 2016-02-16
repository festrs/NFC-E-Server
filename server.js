var express = require('express');
var path = require('path');
var logger = require('morgan');
var bodyParser = require('body-parser');
var jwt = require('express-jwt');
var core = require('./core.js');
var app = express();
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());

app.all('/*', function(req, res, next) {
  // CORS headers
  res.header("Access-Control-Allow-Origin", "*"); // restrict it to the required domain
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
  // Set custom headers for CORS
  //res.header('Access-Control-Allow-Headers', 'Content-type,Accept,X-Access-Token,X-Key');
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

app.all('/api/v1/*', [require('./middlewares/validateRequest')]);
app.get('/test/postqrdata', core.getAllDataFromQRTest);
app.post('/api/v1/qrdata', core.getAllDataFromQR);

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