var htmlparser = require("htmlparser2");
var https = require('https');
var jwt = require('express-jwt');
var arr = [];
var record = false;
var itemArray = [];
var finalRecord = false;

var core = {

  getAllDataFromQRTest: function(req, res){
    var options = {
      hostname: 'www.sefaz.rs.gov.br',
      port: 443,
      path: '/ASP/AAE_ROOT/NFE/SAT-WEB-NFE-NFC_2.asp?chaveNFe=43151007718633003447650010000813231001813234&HML=false&NF=1CA06FD1F',
      method: 'GET'
    };

    https.get(options, function(response) {
      var body = '';
      response.on('data', function(chunk) {
        body += chunk;
      });
      response.on('end', function() {
        parser.write(body);
        var note = {
          items : arr.slice(0,arr.length-4),
          total : arr.slice(-4,arr.length)
        };
        res.json(note);
        arr = [];
      });
    }).on('error', function(e) {
      console.log("Got error: " + e.message);
    }); 
  },

  getAllDataFromQR: function(req, res){
    var path = "/ASP/AAE_ROOT/NFE/SAT-WEB-NFE-NFC_2.asp?chaveNFe="+req.body.listcode+"&HML=false&NF=1CA06FD1F";

    var options = {
      hostname: 'www.sefaz.rs.gov.br',
      port: 443,
      path: path,
      method: 'GET'
    };

    https.get(options, function(response) {
      var body = '';
      response.on('data', function(chunk) {
        body += chunk;
      });
      response.on('end', function() {
        parser.write(body);
        var note = {
          items : arr.slice(0,arr.length-4),
          total : arr.slice(-4,arr.length)
        };
        res.json(note);
        arr = [];
      });
    }).on('error', function(e) {
      console.log("Got error: " + e.message);
    }); 
  }
};

var parser = new htmlparser.Parser({
  onopentag: function(name, attribs){
    if(name === "td" && attribs.class === "NFCDetalhe_Item"){
      record = true;
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



module.exports = core;