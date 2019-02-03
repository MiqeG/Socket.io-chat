//color spectrum for random color calculation
$(function () {
  
  var FADE_TIME = 150; // ms
  var TYPING_TIMER_LENGTH = 400; // ms
  var COLORS = [
    '#e21400', '#91580f', '#f8a700', '#f78b00',
    '#58dc00', '#287b00', '#a8f07a', '#4ae8c4',
    '#3b88eb', '#3824aa', '#a700ff', '#d300e7'
  ];
  //constant config
  let transferFolder ;
  //audio file paths
  var audioadmin = new Audio("./sounds/duke.mp3");
  var audio = new Audio('./sounds/honk.wav');
  var audio2 = new Audio('./sounds/private.mp3');
  var audio3 = new Audio('./sounds/mk.mp3');
  var audio4 = new Audio('./sounds/sheep.mp3');
  var audio5 = new Audio('./sounds/opendoor.mp3');
  var audio6 = new Audio('./sounds/closedoor.mp3');
  var elementFading = 800;
  let emoticonArray =[];
  // Initialize variables and do hiding of divs for fx
  let serverEncryptionKey;
  var $window = $(window);
  var $adminPage = $('.admin.window');
  var $emoticondiv = $('#emoticondiv');
  var $emoticonwindow = $('.emoticon.window');
  var $closediv = $('#closediv');
  $emoticonlabelpage = $('emoticonlabel.page');
  var $emoticonlabelexpander = $('#emoticonlabelexpander');
  $emoticonwindow.hide();
  $adminPage.hide();
  var $privatemessage = $('.privatemessage');
  $privatemessage.hide();
  var $closebutton = $('#closebutton');
  var $privateuserlabel = $('#privateuserlabel');
  $privatemessagetext = $('#privatemessagetext');
  var $disconnect = $('#disconnect');
  $disconnect.hide();
  var $usernameInput = $('.usernameInput'); // Input for username
  var $messages = $('.messages'); // Messages area
  var $inputMessage = $('.inputMessage'); // Input message input box
  var $apache = $('#apache');
  var $loginPage = $('.login.page'); // The login page
  var $chatPage = $('.chat.page'); // The chatroom page
  var $renamedtext = $('#renamedtext');
  var $okbutton = $('#okbutton');
  var $disconnect = $('#disconnect');
  var $renamed = $('#renamed');
  var $honk = $('#honk');
  var $wholabel = $('#wholabel');
  var $userlabel = $('#userlabel');
  var $iplabel = $('#iplabel');
  var $chatArea = $('.chatArea');
  var $transfer = $('#transfer');
  var adminrenamed = false;
  var adminaccount = false;
  var $usernamefield = $('#usernamefield');
  var $usernameprompt = $('#usernameprompt');

  //hide elements on startup

  $usernamefield.hide();
  $usernameprompt.hide();
  $usernameprompt.fadeIn(elementFading);
  $usernamefield.fadeIn(elementFading);

  // Prompt for setting a username
  var username;
  var userkey = "";

  var connected = false;
  var typing = false;
  var lastTypingTime;
  var $currentInput = $usernameInput.focus();
  //Sounds

  var honker;
  

  var socket = io();
  socket.on('info', (data) => {
   
    emoticonArray = data.emoticonArray;
    transferFolder = data.transferFolder;
    //add emoticons to div
    var ctremoticon = 0;
    emoticonArray.forEach(function (emoticon) {

      $emoticondiv.append($('<div></div>').attr('id', emoticon).addClass('emoticondiv2')
        .append($('<div></div>').addClass('dEmoticon').attr('id', ctremoticon)
          .click(function () {
            if ($privatemessage.is(":visible")) {
              $privatemessagetext.val($privatemessagetext.val() + emoticonArray[this.id]);
              $privatemessagetext.focus();
            }
            else if ($loginPage.is(":visible")) {
              $usernamefield.val($usernamefield.val() + emoticonArray[this.id]);
              $usernamefield.focus();
            }
            else {
              $inputMessage.val($inputMessage.val() + emoticonArray[this.id]);
              $inputMessage.focus();
            }
          })
          .append(emoticon)));
      ctremoticon++;
    });
    $emoticonwindow.fadeIn(elementFading);
    $emoticonwindow.css('z-index', 2)
    $emoticonwindow.draggable();
  })
  var socketidarray = [];
  const addParticipantsMessage = (data) => {
    var message = '';
    var message2 = "";

    var visible = false;


    //emoticon click events
    $emoticonlabelexpander.click(function () {
      if ($emoticonwindow.is(":visible") && visible == true) {
        visible = false;
        $emoticonwindow.fadeOut();
        $emoticonwindow.css('z-index', 0);
      }
      else if ($emoticonwindow.is(":hidden") && visible == false) {
        $emoticonwindow.fadeIn();
        $emoticonwindow.css('z-index', 0);
        visible = true;
      }
    });
    $closediv.click(function () {
      $emoticonwindow.fadeOut();
      visible = false;

    });
    $closebutton.click(function () {

      $privatemessage.fadeOut();
    });
    // button click events

    $privatemessage.draggable();

    $adminPage.draggable();
    // participants log message
    if (data.numUsers === 1) {
      message += "there's 1 participant";
    } else {
      message += "there are " + data.numUsers + " participants";
    }
    if (data.usermessage != undefined) {
      message2 = data.usermessage;
      log(message2);
    }
    log(message);

  }
  //message encryption functions
  function aes_encrypt(password, content) {
    return CryptoJS.AES.encrypt(content, password).toString();
  }

  function aes_decrypt(password, encrypted) {
    return CryptoJS.AES.decrypt(encrypted, password).toString(CryptoJS.enc.Utf8);
  }
  // honk button click event

  $honk.click(function () {
    var ctr = 0;
    for (var i = 0; i < socketidarray.length; i++) {
      if (socketidarray[i].username == $userlabel.text()) {
        console.log(honker + " " + $userlabel.text());
        socket.emit('honk', {
          honker: username,
          honkee: $userlabel.text()
        });
        ctr++;
      }

    }
    if (ctr == 0) {
      alert("user unreacheble!");
    }
  });
  // rename button click event
  $renamed.click(function () {
    var found = false;
    for (var i = 0; i < socketidarray.length; i++) {
      if (socketidarray[i].username == $renamedtext.val()) {
        found = true;
        alert('username already in use');
        return;
      }
    }

    var ctr = 0;
    for (var i = 0; i < socketidarray.length; i++) {
      if (socketidarray[i].username == $userlabel.text()) {
        console.log(socketidarray[i].username + " " + $renamedtext.val());
        console.log(socketidarray[i].id + " " + socketidarray[i].username);
        var admin = 'No';
        if (adminaccount) {
          admin = 'Yes';
        }

        if ($renamedtext.val() != '') {
          socket.emit('newname', {

            oldname: $userlabel.text(),
            rename: $renamedtext.val(),
            socketid: socketidarray[i].id,
            admin: admin,
            adminname: username

          });
        }
        else {
          alert('champ vide');
          return;
        }

        ctr++;

      }

    }
    if (ctr == 0) {
      alert("user unreacheble!");
    }
  });
  // disconnect button click event
  $disconnect.click(function () {
    var ctr = 0;
    for (var i = 0; i < socketidarray.length; i++) {
      if (socketidarray[i].username == $userlabel.text()) {
        socket.emit('admindisconnect', {
          admin: username,
          admindisconnect: $userlabel.text()
        });
        ctr++;
        $adminPage.fadeOut();
      }
    }

    if (ctr == 0) {
      alert("user unreacheble!");
    }
  });
  //ok button
  $okbutton.click(function () {

    $adminPage.fadeOut();
  });
  // Sets the client's username
  const setUsername = () => {
    username = $usernameInput.val().trim();


    // If the username is valid
    if (username) {
      $usernameprompt.fadeOut(elementFading);
      $usernamefield.fadeOut(elementFading);

      $emoticonwindow.fadeOut(200);

      socket.emit('check', {
        username: username,

      });

    }
  }

  // Sends a chat message
  const sendMessage = () => {
    var message = $inputMessage.val();
    // Prevent markup from being injected into the message
    if (message == "/adminRoxxor") {
      adminaccount = true;
      $inputMessage.val('');
      socket.emit('adminconnected', {
        admin: username
      });
      return;
    }
    // if there is a non-empty message and a socket connection
    if (message && connected) {
      $inputMessage.val('');
      addChatMessage({
        username: username,
        message: message
      });

      var encrypted = aes_encrypt(userkey, message);


      socket.emit('new message', encrypted);
    }
  }

  // Log a message
  const log = (message, options) => {
    var $el = $('<li>').addClass('log').text(message);
    addMessageElement($el, options);
  }

  // Adds the visual chat message to the message list
  const addChatMessage = (data, options) => {
    // Don't fade the message in if there is an 'X was typing'
    var $typingMessages = getTypingMessages(data);
    options = options || {};
    if ($typingMessages.length !== 0) {
      options.fade = false;
      $typingMessages.remove();
    }
    var $destinationdiv;
    // standard messages
    var $usernameDiv = $('<span class="username"/>')
      .text(data.username)
      .css('color', getUsernameColor(data.username));
    var $messageBodyDiv = $('<span class="messageBody">')
      .text(data.message);
    //private messages
    if (data.private != undefined) {
      $messageBodyDiv.css('color', 'rgb(213, 76, 218)');
      if (data.self == false) {

        $destinationdiv = $('<span class="username"/>')
        $usernameDiv.text('FROM>').css('color', 'rgb(213, 76, 218)');
        $destinationdiv.text(data.username).css('color', getUsernameColor(data.username));
      }
      else if (data.self == true) {
        $messageBodyDiv.css('color', 'rgb(102, 153, 255)');
        $destinationdiv = $('<span class="username"/>')
        $usernameDiv.text('TO>').css('color', 'rgb(102, 153, 255)');
        $destinationdiv.text(data.destination).css('color', getUsernameColor(data.destination));
      }

    }
    var typingClass = data.typing ? 'typing' : '';
    var $messageDiv = $('<li class="message"/>')
      .data('username', data.username)
      .addClass(typingClass)
      .append($usernameDiv);
    if ($destinationdiv != undefined) {
      $messageDiv.append($destinationdiv);
    }
    $messageDiv.append($messageBodyDiv);
    addMessageElement($messageDiv, options);
  }

  // Adds the visual chat typing message
  const addChatTyping = (data) => {
    data.typing = true;

    addChatMessage(data);
  }

  // Removes the visual chat typing message
  const removeChatTyping = (data) => {
    getTypingMessages(data).fadeOut(function () {
      $(this).remove();
    });
  }

  // Adds a message element to the messages and scrolls to the bottom
  // el - The element to add as a message
  // options.fade - If the element should fade-in (default = true)
  // options.prepend - If the element should prepend
  //   all other messages (default = false)
  const addMessageElement = (el, options) => {
    var $el = $(el);

    // Setup default options
    if (!options) {
      options = {};
    }
    if (typeof options.fade === 'undefined') {
      options.fade = true;
    }
    if (typeof options.prepend === 'undefined') {
      options.prepend = false;
    }

    // Apply options
    if (options.fade) {
      $el.hide().fadeIn(FADE_TIME);
    }
    if (options.prepend) {
      $messages.prepend($el);
    } else {
      $messages.append($el);
    }
    $messages[0].scrollTop = $messages[0].scrollHeight;
  }

  // Updates the typing event
  const updateTyping = () => {
    if (connected) {
      if (!typing) {
        typing = true;
        socket.emit('typing', {

        });
      }
      lastTypingTime = (new Date()).getTime();

      setTimeout(() => {
        var typingTimer = (new Date()).getTime();
        var timeDiff = typingTimer - lastTypingTime;
        if (timeDiff >= TYPING_TIMER_LENGTH && typing) {
          socket.emit('stop typing');
          typing = false;
        }
      }, TYPING_TIMER_LENGTH);
    }
  }

  // Gets the 'X is typing' messages of a user
  const getTypingMessages = (data) => {
    return $('.typing.message').filter(function (i) {
      return $(this).data('username') === data.username;
    });
  }

  // Gets the color of a username through our hash function
  const getUsernameColor = (username) => {
    // Compute hash code
    var hash = 7;
    for (var i = 0; i < username.length; i++) {
      hash = username.charCodeAt(i) + (hash << 5) - hash;
    }
    // Calculate color
    var index = Math.abs(hash % COLORS.length);
    return COLORS[index];
  }

  // Keyboard events
  $privatemessage.keydown(event => {

    if (event.which === 13 && $privatemessagetext.val() != '') {
      if ($privatemessagetext.val() == 'undefined') { return; }
      var to;
      var from;
      var ctr12 = 0;
      for (var i = 0; i < socketidarray.length; i++) {
        if (socketidarray[i].username == username) {
          from = socketidarray[i];
          ctr12++;

        }

        if (socketidarray[i].username == $privateuserlabel.text()) {
          to = socketidarray[i];
          ctr12++;

        }
      }
      if (ctr12 != 2) {
        alert('error');
        return;
      }

      console.log(from + "\r\n" + to);
      // tell server to execute 'new message' and send along one parameter

      var encrypted = aes_encrypt(userkey, $privatemessagetext.val());

      socket.emit('privatemessage', {

        from: from,
        to: to,
        message: encrypted
      });
      addChatMessage({
        username: from.username,
        message: $privatemessagetext.val(),
        destination: to.username,
        private: true,
        self: true
      });
      $privatemessagetext.val('');
    }

  });
  $window.keydown(event => {

    // Auto-focus the current input when a key is typed

    // When the client hits ENTER on their keyboard
    if (event.which === 13) {

      if (username) {

        if (username == 'SERVER') { alert('nickname not allowed by SERVER!!'); location.reload(); }


        sendMessage();
        socket.emit('stop typing');
        typing = false;
      }

      else {
        setUsername();
      }
    }

    else {
      if (event.which === 8) {
        var str = $renamedtext.val();
        str = str.substring(0, str.length - 1);
        $renamedtext.css('color', getUsernameColor(str));
      }
    }

  });

  $inputMessage.on('input', () => {
    updateTyping();
  });
  $usernamefield.change(function () {

    $usernamefield.css('color', getUsernameColor($usernamefield.val()));


  });
  $renamedtext.change(function () {

    $renamedtext.css('color', getUsernameColor($renamedtext.val()));


  });
  //adjust username color when typing in input on keypress and key up events in admin and loginPage
  $loginPage.keypress(event => {
    if (event.which === 8) {

      $usernamefield.css('color', getUsernameColor($usernamefield.val()));
    }
    else {
      if ($loginPage.is(":visible") && event.which !== 13) {
        if ($usernamefield.val().length < 14) {
          var char = String.fromCharCode(event.which);
          $usernamefield.css('color', getUsernameColor($usernamefield.val() + char));
        }

      }
    }


  });
  $loginPage.keyup(event => {

    if ($loginPage.is(":visible")) {
      if ($usernamefield.val().length < 14) {
        var char = String.fromCharCode(event.which);
        $usernamefield.css('color', getUsernameColor($usernamefield.val()));
      }

    }
  });
  $adminPage.keypress(event => {
    if (event.which === 8) {

      $renamedtext.css('color', getUsernameColor($renamedtext.val()));
    }
    else {
      if ($adminPage.is(":visible") && event.which !== 13) {
        if ($renamedtext.val().length < 14) {
          var char = String.fromCharCode(event.which);
          $renamedtext.css('color', getUsernameColor($renamedtext.val() + char));
        }

      }
    }

  });
  $adminPage.keyup(event => {

    if ($adminPage.is(":visible")) {
      if ($renamedtext.val().length < 14) {
        var char = String.fromCharCode(event.which);
        $renamedtext.css('color', getUsernameColor($renamedtext.val()));
      }

    }
  });
  // page click events

  // Focus input when clicking anywhere on login page
  $loginPage.click(() => {
    $currentInput.focus();
  });

  // Focus input when clicking on the message input's border
  $inputMessage.click(() => {
    $inputMessage.focus();
  });
  //get server encryption key on serverkey event
  socket.on('serverkey', (data) => {
    if (data.serverEncryptionKey != "") {
      serverEncryptionKey = data.serverEncryptionKey;
    }
    var bytes = CryptoJS.AES.decrypt(data.key, serverEncryptionKey);
    var plaintext = bytes.toString(CryptoJS.enc.Utf8);

    var ar = [];
    ar = plaintext.split('');
    var finalstring = ar[0] + ar[1] + 'x' + ar[2] + ar[3] + 'y' + ar[4] + 'z' + ar[5] + ar[6];

    userkey = finalstring;
  });
 //on admin connection event
  socket.on('adminconnected', (data) => {
    addChatMessage({
      username: "SERVER",
      message: data.admin + " GAINED ADMIN STATUS "
    });
    audioadmin.play();
  });
  //Honk ability
  socket.on('honk', () => {
    audio.play();
  });
  // incoming private message
  socket.on('privatemessage', (data) => {
    audio2.play();
    var decrypted = aes_decrypt(userkey, data.message);
    addChatMessage({
      username: data.username,
      message: decrypted,
      destination: data.destination,
      private: true,
      self: false
    });
  });
  //When server is full event
  socket.on('serverfull', () => {
    alert("Server is full retry later");
  });
  // Whenever the server emits 'login', log the login message
  socket.on('login', (data) => {
    connected = true;
    // Display the welcome message
    var message = "Welcome to MGG Chat-Server – ";
    log(message, {
      prepend: true
    });
    addParticipantsMessage(data);
  });
  // On connection if username is already connected 
  socket.on('rename', () => {
    alert("Username already in use click ok and refresh page!");
    location.reload();
  });

  //client list refresh
  socket.on('userlist', (data) => {
    $('#usertable').empty();

    socketidarray = data.objectarray;

    for (var i = 0; i < socketidarray.length; i++) {
      console.log(socketidarray[i]);
      // add user button and add click event
      $('#usertable').append($('<tr class="dynTablerowsuser"></tr>').append($('<p class="nickname" id="' + socketidarray[i].username + '"></p>').append(socketidarray[i].username).css('color', getUsernameColor(socketidarray[i].username))));
      var clientobject = socketidarray[i].username;
      console.log(clientobject);
      $('p').addClass('UserPara');
      $('p').click(function () {
        //socket id passed as id
        var prompter2 = this.id;
        $privateuserlabel.text(prompter2);
        $privateuserlabel.css('color', getUsernameColor(prompter2));

        $currentInput = $privatemessagetext.focus();
        $privatemessage.fadeIn();
        $privatemessage.css('z-index', 2);
      });
      //double click on username in user list
      $('p').dblclick(function () {
        $renamedtext.val(this.id).css('color', getUsernameColor(this.id));
        $currentInput = $renamed.focus();
        honker = username;
        honkee = this.id;

        var prompter = "Server Commands for: ";
        var prompter2 = this.id;
        $wholabel.text(prompter);
        $privateuserlabel.text(prompter2);

        $userlabel.text(prompter2);
        $userlabel.click(function () {
          $privatemessage.fadeIn();
        });
        $userlabel.css('color', getUsernameColor(prompter2));
        $privateuserlabel.css('color', getUsernameColor(prompter2));
        var ipaddress = 'unknown';
        //search for ip of user
        for (var i = 0; i < socketidarray.length; i++) {
          if (socketidarray[i].username == this.id) {
            ipaddress = socketidarray[i].address;


          }
        }
        //display admin page 

        $adminPage.fadeIn(this.ip);
        $adminPage.css('z-index', 0);
        $privatemessage.css('z-index', 2);
        $iplabel.text(ipaddress);
        $iplabel.hide();
        $iplabel.click(function () {

          $inputMessage.val(ipaddress);
        })
        $renamed.hide();
        $renamedtext.hide();
        //if admin display following options
        if (adminaccount == true) {

          $renamed.show();
          $renamedtext.show();
          $disconnect.show();
          $iplabel.show();
        }
        else if (username == this.id) {
          if (adminrenamed == false) {
            $renamed.show();
            $renamedtext.show();
            $iplabel.show();
          }
          else {
            $renamed.hide();
            $renamedtext.hide();
            $iplabel.hide();
          }
        }
      });
    }
  });

  // if user is unreachable
  socket.on('usernotfound', () => {
    alert("user not found!");
  });
  //refresh file list
  socket.on('transferfiles', (data) => {
    $apache.empty();
    var filearray = [];
    filearray = data.message;


    for (var i = 0; i < filearray.length; i++) {
      console.log(filearray[i]);
      $apache.append($($('<tr class="dynTablerows"></tr>')).append('<a target="_blank" id="' + filearray[i] + '" class="dynamica" style="text-decoration:none" href="/' + transferFolder + '/' + filearray[i] + '" >' + filearray[i] + '</a>'));

    }

  });

  // Whenever the server emits 'new message', update the chat body
  socket.on('new message', (data) => {

    var decrypted = aes_decrypt(userkey, data.message);

    addChatMessage({
      username: data.username,
      message: decrypted
    });
  });
  //renaming to existing user
  socket.on('cannot rename', (data) => {
    alert("New name already in use or ne name too long (14)!");
  });
  //kicked by admin
  socket.on('Kicked', (data) => {
    audio3.play();
    var kickeduser = data.kicked;
    addChatMessage({
      username: "SERVER",
      message: " kicked: " + kickeduser + " out!!"
    });
  });
  //recieving hgonk log message
  socket.on('honkmessage', (data) => {

    addChatMessage({
      username: "SERVER",
      message: data.honker + "   honked :   " + data.honkee
    });
  });
  // Renamed by admin server log
  socket.on('renamelog', (data) => {
    audio4.play();
    $privateuserlabel.text(data.rename);
    $privateuserlabel.css('color', getUsernameColor(data.rename));
    $userlabel.text(data.rename).css('color', getUsernameColor(data.rename));
    if (data.oldname == username) {

      username = data.rename;
      $inputMessage.attr('placeholder', data.rename);

      $usernameInput = data.rename;
      if (adminaccount != true) {

        if (data.admin == 'Yes') {

          adminrenamed = true;
          $renamed.hide();
          $renamedtext.hide();
        }

      }
    }
    addChatMessage({
      username: "SERVER",
      message: 'USER:  ' + data.adminname + '  Renamed  ' + data.oldname + '  to:  ' + data.rename
    });
  });


  // Whenever the server emits 'user joined', log it in the chat body
  //user joined log
  socket.on('user joined', (data) => {
    audio5.play();
    addParticipantsMessage(data);
  });


  // Whenever the server emits 'user left', log it in the chat body
  socket.on('user left', (data) => {
    audio6.play();
    log(data.username + ' left');
    addParticipantsMessage(data);
    removeChatTyping(data);
  });

  // Whenever the server emits 'typing', show the typing message
  socket.on('typing', (data) => {
    data.username =
      addChatTyping(data);
  });

  // Whenever the server emits 'stop typing', kill the typing message
  socket.on('stop typing', (data) => {
    removeChatTyping(data);
  });
  //disconnect
  socket.on('disconnect', () => {
    log('you have been disconnected');

  });
  //reconnect
  socket.on('reconnect', () => {
    log('you have been reconnected');
    if (username) {

      socket.emit('check', {
        username: username,

      });

    }
  });
  //validated by server
  socket.on('validated', () => {
    $inputMessage.attr("placeholder", username + ' type here... ');
    $loginPage.fadeOut();
    $chatPage.show();
    socket.emit('add user', username);
  });
  //problem reconnecting
  socket.on('reconnect_error', () => {
    log('attempt to reconnect has failed');
  });

});
