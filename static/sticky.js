
$(function() {
  var notes = {},
      clientId = Math.round(Math.random() * 1e12),
      socket = io.connect(window.location.protocol + '//' +
                          window.location.host + '/');

  function send(note) {
    socket.emit('note', note, clientId);
  }

  socket.on('note', function(note, clientId_) {
    if (clientId_ != clientId) {
      update(note);
    }
  });

  socket.on('init', function(notes) {
    for (var k in notes) {
      if (notes.hasOwnProperty(k)) {
        update(notes[k]);
      }
    }
  });


  $('.create').click(create);

  function create() {
    var note = {
      id: (new Date()).getTime() + "-" + clientId,
      message: "",
      x: Math.floor(($('body').innerWidth() - 200) * Math.random()),
      y: Math.floor(($('body').innerHeight() - 200) * Math.random())
    };

    update(note, true);
  }


  function update(note_, create) {
    var div;
    var message;
    var textarea;
    var drag;
    var note;

    if (notes[note_.id]) {
       note = notes[note_.id];
       note.x = note_.x;
       note.y = note_.y;
       note.message = note_.message;
    } else {
      note = notes[note_.id] = note_;
    }

    div = $('#note-' + note.id);

    if (!div.length) {
      div = $('<div />')
              .attr('id', 'note-' + note.id)
              .addClass('note')
              .appendTo($('body'));

      message = $('<p />')
                  .appendTo(div);

      textarea = $('<textarea />')
                  .appendTo(div)
                  .hide();

      message.click(function() {
        message.hide();
        textarea.show();
        textarea.focus();
      });

      textarea.blur(function() {
        message.show();
        textarea.hide();
        if (!note.message) update(note); // remove me
      });

      textarea.change(function() {
        note.message = textarea.val();
        update(note);
        send(note);
      });

      function move(event) {
        note.x += event.pageX - drag.x;
        note.y += event.pageY - drag.y;
        drag.x = event.pageX;
        drag.y = event.pageY;

        update(note);
        send(note);

        event.preventDefault();
      }

      div.mousedown(function(event) {
        if (!event.target || !event.target.nodeName ||
            event.target.nodeName.toLowerCase() != 'div') {
          return;
        }

        drag = {
          x: event.pageX,
          y: event.pageY
        };
        $('body').mousemove(move);

        event.preventDefault();
      });

      $('body').mouseup(function() {
        $('body').unbind('mousemove', move);
      });

    } else {
      message = div.find('p');
      textarea = div.find('textarea');
    }

    div
      .css({
        top: ~~+note.y,
        left: ~~+note.x
      });

    message.text(note.message);
    textarea.val(note.message);

    if (create) {
      textarea.show();
      message.hide();
      textarea.focus();
    } else if (!note.message) {
      div.remove();
      delete notes[note.id];
    }
  }
});