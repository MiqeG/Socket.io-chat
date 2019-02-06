let connection = require('../config/dbConnection')
const configFile = require('../config/server_config.json');
class User {

    static create(username, password, cb) {
        connection.query('SELECT count('+configFile.mysql.userNameField+') AS count FROM '+configFile.mysql.userTableName+' WHERE '+configFile.mysql.userNameField+' = ?', [username], (err, result) => {
            if (err) throw err;
           
            if (result[0].count != 0) {
                cb("username already in use")

            }
            else {
              
                connection.query('INSERT INTO '+configFile.mysql.userTableName+' SET '+configFile.mysql.userNameField+' = ?, '+configFile.mysql.passwordField +' = ?', [username, password], (err, result) => {
                    if (err) throw err;

                    cb('Done');

                })
            }

        })

    }
    static search(username, cb) {
        connection.query('SELECT '+configFile.mysql.userNameField+','+configFile.mysql.passwordField+' FROM '+configFile.mysql.userTableName+' WHERE '+configFile.mysql.userNameField+' = ?', [username], (err, result) => {
            if (err) throw err;
            if (result[0] != undefined) {
                cb(result);
                return;
            }
           
            cb('username not found');

        })
    }
}

module.exports = User