//zzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzz
//zzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzz
// MGG Chat Server
//zzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzz
//zzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzz

//constant configuration parameters

const configFile = require('./config/server_config.json'); //configuration file
let IoOperations = require('./scripts/IO/IO.js')//require for IO operations
const tempDirectory = configFile.tempDirectoryPath + configFile.tempDirectoryName;
const privateKey = IoOperations.readSync(configFile.keyPath, configFile.keyEncoding);
const certificate = IoOperations.readSync(configFile.certPath, configFile.certEncoding);
let bannedips = IoOperations.readSync(configFile.bannedFolder, configFile.bennedFileEncoding);
const credentials = { key: privateKey, cert: certificate };
const express = require('express');
const app = express();
const path = require('path');
const events = require('events');
const http = require('http');
const bodyParser = require('body-parser');
const server = require('https').createServer(credentials, app);
//add socket.io in order to use sockets with our server 
const io = require('socket.io')(server);
let session = require('express-session');
let fFormat = require('./scripts/format/format.js')
let today = fFormat.formatDate();
let routeHandler = require('./scripts/routes/routes.js')
let serverEncryption = require('./scripts/encryption/serverEncryption.js')

let eventEmitter = new events.EventEmitter();
let address;
let addressarray = [];
let socketidarray = [];
let filearray = [];
let serverkey;

//xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
// Generate server key sent to clients for message encryption(sent every minute)
//xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx


serverkey = serverEncryption.getkey(configFile.serverEncryptionKey);

//set interval to emit new serverkey for client side encryption every minute 

setInterval(function () {
  let date = new Date();
  if (date.getSeconds() === 0) {
    serverkey = serverEncryption.getkey(configFile.serverEncryptionKey);
    io.emit('serverkey', {
      key: serverkey,
      serverEncryptionKey: ""
    });
  }
}, 1000);

//Read files from transfer directory at startup

filearray = IoOperations.readFilesTempSync(filearray, configFile.transferfilesFolder, configFile.tempDirectoryName);

//Delete eventual files in temp folder

IoOperations.deleteFilesTemp(tempDirectory);

//Set time format for file and console logs

const pathoffile = configFile.logFolder + "serverlog_" + today + ".txt";

//save log file to disk

IoOperations.saveLogFile(pathoffile);
//xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
//Create chat server
//xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
server.listen(configFile.port, (err) => {
  if (err) throw err;
  console.log('Server listening at port %d', configFile.port);
  IoOperations.startServerLog(pathoffile, configFile.port)

});
//xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
// Start http server on port1 This server will route connections to the https server.
//xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

const clearserver = http.createServer(function (req, res) {
  res.writeHead(302, {
    'Location': configFile.root
  });
  res.end();

})
clearserver.listen(configFile.port1);
console.log('http started on port: ' + configFile.port1);
//xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
// Routing and authentication
//xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

let User = require('./models/user')

//serve registration files before authentication

app.use(express.static(path.join(__dirname, configFile.registration)));

//set duration for cookie expiration
let year = 31536000000;

//use express-session for sessions
app.set('trust proxy', 1);
app.use(session({
  secret: configFile.sessionSecret,
  resave: false,
  saveUninitialized: true,
  cookie: { secure: true, maxAge: year }
}))

//session variable
let sess;

//use body parser for parsing requests

app.use(bodyParser.urlencoded({ extended: true }));

//validate credentials

app.post("/credentials", (req, res, next) => { routeHandler.credentialsRouter(User, req, res, next) });

//get user information from registration form

app.post('/registrationValidation', function (req, res, next) { routeHandler.registrationValidationRouter(User, req, res, next) });

//Log in  middleware

app.use(function isLoggedIn(req, res, next) {

  sess = req.session;
  if (sess.logged == true) {
    next();
  }
  else {
    res.redirect('/registration.html');
  }

});

//serve static files after authentication
app.use(express.static(path.join(__dirname, configFile.publicFolder)));

//listen for incoming files from clients
app.post('/upload', function (req, res) {
  routeHandler.uploadRouter(pathoffile, configFile, req, res, eventEmitter, tempDirectory)
});


