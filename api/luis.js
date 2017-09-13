const https = require('https');
const urlencode = require('urlencode');

var afterLuisHandler ;

class luis {
    
    constructor(){
        this.id= '73164f82-385c-4847-b0be-1695ac6ab800';
        this.subscriptionKey='cfff5bccbad84c6f95e8f50ef0cefc09';
        this.host ='api.projectoxford.ai';
        this.path='/luis/v1/application?id='+this.id+'&subscription-key='+this.subscriptionKey+'&q='; 
    }


    callluis(message,handler){
        const options = {
            host: this.host,
            path: this.path + urlencode(message)
          };
    
        https.request(options, this.callback).end();
        afterLuisHandler=handler;
    }

    callback(response) {
        var data='';
        //another chunk of data has been recieved, so append it to `str`
        response.on('data', function (chunk) {
            data += chunk;
        });
      
        //the whole response has been recieved, so we just print it out here
        response.on('end', function () {
          var luisResult = JSON.parse(data);

          afterLuisHandler(luisResult);
        });
      }
      
}

function createluis() {
	return new luis();
}

exports.createluis = createluis;



