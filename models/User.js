let connection = require('../config/dbConnection')
class User {

    static create(username, password, cb) {
        connection.query('SELECT count(username) AS count FROM usertable WHERE username = ?', [username], (err, result) => {
            if (err) throw err;
           
            if (result[0].count != 0) {
                cb("username already in use")

            }
            else {
                cb(result);
                connection.query('INSERT INTO usertable SET username = ?, password = ?', [username, password], (err, result) => {
                    if (err) throw err;

                    cb('Done');

                })
            }

        })

    }
    static search(username, cb) {
        connection.query('SELECT username,password FROM usertable WHERE username = ?', [username], (err, result) => {
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