// set users to 0
let numUsers = 0;

//zzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzz
//zzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzz
// SOCKET EVENTS
//zzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzz
//zzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzz


//xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
// On client connection (all events are nested within this event)
//xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx


io.on('connection', (socket) => {

  let addedUser = false;

  //log connection
  IoOperations.logConnection(pathoffile, socket.handshake.address)

  //emit serverkey to client
  socket.emit('info', {

    emoticonArray: configFile.emoticonArray,
    transferFolder: configFile.transferFolder
  })

  //connection validation (banned ip, clientCount,username)

  socket.on('check', (data) => {
    address = socket.handshake.address;
    //if server is full disconnect 
    if (socketidarray.length > configFile.maxClients) {
      console.log("Server is full");
      socket.emit('serverfull', {

      });

      socket.disconnect();
      return;
    }
    //find username
    for (let i = 0; i < socketidarray.length; i++) {
      if (socketidarray[i].username == data.username) {
        //ask client to rename as username is already in use
        socket.emit('rename', {

        });
        //disconnect socket
        socket.disconnect();
        return;
      }
    }
    //check if ip is banned
    if (bannedips.includes(socket.handshake.address.toString())) {


      //log banned connection attempt
      IoOperations.logBanned(pathoffile, socket.handshake.address);

      //disconnect socket
      socket.disconnect();
      return;

    }
    //if client already connected form this ip
    if (addressarray.includes(socket.handshake.address)) {


      socketidarray.forEach(function (element) {
        if (element.address == socket.handshake.address) {

          io.sockets.sockets[element.id].disconnect();
          //disconnect duplicate ip and connect new ip
          IoOperations.logDuplicate(pathoffile, element.id, element.address, element.username);
        }
      });

    }

    // if conditions are met emit validation
    socket.emit('validated', {

    });
    socket.emit('serverkey', {
      serverEncryptionKey: configFile.serverEncryptionKey,
      key: serverkey
    });
    // emit current file list on server to socket
    socket.emit('transferfiles', {

      message: filearray
    });
    //add client adress to server adress array
    addressarray.push(socket.handshake.address);

  });

  //xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
  // On Admin connection emit admin event to all clients
  //xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

  socket.on('adminconnected', (data) => {

    //emit connection to all clients
    io.emit('adminconnected', {
      admin: data.admin

    });
  });

  //xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
  // When the client emits a privatemessage
  //xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

  socket.on('privatemessage', (data) => {
    //find client to emit to
    for (let i = 0; i < socketidarray.length; i++) {

      if (socketidarray[i].id == data.to.id) {
        //log message to server console
        console.log(data.from.username + ': incoming private message to : ' + socketidarray[i].username);
        //emit to socket
        io.sockets.sockets[socketidarray[i].id].emit('privatemessage', {
          username: data.from.username,
          destination: data.to.username,
          message: data.message
        });
      }

    }

  });

  //xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
  // When the client emits a new message
  //xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

  socket.on('new message', (data) => {

    console.log(socket.username + ': ' + "incoming message");
    //emit to all clients but the source
    socket.broadcast.emit('new message', {
      username: socket.username,
      message: data
    });
  });

  //xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
  // Refresh files on server event
  //xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

  //refresh file function
  let refreshfiles = function () { filearray = IoOperations.refresh(configFile.transferfilesFolder, filearray, configFile.tempDirectoryName, io) }

  let myEventHandler = function () {
    //read files in transfer folder and send to clients
    refreshfiles();
  }

  eventEmitter.setMaxListeners(0);
  eventEmitter.on('refreshdir', myEventHandler);

  //xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
  // When the client emits 'add user', this listens and executes
  //xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

  socket.on('add user', (username) => {
    address = socket.handshake.address;
    if (addedUser) return;

    let clientobject = { id: socket.id, address: socket.handshake.address, username: username };

    //add socket to socket array of server
    socketidarray.push(clientobject);

    console.log(socketidarray);

    // we store the username in the socket session for this client
    socket.username = username;
    ++numUsers;
    addedUser = true;
    socket.emit('login', {
      numUsers: numUsers
    });
    //emit user joined to all but source
    socket.broadcast.emit('user joined', {
      username: socket.username,
      numUsers: numUsers,
      usermessage: socket.username + " has joined"

    });

    // echo globally (all clients) new user list

    io.emit('userlist', {
      objectarray: socketidarray
    });

    // append logs for user connection
    IoOperations.connectionLogs(pathoffile, socket.username, address, numUsers);

  });

  //xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
  // When the client emits 'typing', we broadcast it to others
  //xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

  socket.on('typing', () => {
    socket.broadcast.emit('typing', {
      username: socket.username,
      message: 'is typing: '
    });
  });

  //xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
  // When the client emits 'stop typing', we broadcast it to others
  //xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

  socket.on('stop typing', () => {
    socket.broadcast.emit('stop typing', {
      username: socket.username
    });
  });

  //xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
  // When client emits honk command
  //xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

  socket.on('honk', (data) => {
    io.emit('honkmessage', {

      honker: data.honker,
      honkee: data.honkee
    });
    console.log(data.honker + " honked " + data.honkee);
    //find user to honk
    for (let i = 0; i < socketidarray.length; i++) {
      if (socketidarray[i].username == data.honkee) {
        io.sockets.sockets[socketidarray[i].id].emit('honk', {

        });
      }
    }
  });

  //xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
  // Admin disconnect user event
  //xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

  socket.on('admindisconnect', (data) => {

    for (let i2 = 0; i2 < socketidarray.length; i2++) {
      //find user to disconnect
      if (socketidarray[i2].username == data.admindisconnect) {

        console.log("Admin" + data.admin + "disconnected user: " + socketidarray[i2].username);
        io.emit('Kicked', {
          kicked: socketidarray[i2].username

        });
        //disconnect socket
        if (io.sockets.sockets[socketidarray[i2].id]) {
          io.sockets.sockets[socketidarray[i2].id].disconnect();
        }
        //if socket id not found
        else {
          console.log("disconnect socket error: socket not found");
          socket.emit('usernotfound');
        }
      }
    }
  });

  //xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
  // When the client emits newname in order to rename
  //xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

  socket.on('newname', (data) => {

    console.log('initial ' + io.sockets.sockets[data.socketid].username);
    io.sockets.sockets[data.socketid].username = data.rename;

    //find user
    for (let i = 0; i < socketidarray.length; i++) {
      if (socketidarray[i].username == data.oldname) {
        socketidarray[i].username = data.rename;
        console.log('renamed' + io.sockets.sockets[data.socketid].username);

      }
    }
    //refresh userlist on clients
    io.emit('userlist', {
      objectarray: socketidarray
    });

    //emit rename command to clients
    io.emit('renamelog', {

      rename: io.sockets.sockets[data.socketid].username,
      oldname: data.oldname,
      admin: data.admin,
      adminname: data.adminname
    });

  });

  //xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
  // When the user disconnects.. perform this
  //xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

  socket.on('disconnect', () => {
    if (addedUser) {
      --numUsers;

      // echo globally that this client has left
      socket.broadcast.emit('user left', {
        username: socket.username,
        numUsers: numUsers
      });
      //if several clients connected find client
      if (socketidarray.length > 1) {
        let pos = addressarray.indexOf(socket.handshake.address);

        let removedItem = addressarray.splice(pos, 1);

        for (let i = 0; i < socketidarray.length; i++) {
          if (socketidarray[i].id == socket.id) {
            socketidarray.splice(i, 1);
          }
        }
        //refresh userlist on clients
        io.emit('userlist', {
          objectarray: socketidarray
        });

        console.log(removedItem);

        console.log(socketidarray);

      }
      //if only one client
      else if (socketidarray.length == 1) {
        addressarray.splice(-1, 1);
        console.log("removed last address");

        socketidarray.splice(-1, 1);
        console.log("removed last client object");

      }
      //log disconnect
      IoOperations.disconnectLogs(pathoffile, socket.username, address, numUsers);
    }
  });
});