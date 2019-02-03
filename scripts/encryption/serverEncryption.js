const secureRandom = require('secure-random');
const CryptoJS = require("crypto-js");

class ServerEncryption{

    static  getkey(serverEncryptionKey) {
        let bytes1 = secureRandom(10);
        let bytes2 = secureRandom(10);
        let x = bytes1.toString();
        let y = bytes2.toString();
      
       let serverkey = CryptoJS.AES.encrypt(x + y, serverEncryptionKey).toString();
      return serverkey;
      }
}
module.exports=ServerEncryption