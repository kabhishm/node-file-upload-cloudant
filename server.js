var express = require("express"),
    app = express(),
    dotenv = require("dotenv"),
    cfenv = require("cfenv"),
    Cloudant = require("cloudant"),
    _ = require("underscore"),
    async = require("async");

dotenv.load();

var vcapLocal = null
try {
  vcapLocal = require("./vcap-local.json")
}
catch (e) {}

var appEnvOpts = vcapLocal ? {vcap:vcapLocal} : {}
var appEnv = cfenv.getAppEnv(appEnvOpts);

app.use(require("skipper")());

// Retrieves service credentials for the input service
function getServiceCreds(appEnv, serviceName) {
  var serviceCreds = appEnv.getServiceCreds(serviceName)
  if (!serviceCreds) {
    console.log("service " + serviceName + " not bound to this application");
    return null;
  }
  return serviceCreds;
}

var cloudantCreds = getServiceCreds(appEnv, "cloudant-node-file-upload"),
  dbName = "images",
  cloudant,
  db;

app.use(express.static(__dirname + "/public"));


app.get("/files/:filename", function (request, response) {
    db.attachment.get(request.params.filename, request.params.filename).pipe(response);
});

app.get("/files", function (request, response) {
    db.list(function(err, body) {
        if (!err) {
            response.send(body.rows);
        }
        else {
            response.json({});
        }
    });
});

function blah() {

    // Build an instance of a writable stream in object mode.
    var receiver__ = require('stream').Writable({ objectMode: true });

    receiver__._write = function onFile(__newFile, _unused, done) {
        __newFile.pipe(db.attachment.insert(__newFile.filename, __newFile.filename, null, __newFile.headers["content-type"]));

        __newFile.on("end", function(err, value) {
            console.log("finished uploading", __newFile.filename);
            done();
        });

    };

    return receiver__;
}

app.post("/upload", function (request, response) {
    var stream = request.file("file").pipe(blah());
    stream.on("finish", function () { response.redirect("/") });
});

var port = process.env.PORT || 5000;
app.listen(port, function() {
  console.log("server started on port " + appEnv.port);
  var dbCreated = false;
  Cloudant({account:cloudantCreds.username, password:cloudantCreds.password}, function(er, dbInstance) {
      cloudant = dbInstance;
      if (er) {
          return console.log('Error connecting to Cloudant account %s: %s', cloudantCreds.username, er.message);
      }

      console.log('Connected to cloudant');
      cloudant.ping(function(er, reply) {
          if (er) {
              return console.log('Failed to ping Cloudant. Did the network just go down?');
          }

          console.log('Server version = %s', reply.version);
          console.log('I am %s and my roles are %j', reply.userCtx.name, reply.userCtx.roles);

          cloudant.db.list(function(er, all_dbs) {
              if (er) {
                  return console.log('Error listing databases: %s', er.message);
              }

              console.log('All my databases: %s', all_dbs.join(', '));

              _.each(all_dbs, function(name) {
                  if (name === dbName) {
                      dbCreated = true;
                  }
              });
              if (dbCreated === false) {
                  cloudant.db.create(dbName, seedDB);
              }
              else {
                  db = cloudant.db.use(dbName);
                  console.log("DB", dbName, "is already created");
              }
          });
      });
  });
});

function seedDB(callback) {
  db = cloudant.use(dbName);

  async.waterfall([
    function (next) {
      var designDocs = [
          {
            _id: '_design/photos',
            views: {
              all: {
                map: function (doc) { if (doc.type === 'image') { emit(doc._id, doc); } }
              }
            }
          }
     ];

      async.each(designDocs, db.insert, next);
    },
    function (next) {
      console.log("Created DB", dbName, "and populated it with initial purchases");
      next();
    }
  ], callback)
}

require("cf-deployment-tracker-client").track();
