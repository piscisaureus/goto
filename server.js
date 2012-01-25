
var express = require('express'),
    socket_io = require('socket.io');

var notes = {};


/* Create express server */
var app = express.createServer();

app.use(app.router);
app.use(express.static(__dirname + '/static'));

app.get('/', function(req, res){
    res.redirect('/index.html');
});

app.listen(process.env.PORT || 80);


/* Create socket.io server */
var io = socket_io.listen(app);

io.sockets.on('connection', function(client) {
  client.emit('init', notes);

  client.on('note', function(note, clientId) {
    io.sockets.emit('note', note, clientId);

    if (note.message) {
      notes[note.id] = note;
    } else {
      delete notes[note.id];
    }
  });
});