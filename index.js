const express = require('express');
const VoiceResponse = require('twilio').twiml.VoiceResponse;
const urlencoded = require('body-parser').urlencoded;
const twilio = require('twilio')
const app = express();

app.set('port', (process.env.PORT || 5000));

// Parse incoming POST params with Express middleware
app.use(urlencoded({ extended: false }));

// Create a route that will handle Twilio webhook requests, sent as an
// HTTP POST to /voice in our application
app.post('/voice', twilio.webhook({validate: false}), function(req, res, next) {
  var phoneNumber = '15128176951';
  var callerId = '15128176776';


  res.set('application/xml').res.send('<?xml version="1.0" encoding="UTF-8"?><Response><Dial><Number>15128176951</Number></Dial></Response>');
});

// Create an HTTP server and listen for requests on port 3000
app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});
