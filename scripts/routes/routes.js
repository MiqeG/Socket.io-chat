const formidable = require('../../node_modules/formidable');
const IoOperations=require('../IO/IO.js')
class RouteHandler{

static credentialsRouter (User,req, res, next) {
  
  
    let  sess = req.session;
    if (req.body.loginUsername != undefined && req.body.loginPassword != undefined) {
      User.search(req.body.loginUsername, function (result) {
        if (result == 'not found') {
          res.redirect('/registration.html');
       
        }
        else{
            console.log(result[0]["password"]);
            if (result[0]["password"] == req.body.loginPassword) {
      
              sess.logged = true;
              res.cookie.logged = true;
              console.log(res.cookie.logged)
              req.session.logged == true;
      
              console.log("ok");
              
              res.redirect('/');
             
            }
        }
       
       
      })
    }
  }
  static registrationValidationRouter(User,req,res,next){
    if (req.body.username == undefined || req.body.password == undefined) {
        res.redirect('/error')
        return;
      }
      console.log(req.body.username)
      console.log(req.body.password)
      User.create(req.body.username, req.body.password, function (result) {
        //code sucess  
        console.log(result);
        next();
      })
  }
  static uploadRouter(pathoffile,configFile,req,res,eventEmitter,tempDirectory){
    IoOperations.incomingFiles(pathoffile, req.connection.remoteAddress)
   
    //form parameters
    let form = new formidable.IncomingForm();
    form.uploadDir = tempDirectory;
    form.maxFileSize = configFile.maxFile * 1024 * 1024;
  
    //form encryption
    form.hash = 'md5';
    form.parse(req, function (err, fields, files) {
      res.writeHead(200, { 'content-type': 'text/html' });
  
      res.end('<script>window.location.href="' + configFile.index + '"</script>;');
    });
    //on end of transfer
    form.on('end', function (fields, files) {
  
      /* Temporary location of our uploaded file */
      for (let i = 0; i < this.openedFiles.length; i++) {
        let temp_path = this.openedFiles[i].path;
        /* The file name of the uploaded file */
        let file_name = this.openedFiles[i].name;
        /* Location where we want to copy the uploaded file */
        let new_location = configFile.transferfilesFolder + '/';
  
        //copy from temp to folder
        IoOperations.copyFiles(temp_path, new_location, file_name, pathoffile, req.connection.remoteAddress, eventEmitter);
  
      }
  
    });
  }
}
module.exports=RouteHandler