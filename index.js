var linebot = require('linebot');
var express = require('express');
var https = require('https');
var auroraLineBot = require('./api/AuroraLineBot');
var luisService = require('./api/luis');
var currentEvent;


var bot = linebot({
  //channelId: "1530245573" ,
  //channelSecret: "cebc3f2a9f76e985607de7f855794fbe",
  //channelAccessToken: "RQ22Ia0B9nF86lFPdDrVEQiawPOxhC0iBakGupdgPQRSDs9KKlKN56THLEGxJK5J9hozRTJ4bSTusVspBDj3NSSx9jLN5cZWI/8EJbCJjUpk28v3E2VZBlEsgx+L2U8JdmmeIhFhhBqwCoNOWoAUNwdB04t89/1O/w1cDnyilFU="
  channelId: "1540967764",
  channelSecret: "d0219fde451d33a392f0216e92f5a793",
  channelAccessToken: "bc9AFYG30xbYJdgcTck/DAv7WgRGGJ8e+MP+69ITh6jGcQtevXl/TLkhqm9i+uaaFqYP+5lRpoKWa3qcIjRrJpGWH8cvopUxn5NfG27UNNe67zPJ6no1DqF3tEkufGRhbLy1/RLyX9sVR+KXbCEpEwdB04t89/1O/w1cDnyilFU="
});


bot.on('follow', function (event) {
  var replymsg =
    [{
      'type': 'text',
      'text': '歡迎加入震旦辦公雲Line@好友生活圈，本次將由人資大師周昌湘老師，分享最新一例一休趨勢與勞檢實戰策略。加入好友生活圈，現場可抽【ASUS 10吋商用平板(市價13,000元)】，讓您一手掌握最新消息！參與抽獎請輸入”1”。'
    }];
  event.reply(replymsg);
});


bot.on('message', function (event) {


  if (event.message.type == 'text') {
    var data = {
      'LineID': event.source.userId,
      'Content': event.message.text
    }
    auroraLineBot.PostConversation(data);

    Activity1018(event);
  }
});

var engageRequest = function (eventSourceUserId) {
  auroraLineBot.EngageRequest(eventSourceUserId)
    .then(engageId => {
      engageId = engageId.replace('"', '').replace('"', '');
      console.log(engageId);
      console.log(typeof (engageId));
      console.log(eventSourceUserId);
      console.log(typeof (eventSourceUserId));
      console.log(event.message.text);
      var replymsg =
        [{
          'type': 'text',
          'text': event.message.text
        }];

      bot.push(engageId, replymsg);
    });
}

var handleUserState = function (state) {
  if (state == 1) {
    auroraLineBot.EngageRequest(currentEvent.source.userId)
      .then(state => handleUserState(state));
  }
  else {
    var msg = currentEvent.message.text;
    var luis = luisService.createluis();
    luis.callluis(msg, luishandler);
  }
}

var getuserInfo = function (luisResult) {
  var response = '';

  var name = '';
  var job = '';
  var email = '';

  for (var i = 0; i < luisResult.entities.length; i++) {
    switch (luisResult.entities[i].type) {
      case 'builtin.email':
        email = luisResult.entities[i].entity.replace(/ /g, '') + '\n';
        response += '你的mail:' + email;
        break;
      case 'job':
        job = luisResult.entities[i].entity;
        response += '你的職稱:' + job + '\n';
        break;
      case 'name':
        name = luisResult.entities[i].entity;
        response += '你的名字:' + luisResult.entities[i].entity + '\n';
        break;
      default:
        break;
    }
  }

  if (response != '') {
    response += '感謝您的回覆唷~:p';
  }

  var data = {
    'LineID': currentEvent.source.userId,
    'Name': name,
    'EMail': email,
    'JobTitle': job
  }

  return data;
}

var sendQRCodeMessage = function (userInfo) {
  var replymsg =
    [{
      'type': 'text',
      'text': userInfo.Name + '\n 請給工作人員掃描QRCODE領取贈品'
    }
      ,
    {
      'type': 'image',
      'originalContentUrl': 'https://aublob.blob.core.windows.net/appstore/170723093548.png',
      'previewImageUrl': 'https://aublob.blob.core.windows.net/appstore/170723093548.png'
    }];

  bot.push(currentEvent.source.userId, replymsg);
}

var checkUserInfo = function (data) {
  if (data.EMail == '') {
    currentEvent.reply('請您填寫EMail唷，感謝您').then(function (data) {
      console.log('success');
    }).catch(function (error) {
      console.log('error');
    });
    return false;
  } else {
    return true;
  }
}


var afterGetUserInfoHandler = function (data, existed) {
  if (existed) {
    console.log('找到UserId:' + data.LineID);
    auroraLineBot.UpdateLineUserInfo(data);

  } else {
    console.log('找不到資料');
    auroraLineBot.CreateLineUserInfo(data);
  }
}

