// https://www.npmjs.com/package/googleapis#oauth2-client

const {google} = require('googleapis');
var http = require('http');
var https = require('https');
var fs = require('fs');
var path = require('path');
// var mime = require('mime');
var url = require('url');
const querystring = require('querystring');
const requestPromise = require('request-promise');

var clientId = '1006826584050-4cad42jrlnu0bmophpuq7rt2nupslmmp.apps.googleusercontent.com';
var clientSecret = 'N3XZuKHm04cMPz8yo6wcgmBw';
var authCallbackUri = 'http://localhost:8080/authCallback.html';

var scope = 'https://www.googleapis.com/auth/photoslibrary.readonly';

const oauth2Client = new google.auth.OAuth2(
  clientId,
  clientSecret,
  authCallbackUri
);

var server = http.createServer(function (request, response) {

  var url = request.url;
  console.log('request url: ');
  console.log(url);

  if (url.startsWith('/authCallback.html')) {
    console.log('callback with code');

    // /authCallback.html?code=4/0QDMXCyzz7QpRGottT6-ZMVnOI8www1PysWf2wDu8617E-CH0BsNDNWsZ-22Cfz5c-rVDrZlI-Cxosq8NPiOS8Q&scope=https://www.googleapis.com/auth/photoslibrary.readonly
    var codeIndex = url.indexOf('code=');
    var urlSubstring = url.substring(codeIndex);
    var indexOfNextParam = urlSubstring.indexOf('&');
    var code = urlSubstring.substring(5, indexOfNextParam);

    console.log('code:');
    console.log(code);
    
    // const {tokens} = await oauth2Client.getToken(code)
    oauth2Client.getToken(code).then( (tokens) => {
  
      oauth2Client.setCredentials(tokens);
  
      console.log('access token');
      const access_token = tokens.tokens.access_token;
      console.log(access_token);

      const apiEndpoint = 'https://photoslibrary.googleapis.com';

      requestPromise.get(apiEndpoint + '/v1/albums', {
        headers: {'Content-Type': 'application/json'},
        // qs: parameters,
        json: true,
        auth: {'bearer': access_token},
      }).then( (result) => {
        console.log(result);
      });

      fs.readFile('./client/authCallback.html', function (err, html) {
        if (err) {
          throw err;
        }
        response.writeHeader(200, { "Content-Type": "text/html" });
        response.write(html);
        response.end();
      });
    });
  }
  else {
    console.log('invoke oauth2Client.generateAuthUrl');
    const oauth2Url = oauth2Client.generateAuthUrl({
      access_type: 'online',
      scope: scope
    });
    console.log('oauth2Url:');
    console.log(oauth2Url);  
  
    response.writeHead(301,
      {Location: oauth2Url}
    );
    response.end();
    }
});

server.listen(8080, function () {
  console.log("Server listening on port 8080.");

  // console.log('invoke oauth2Client.generateAuthUrl');
  // const oauth2Url = oauth2Client.generateAuthUrl({
  //   access_type: 'online',
  //   scope: scope
  // });
  // console.log('oauth2Url:');
  // console.log(oauth2Url);  
});
