var mysql      = require('mysql');
const configFile = require('./server_config.json');
var connection = mysql.createConnection({
  host     : configFile.mysql.databaseHost,
  user     : configFile.mysql.databaseUser,
  password : configFile.mysql.databasePassword,
  database : configFile.mysql.databaseName
});
connection.connect();

module.exports=connection