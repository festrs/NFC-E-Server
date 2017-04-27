var htmlparser = require("htmlparser2");
var https = require('https');
var minify = require('html-minifier').minify;
var Fuse = require('fuse.js');
var arr = [];
var record = false;
var itemArray = [];
var finalRecord = false;

var core = {

  getAllDataFromQRTest: function(req, res){
    var chaveNFe = "41141115375991001055650030000000011000000016";
    var options = {
      hostname: 'www.sefaz.rs.gov.br',
      port: 443,
      path: '/ASP/AAE_ROOT/NFE/SAT-WEB-NFE-NFC_2.asp?chaveNFe=43170445543915000777650140002237171657174448&HML=false&NF=1CA06FD1F',
      method: 'GET',
      rejectUnauthorized: false
    };
    //process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
    https.get(options, function(response) {
      var body = '';
      response.on('data', function(chunk) {
        body += chunk;
      });
      response.on('end', function() {
        parser.write(body);
        res.json(mapper(body,chaveNFe));
        arr = [];
      });
    }).on('error', function(e) {
      console.log("Got error: " + e.message);
    }); 
  },

  getAllDataFromQR: function(req, res){
    var link = req.body.linkurl;
    var chaveNFe = link.substring(link.search("=")+1,link.search("&"));
    var path = "/ASP/AAE_ROOT/NFE/SAT-WEB-NFE-NFC_2.asp?chaveNFe="+chaveNFe+"&HML=false&NF=1CA06FD1F";

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
        res.json(mapper(body, chaveNFe, link));
        arr = [];
      });
    }).on('error', function(e) {
      console.log("Got error: " + e.message);
    }); 
  }
};

var parser = new htmlparser.Parser({
  onopentag: function(name, attribs){
    if(name === "td" && attribs.class === "NFCDetalhe_Item" || attribs.class === "NFCDetalhe_Item_Left" || attribs.class === "NFCDetalhe_Item_Right"|| attribs.class === "NFCDetalhe_Item_Center"){
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

function mapper(body, chaveNFe, linkurl){
  var items = [];
  var pagmethods = [];
  var vltotal;
  var vldesc;
  for (var i = arr.length - 1; i >= 0; i--) {
    if(arr[i].length > 2){
      if(arr[i].length == 6){
        var item = {
          id        : arr[i][0],
          descricao : minify(arr[i][1], {collapseWhitespace: true}),
          qtde      : arr[i][2],
          un        : arr[i][3],
          vl_unit    : passToNumber(arr[i][4]),
          vl_total   : passToNumber(arr[i][5])
        }

        var options = {
          keys: [{
            name: 'descricao',
            weight: 0.45
          }]
        };
        var fuse = new Fuse(items, options)
        var result = fuse.search(arr[i][1]);
        if (result.length === 0) {
          items.push(item);  
        } else {
          result.forEach(function(entry) {
              entry.qtde ++
          });
        }
      }
    }else{
      if(arr[i].length == 2){
        if(arr[i][0].indexOf("Valor descontos") !=-1){
          vldesc = passToNumber(arr[i][1]);
        } else if(arr[i][0].indexOf("Valor total") !=-1){
          vltotal = passToNumber(arr[i][1]);
        }else if (arr[i][0] != "FORMA PAGAMENTO"){
          pagmethods.push({forma_pag : arr[i][0], valor: passToNumber(arr[i][1])});
        }
      }
    }
  }
  //finish all mount the result json
  var dateString = body.substring(body.search("Data de Emiss")+17,body.search("Data de Emiss")+36)
  var date = new Date(dateString.substring(6,10), dateString.substring(3,5)-1, dateString.substring(0,2), dateString.substring(11,13), dateString.substring(14,16), dateString.substring(17,19));
  var mes = dateString.substring(3,10)
  var result = {
    id          :  chaveNFe,
    items       :  items,
    payments    :  { vl_total: vltotal, vl_desc: vldesc , pagmetodos: pagmethods},
    created_at  :  date,
    mes         :  mes,
    link        :  linkurl
  }
  return result;
}

String.prototype.replaceAll = function(search, replacement) {
    var target = this;
    return target.split(search).join(replacement);
};

function passToNumber(string){
  var newNumber = string.replaceAll(".","")
  newNumber = newNumber.replaceAll(",",".")
  return newNumber
}

module.exports = core; 
