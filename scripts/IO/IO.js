const fs = require('fs');
const fs2 = require('fs-extra');
const path = require('path');
class IoOperations{


    static deleteFilesTemp(tempDirectory) {
        fs.readdir(tempDirectory, (err, files) => {
            if (err) throw err;
          
            for (const file of files) {
              fs.unlink(path.join(tempDirectory, file), err => {
                if (err) throw err;
                console.log('Temp file: ' + file + ' deleted');
              });
            }
            console.log('Deleting temp files');
          });
          
    }  
    static readFilesTempSync(filearray,transferFolder,tempDirectoryName){
      
            filearray = [];
            fs.readdirSync(transferFolder).forEach(file => {
              if (file != tempDirectoryName) {
                filearray.push(file);
              }
              
            });
            return filearray;
         }
         static saveLogFile(pathoffile){
            if (!fs.existsSync(pathoffile)) {
                fs.writeFile(pathoffile, "", function (err) {
                  if (err) {
                    return console.log(err);
                  }
              
                  console.log("The file was saved at: " + pathoffile);
                });
              }
         }
       static incomingFiles(pathoffile,remoteAddress){
        fs.appendFile(pathoffile, "Incoming files from ip: " + remoteAddress + " \r\n", function (err) {
            if (err) throw err;
            console.log("Incoming files from ip: " + remoteAddress);
          });
       }
       static copyFiles(temp_path,new_location,file_name,pathoffile,remoteAddress,eventEmitter){
        fs2.copy(temp_path, new_location + file_name, function (err) {
          if (err) {
            console.error(err);
          } else {
           
            fs.appendFile(pathoffile, "Files successfully transfered from ip: " + remoteAddress + "\r\n", function (err) {
              if (err) throw err;
              console.log("Files successfully transfered from ip: " + remoteAddress);
              //remove temp file
              fs.unlink(temp_path, (err) => {
                if (err) throw err;
                console.log("tempfile deleted");
              });
            });
            //refresh file list on clients
            eventEmitter.emit('refreshdir');
          }
        });
       }

       static logConnection(pathoffile,address){
        fs.appendFile(pathoffile, "IP CONNECTING: " + address + Date() + "\r\n", function (err) {
            if (err) throw err;
            console.log("IP CONNECTING: " + address);
          });
       }
       static logBanned(pathoffile,address){
        fs.appendFile(pathoffile, "banned ip connection attempt: " + address + " " + Date() + "\r\n", function (err) {
            if (err) throw err;
            console.log("banned ip connection attempt ip: " + address);
          });
       }
       static logDuplicate(pathoffile,id,address,username){
        fs.appendFile(pathoffile, "duplicate ip disconnecting:" + id + " " + address + " " + username + " " + Date() + "\r\n", function (err) {
            if (err) throw err;
            console.log("duplicate ip disconnecting:" + id + " " + address + " " + username)

          });
       }
       static connectionLogs(pathoffile,username,address,numUsers){
        fs.appendFile(pathoffile, 'user ' + username + ' has joined ip: ' + address + ' , users connected: ' + numUsers + "\t" + " Date: " + Date() + "\r\n", function (err) {
            if (err) throw err;
            console.log('user ' + username + ' has joined, users connected: ' + numUsers);
          });
       }
       static disconnectLogs(pathoffile,username,address,numUsers){
        fs.appendFile(pathoffile, username + ' disconnected  ip: ' + address + ' , users connected: ' + numUsers + "\t" + " Date: " + Date() + "\r\n", function (err) {
            if (err) throw err;
            console.log(username + ' disconnected, users connected:' + numUsers);
          });
       }
       static refresh (transferfilesFolder,filearray,tempDirectoryName,io) {


        //readdir with filter
        fs.readdir(transferfilesFolder, function (err, files) {
          filearray = [];
          if (err) throw err;
          files.forEach(function (file) {
            if (file != tempDirectoryName) {
    
              filearray.push(file);
            }
          });
          //emit file list to clients
    
          io.emit('transferfiles', {
            message: filearray,
    
          });
          return filearray;
        });
      }
      static startServerLog(pathoffile,port){
        fs.appendFileSync(pathoffile, "File Created!!!--------------------" + "\t Date: " + Date() + "\r\nServer listening on port : " + port + "\r\n");
      }
      static readSync(path,encoding){
      let file=  fs.readFileSync(path, encoding);
        return file;
      }
}
module.exports=IoOperations