var luishandler = function (luisResult) {
  var topIntent = luisResult.intents[0];

  switch (topIntent.intent) {
    case "PersonalProfile":
      handleInputUserInfo(luisResult);
      break;
    case "Utilities.Help":
      var replymsg =
        [{
          'type': 'text',
          'text': '請問有甚麼可以幫忙的嗎?'
        }];

      bot.push('Ua76c6469681a837caf84f0bf74ebe407', replymsg);
      console.log('help');
      break;
  }
}


var handleInputUserInfo = function (luisResult) {
  var userInfo = getuserInfo(luisResult);

  if (checkUserInfo(userInfo)) {
    auroraLineBot.ExistLineUserInfo(userInfo)
      .then(existed => afterGetUserInfoHandler(userInfo, existed));
    sendQRCodeMessage(userInfo);
  }
}

var Activity1018 = function (event) {

  console.log(event.source.userId);
  var msg = event.message.text;
  auroraLineBot.GetUserStatus(event.source.userId).then(result => {
    var data = {
      'LineID': event.source.userId
    }

    var replymsg =
      [{
        'type': 'text',
        'text': ''
      }];

    var resultObj = JSON.parse(result);
    var type = resultObj.Status;

    if (type == "-1") {
      replymsg =
        [
          {
            'type': 'image',
            'originalContentUrl': 'https://aublob.blob.core.windows.net/appstore/1018Image1.jpg',
            'previewImageUrl': 'https://aublob.blob.core.windows.net/appstore/1018Image1.jpg'
          }
          ,
          {
            'type': 'text',
            'text': '誰是幸運兒？請輸入姓名'
          }
        ];

      auroraLineBot.CreateLineUserInfo(data);
    }
    else if (type == "填寫姓名") {
      data.Name = msg;
      auroraLineBot.UpdateLineUserInfo(data);
      replymsg[0].text = "請輸入電話(行動或市話 / 範例格式：0912345678或0223458088)";
    } else if (type == "填寫電話") {
      data.Mobile = asc(msg);
      auroraLineBot.UpdateLineUserInfo(data).then(result => {
        if (result.statusCode == 200) {
          replymsg =
            [{
              'type': 'text',
              'text': "完成囉！您的幸運號碼是:" + resultObj.SNO + " ，議程的最後將由主辦單位現場抽出1名幸運兒～敬請期待！千萬別錯過􀄃􀈘happy laugh􏿿"
            },
            {
              'type': 'text',
              'text': '想擁有專屬Line好友的好禮嗎？優質刊物《震旦月刊》一年份，陪伴您度過春夏秋冬～請輸入紙本月刊寄送地址􀄃􀉏two hearts􏿿'
            }
            ];
          event.reply(replymsg);
        }
        else {
          var response = JSON.parse(result.body.replace("model.", "")).ModelState.mobile[0];
          console.log(response);
          replymsg =
            [{
              'type': 'text',
              'text': response
            }];
          event.reply(replymsg);
        }
      });
    } else if (type == "完成") {
      data.Address = asc(msg);
      auroraLineBot.UpdateLineUserInfo(data);
      replymsg[0].text = "感謝您的填寫~從2017年12月起將收到為期一年份的《震旦月刊》";
      event.reply(replymsg);
    }
    else if (type == "註冊月刊") {
      replymsg[0].text = "";
      event.reply(replymsg);
    }
  });
}

