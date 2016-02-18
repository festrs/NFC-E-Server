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
      path: '/ASP/AAE_ROOT/NFE/SAT-WEB-NFE-NFC_2.asp?chaveNFe=43160245543915000777650120000485121886402924&HML=false&NF=1CA06FD1F',
      method: 'GET'
    };

    https.get(options, function(response) {
      var body = '';
      response.on('data', function(chunk) {
        body += chunk;
      });
      response.on('end', function() {
        parser.write(body);
        res.json(mapper(body));
        arr = [];
      });
    }).on('error', function(e) {
      console.log("Got error: " + e.message);
    }); 
  },

  getAllDataFromQR: function(req, res){
    var link = req.body.linkurl;
    //var chaveNFe = link.substring(link.search("?"),link.search("&"));
    console.log(link);
    console.log(link.substring("?"));

    var path = "/ASP/AAE_ROOT/NFE/SAT-WEB-NFE-NFC_2.asp?chaveNFe="+req.body.listcode+"&HML=false&NF=1CA06FD1F";

    var options = {
      hostname: 'www.sefaz.rs.gov.br',
      port: 443,
      path: path,
      method: 'GET'
    };
    console.log(path);
    https.get(options, function(response) {
      var body = '';
      response.on('data', function(chunk) {
        body += chunk;
      });
      response.on('end', function() {
        parser.write(body);
        res.json(mapper(body));
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

function mapper(body){
  var items = [];
  var pagmethods = [];
  var vltotal;
  var vldesc;
  for (var i = arr.length - 1; i >= 0; i--) {
    if(arr[i].length > 2){
      if(arr[i].length == 6){
        var item = {
          code      : arr[i][0],
          descricao : arr[i][1],
          qtde      : arr[i][2],
          un        : arr[i][3],
          vlunit    : arr[i][4],
          vltotal   : arr[i][5]
        }
        items.push(item);
      }
    }else{
      if(arr[i].length == 2){
        console.log(arr[i][0]);
        if(arr[i][0].indexOf("Valor descontos") !=-1){
          vldesc = arr[i][1];
        } else if(arr[i][0].indexOf("Valor total") !=-1){
          vltotal = arr[i][1];
        }else if (arr[i][0] != "FORMA PAGAMENTO"){
          pagmethods.push({ formapag : arr[i][0], valor: arr[i][1]});
        }
      }
    }
  }
  //finish all mount the result json
  var date = body.substring(body.search("Data de Emiss")+18,body.search("Data de Emiss")+27)
  var result = {
    items     :  items,
    payments  : {vltotal: vltotal, vldesc: vldesc ,pagmethods: pagmethods},
    date      :  date
  }
  return { nota : result};
}

module.exports = core;