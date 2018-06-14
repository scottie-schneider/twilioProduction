const express = require('express');
const VoiceResponse = require('twilio').twiml.VoiceResponse;
const urlencoded = require('body-parser').urlencoded;

const app = express();
app.set('port', (process.env.PORT || 5000));
// Parse incoming POST params with Express middleware
app.use(urlencoded({ extended: false }));

// Create a route that will handle Twilio webhook requests, sent as an
// HTTP POST to /voice in our application
app.post('/voice', (request, response) => {
  console.log(request.body);
  var phoneNumber = '+15128176776';
  var callerId = '+15125984144';
  var twiml = new VoiceResponse();

  var dial = twiml.dial({callerId : callerId});
  if (phoneNumber != null) {
    dial.number(phoneNumber);
  } else {
    dial.client("support_agent");
  }

response.send(twiml.toString());
});

// Create an HTTP server and listen for requests on port 3000
app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});
