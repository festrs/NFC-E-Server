# NFC-E-Server
Author Felipe Dias Pereira
This is a simple API to get data from NFC-E(electronic invoice) only in my state Rio Grande do Sul/RS,Brasil
Here is a link that is an example of qrcode from a NFC-E
https://www.sefaz.rs.gov.br/NFCE/NFCE-COM.aspx?chNFe=43160245543915000777650690000656401110130918&nVersao=100&tpAmb=1&dhEmi=323031352d31302d30325431313a31353a35362d30333a3030&vNF=30.58&vICMS=0.00&digVal=3246594b79486f3939395134536f565776367a752b544c374d6d593d&cIdToken=000001&cHashQRCode=A2ADBEB6A4668D0687B6258A82DF42994A5726BE
To generate the qrcode use http://goqr.me/
This web service receive the chNFe number for example 43160245543915000777650690000656401110130918 the number of the link above





Services 
access /test/postqrdata method get no requirements 
access /api/v1/qrdata method post require listcode = chNFe security by 
JWT with the secret key SupperDupperSecret and exp date required.git 