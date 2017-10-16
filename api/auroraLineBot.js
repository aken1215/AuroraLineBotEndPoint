var request = require('request');

const getContent = function(url) {
  // return new pending promise
  return new Promise((resolve, reject) => {
    // select http or https module, depending on reqested url
    const lib = url.startsWith('https') ? require('https') : require('http');
    const request = lib.get(url, (response) => {
      // handle http errors
      if (response.statusCode < 200 || response.statusCode > 299) {
         reject(new Error('Failed to load page, status code: ' + response.statusCode));
       }
      // temporary data holder
      const body = [];
      // on every content chunk, push it to the data array
      response.on('data', (chunk) => body.push(chunk));
      // we are done, resolve promise with those joined chunks
      response.on('end', () => { console.log(body); resolve(body.join(''));});
    });
    // handle connection errors of the request
    request.on('error', (err) => reject(err))
    })
}


var baseUrlOperation= function (path,method,data){
  return new Promise((resolve, reject) => {

    var reqBody = JSON.stringify(data);
    var http = require("http");
    var options = {
      hostname: 'auroracloudbot.azurewebsites.net',
      port: 80,
      path: path,
      method: method,
      headers: {
          'Content-Type': 'application/json',
          'Content-Length':Buffer.byteLength(reqBody, 'utf8')
      }
    };

    var req = http.request(options, function(res) {
      console.log('Status: ' + res.statusCode);
      console.log('Headers: ' + JSON.stringify(res.headers));
      res.setEncoding('utf8');
      res.on('data', function (body) {
        console.log('Body: ' + body);
        res.body=body;
        resolve(res);
      });
    });
    req.on('error', function(e) {
      console.log('problem with request: ' + e.message);
      reject(e);
    });
   
    req.write(reqBody);
    req.end();
  });
}

exports.CreateLineUserInfo = function (data){
    baseUrlOperation('/api/auroraLineBot/post','post',data);
}

exports.UpdateLineUserInfo = function (data){
    return baseUrlOperation('/api/auroraLineBot/put','put',data);
}

exports.PostConversation = function (data){
  baseUrlOperation('/api/Conversation','post',data);
}

exports.ExistLineUserInfo = function (data){
    return getContent('http://auroracloudbot.azurewebsites.net/api/auroraLineBot/'+ data.LineID);
}

exports.GetUserStatus = function (userId){
    return getContent('http://auroracloudbot.azurewebsites.net/api/UserStatus/'+ userId);
}


exports.EngageRequest = function (id){
  return getContent('http://auroracloudbot.azurewebsites.net/api/EngageRequest/'+ id);
}



