

class Format {
  
    
   static formatDate(){
   
    let today = new Date();
    let sec = today.getSeconds();
    let min = today.getMinutes();
    let hour = today.getHours();
    let dd = today.getDate();
    let mm = today.getMonth() + 1; //January is 0!
    let yyyy = today.getFullYear();
        if (sec < 10) {
            sec = '0' + sec
          }
          if (min < 10) {
            min = '0' + min
          }
          if (hour < 10) {
            hour = '0' + hour
          }
          
          if (dd < 10) {
            dd = '0' + dd
          }
          
          if (mm < 10) {
            mm = '0' + mm
          }
          
                    
          let date = hour + 'h' + min + 'min' + sec + 'sec_' + dd + '_' + mm + '_' + yyyy;
          return date;
    }
}
module.exports=Format