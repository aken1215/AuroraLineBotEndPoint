var http = require('http');
var linebot = require('linebot');
var express = require('express');

var bot = linebot({
    //channelId: "1530245573" ,
    //channelSecret: "cebc3f2a9f76e985607de7f855794fbe",
    //channelAccessToken: "RQ22Ia0B9nF86lFPdDrVEQiawPOxhC0iBakGupdgPQRSDs9KKlKN56THLEGxJK5J9hozRTJ4bSTusVspBDj3NSSx9jLN5cZWI/8EJbCJjUpk28v3E2VZBlEsgx+L2U8JdmmeIhFhhBqwCoNOWoAUNwdB04t89/1O/w1cDnyilFU="
     channelId: "1535163663" ,
     channelSecret: "60e70aa9ae539ac86e4c925b73428afd",
     channelAccessToken: "bKUNGIxsMvf6tZbGi0W/+ThpuPxXnLqsawb7Y7P1dhzArvFCWS+jnyVCmkuBKrO0uRdhMI+A+1Y8c3ojzc+1/8JWof0grGGxbCQ5JUb1s2RobAAsDOtoQ5AcpoqTdQyM6TrM58kPwhLukdWAEi/zewdB04t89/1O/w1cDnyilFU="
   });
   
bot.on('message', function(event) {
    
    if (event.message.type == 'text') {
        var replymsg = 
        [{
          'type':'text',
          'text':event.message.text
        }] ;
        event.reply(replymsg);
    }
});


const app = express();
const linebotParser = bot.parser();
app.post('/', linebotParser);

//因為 express 預設走 port 3000，而 heroku 上預設卻不是，要透過下列程式轉換
var server = app.listen(process.env.PORT || 8080, function() {
  var port = server.address().port;
  console.log("App now running on port", port);
});