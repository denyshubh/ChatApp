const http = require('http');
const fs = require('fs');
const path = require('path');
const mime = require('mime');
var cache = {};


// Handle 404 File not found Error!

function send404(res) {
    res.writeHead(404, {
        'Content-Type': 'text/plain'
    });
    res.write('Error 404: resource not found!');
    res.end();
}

// This function serves file data
function sendFile(response, filePath, fileContents) {
    response.writeHead(
        200, {
            "content-type": mime.lookup(path.basename(filePath))
        }
    );
    response.end(fileContents);
}
// Determine if the file is cached, if so, serves it. if not than read from disk and then serve it.

function serveStatic(response, cache, absPath) {
    if (cache[absPath]) {
        sendFile(response, absPath, cache[absPath]);
    } else {
        fs.exists(absPath, function (exists) {
            if (exists) {
                fs.readFile(absPath, function (err, data) {
                    if (err) {
                        send404(response);
                    } else {
                        cache[absPath] = data;
                        sendFile(response, absPath, data);
                    }
                });
            } else {
                send404(response);
            }
        });
    }
}

// creating http server

var server = http.createServer(function (request, response) {
    var filePath = false;
    if (request.url == '/') {
        filePath = 'public/index.html';
    } else {
        filePath = 'public' + request.url;
    }
    var absPath = './' + filePath;
    serveStatic(response, cache, absPath);
});
// Starting the server

server.listen(3000, function () {
    console.log("Server listening on port 3000.");
});

var chatServer = require('./lib/chat_server');
chatServer.listen(server);