var Activity0927 = function (event) {

  console.log(event.source.userId);
  var msg = event.message.text;
  auroraLineBot.GetUserStatus(event.source.userId).then(result => {
    var data = {
      'LineID': event.source.userId
    }

    var replymsg =
      [{
        'type': 'text',
        'text': ''
      }];

    var type = parseInt(result);

    if (type == -1) {
      replymsg =
        [
          {
            'type': 'text',
            'text': '「活動DM請參考下圖~」'
          },
          {
            'type': 'image',
            'originalContentUrl': 'https://aublob.blob.core.windows.net/appstore/0927image.jpg',
            'previewImageUrl': 'https://aublob.blob.core.windows.net/appstore/0927image.jpg'
          }
          ,
          {
            'type': 'text',
            'text': '讓我們多認識您一些吧\n 1.請問您的大名?'
          }
        ];

      auroraLineBot.CreateLineUserInfo(data);
    }
    else if (type > -1) {
      switch (type) {
        case 0:
          data.Name = msg;
          auroraLineBot.UpdateLineUserInfo(data);
          replymsg[0].text = "2.請問您的電話? (行動或市話 / 範例格式：0912345678或0223458088)";
          break;
        case 1:
          data.Mobile = msg;
          auroraLineBot.UpdateLineUserInfo(data).then(result => {
            if (result.statusCode == 200) {
              replymsg[0].text = "3.就快完成嚕~ 請問您的服務單位(學校/機構名稱)?";
              event.reply(replymsg);
            }
            else {
              var response = JSON.parse(result.body.replace("model.", "")).ModelState.mobile[0];
              console.log(response);
              replymsg =
                [{
                  'type': 'text',
                  'text': response
                }];
              event.reply(replymsg);
            }
          });
          break;
        case 2:
          data.ServiceDPT = msg;
          auroraLineBot.UpdateLineUserInfo(data);
          replymsg[0].text = "4.最後一步了!!請問您的E-mail?";
          break;
        case 3:
          data.EMAIL = msg;
          auroraLineBot.UpdateLineUserInfo(data).then(result => {
            var imageUrl = 'https://auroralinebot.azurewebsites.net/api/Image/' + event.source.userId;

            if (result.statusCode == 200) {
              replymsg =
                [{
                  'type': 'text',
                  'text': '感謝您完整回答~請出示以下QR Code畫面給現場工作人員􀄃􀈢cool􏿿\n 即可兌換精美繪本手札一份(限今天兌換，數量有限，送完為止)\n 還有機會抽中 「琉璃工房知音報曉茶具組」􁀁􀆍Matcha􏿿 \n 大獎將於10/6(五)以E-mail和電話通知幸運得主􁄁􀄕Pink Cellphone􏿿 \n *只要填寫姓名、電話、mail、服務單位四項完整資料即可參加抽獎，抽獎結果將以mail和電話方式通知獲獎者，並公告於震旦集團網站(www.aurora.com.tw)，為保護您的權利，請留下正確資料，以利後續通知。\n *震旦集團保留更換贈品之權利。'
                }
                  ,
                {
                  'type': 'image',
                  'originalContentUrl': imageUrl,
                  'previewImageUrl': imageUrl
                }];
              event.reply(replymsg);
            }
            else {
              var response = JSON.parse(result.body.replace("model.", "")).ModelState.EMail[0];
              replymsg =
                [{
                  'type': 'text',
                  'text': response
                }];
              event.reply(replymsg);
            }
          });
          break;
        case 4:
          var imageUrl = 'https://auroralinebot.azurewebsites.net/api/Image/' + event.source.userId;
          replymsg =
            [{
              'type': 'text',
              'text': '趕快跟工作人員領取禮物唷'
            },
            {
              'type': 'image',
              'originalContentUrl': imageUrl,
              'previewImageUrl': imageUrl
            }];
          break;
        case 5:
          replymsg =
            [{
              'type': 'text',
              'text': '感謝您熱情的參與【震旦X 3D自造未來】的活動～ \n 未來將不定期提供您3D自造教育相關資訊，以及在北、中、 南將有《震旦自造教育工作坊》的精彩課程，請至 https://goo.gl/7oZYAi 直接預約報名！若有任何問題請撥打免費客服專線：0809-068-588 􀄃􀈘happy laugh􏿿 '
            }];
          break;
      }
    }

    event.reply(replymsg);
  });
}

var asc = function (text) {

  var asciiTable = "!\"#$%&\’()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\\]^_`abcdefghijklmnopqrstuvwxyz{|}~";

  var big5Table = "%uFF01%u201D%uFF03%uFF04%uFF05%uFF06%u2019%uFF08%uFF09%uFF0A%uFF0B%uFF0C%uFF0D%uFF0E%uFF0F%uFF10%uFF11%uFF12%uFF13%uFF14%uFF15%uFF16%uFF17%uFF18%uFF19%uFF1A%uFF1B%uFF1C%uFF1D%uFF1E%uFF1F%uFF20%uFF21%uFF22%uFF23%uFF24%uFF25%uFF26%uFF27%uFF28%uFF29%uFF2A%uFF2B%uFF2C%uFF2D%uFF2E%uFF2F%uFF30%uFF31%uFF32%uFF33%uFF34%uFF35%uFF36%uFF37%uFF38%uFF39%uFF3A%uFF3B%uFF3C%uFF3D%uFF3E%uFF3F%u2018%uFF41%uFF42%uFF43%uFF44%uFF45%uFF46%uFF47%uFF48%uFF49%uFF4A%uFF4B%uFF4C%uFF4D%uFF4E%uFF4F%uFF50%uFF51%uFF52%uFF53%uFF54%uFF55%uFF56%uFF57%uFF58%uFF59%uFF5A%uFF5B%uFF5C%uFF5D%uFF5E";

  var result = "";

  for (var i = 0; i < text.length; i++) {

    var val = escape(text.charAt(i));

    var j = big5Table.indexOf(val);

    result += (((j > -1) && (val.length == 6)) ? asciiTable.charAt(j / 6) : text.charAt(i));

  }
  return result;
}

const app = express();
const linebotParser = bot.parser();
app.post('/', linebotParser);

//因為 express 預設走 port 3000，而 heroku 上預設卻不是，要透過下列程式轉換
var server = app.listen(process.env.PORT || 8080, function () {
  var port = server.address().port;
  console.log("App now running on port", port);
});