var xml2js = require('xml2js');
var fs = require('fs');

var fichier = './Data_XML/reseau_1000v-999000t.xml'

var xmlParser = new xml2js.Parser({explicitArray: false, ignoreAttrs: true});
// xml -> json
function getFJ(callback) {
    fs.readFile(fichier,'utf-8', function(err,result){
        xmlParser.parseString(result, function (err, result) {  
            callback(JSON.stringify(result));
        });
    });
}

getFJ(function(result){
    var fj = result;

    var obj = JSON.parse(fj);

    
    var MongoClient = require('mongodb').MongoClient;
    var dbName = "projet_gps";
    var url = "mongodb://localhost:27017/" + dbName;

    MongoClient.connect(url, { useNewUrlParser: true }, function(err, db) {
        if (err) throw err;
        var dbase = db.db(dbName);
        
        dbase.collection("villes").drop(function(err, delOK) { 
            if (err);
            dbase.collection("routes").drop(function(err, delOK){
                if (err);
                dbase.collection("troncons").drop(function(err, delOK){
                    if (err);
                    creerCollection();
                });
            });
        });

        function creerCollection() {
            dbase.createCollection("villes", function (err, res) {
                if (err) throw err;
                obj.reseau.ville.forEach(function (r) {
                    var vil = {
                        "nom": r.nom,
                        "type": r.type,
                        "touristique": r.touristique
                    }
                    dbase.collection("villes").insertOne(vil, function (err, res) {
                        if (err) throw err;
                    });
                });
            });

            dbase.createCollection("troncons", function (err, res) {
                if (err) throw err;
                function traiterRoute(x) {
                    if (obj.reseau.route[x] == null) {
                        console.log('nombre de route : ' + x);
                        db.close();
                        return;
                    }
                    var ids = [];
                    var r = obj.reseau.route[x];
                    function traiterTroncons(i) {
                        console.log(i);
                        if (r.troncon[i] == null) {
                            if (i == 0) {
                                dbase.collection("troncons").insertOne(r.troncon, function (err, res) {
                                    if (err) throw err;
                                    ids.push(res.insertedId);
                                    traiterTroncons(i + 1);
                                });
                            } else {
                                var rou = {
                                    "nom": r.nom,
                                    "type": r.type,
                                    "troncon": ids
                                };
                                dbase.collection("routes").insertOne(rou, function (err, res) {
                                    if (err) throw err;
                                    traiterRoute(x + 1);
                                })
                            }
                        } else {
                            dbase.collection("troncons").insertOne(r.troncon[i], function (err, res) {
                                if (err) throw err;
                                ids.push(res.insertedId);
                                traiterTroncons(i + 1);
                            });
                        }
                    }
                    traiterTroncons(0);
                }
                dbase.createCollection("routes", function (err, res) {
                    if (err) throw err;
                    traiterRoute(0);
                });
            });
        }
    });
});
