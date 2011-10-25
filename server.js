require.paths.push('.');
var http = require('http');
var fs = require('fs');
var diffLib = require('diffLib');

var doc = fs.readFileSync('document.txt', 'utf8'); //"The initial document";
var lastUser = 0;

var changeLog = [] // Map of user IDs (which are ints) to lists of diffs.

var handleReq = function(req, res) {
        var df;
        if(req.method !== 'GET')  return;
        if(req.url === '/') {
                fs.readFile('client.html', "utf8", function(err, dat) {
                        if(err) { console.log("can't open client.html") ; throw err; }
                        res.writeHead(200, {'Content-Type': 'text/html'});
                        res.end(dat);
                })
        } else if(req.url.match(/^\/getDoc/)) {
                res.writeHead(200, {'Content-Type': 'text/json'});
                res.end(JSON.stringify([doc,++lastUser]));
                changeLog[lastUser] = [];
        } else if(df = req.url.match(/^\/getDiff\?(.*)/)) {
                var uid = unescape(df[1]);
                var mydiffs = changeLog[uid];
                res.writeHead(200, {'Content-Type': 'text/plain'});
                res.end(JSON.stringify(mydiffs));
                changeLog[uid] = [];
        } else if(df = req.url.match(/^\/putDiff\?(.*)/)) {
                //console.log("Got a diff: "+unescape(df));
                df = JSON.parse(unescape(df[1]));
                var result = applyConcurrentDiff(df);
                res.writeHead(200, {'Content-Type': 'text/plain'});
                res.end(result);
        } else {
                //console.log("Gonna send a script: "+req.url+"\n");
                fs.readFile(req.url.substring(1,req.url.length), "utf8", function(err,dat) {
                        if(err) { console.log("can't open some file") ; throw err; }
                        //console.log(dat);
                        res.writeHead(200, {'Content-Type': 'text/javascript'});
                        res.end(dat);
                });
        }
}

var applyConcurrentDiff = function(df) {
        mydiffs = changeLog[df.uid];
        for(var i = 0; i<mydiffs.length ; i++) {
                for(var j = 0; j<df.diffs.length ; j++) {
                        var currentDiff = df.diffs[j];
                        if (diffLib.isClash(mydiffs[i],currentDiff)) return "ERR";
                        diffLib.updateAafterB(currentDiff, mydiffs[i]);
                }
        }
        for(var j = 0; j<df.diffs.length ; j++) {
                doc = diffLib.applyDiff(doc,df.diffs[j]);
        }
        fs.writeFile('document.txt',doc,"utf8");
        for (var i = 1; i< changeLog.length ; i++) {
                if(i!==df.uid) changeLog[i] = changeLog[i].concat(df.diffs);
        }
        return "OK";
}

http.createServer(handleReq).listen(4242,"127.0.0.1")


