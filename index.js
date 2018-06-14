const express = require('express');
const VoiceResponse = require('twilio').twiml.VoiceResponse;
const urlencoded = require('body-parser').urlencoded;
const twilio = require('twilio');
const axios = require('axios');
const app = express();


app.set('port', (process.env.PORT || 5000));

// Parse incoming POST params with Express middleware
app.use(urlencoded({ extended: false }));

// Create a route that will handle Twilio webhook requests, sent as an
// HTTP POST to /voice in our application
app.post('/voice', twilio.webhook({validate: false}), function(req, res, next) {
  console.log('hi bich');

  // start bubble call
  let token = '98107ac3b7b363d93f1b9e3863b79bee';
  let searchNum = '15125984144';
      axios.get(`https://followupedge.com/version-test/api/1.1/obj/user?constraints=%5B%7B%22key%22%3A%22CampaignPhone%22%2C%22constraint_type%22%3A%22equals%22%2C%22value%22%3A%22${searchNum}%22%7D%5D`,
        {
          headers: {'Authorization': `Bearer ${token}`}
      })
      .then((res) => {
        var phoneNumber = '5128176951';
        var callerId = '5128176776';
        var twiml = new VoiceResponse();

        var dial = twiml.dial({callerId : callerId});
        if (phoneNumber != null) {
          dial.number(phoneNumber);
        }
        //res.send(twiml.toString());
      })
      .catch((e) => {
        console.log(e.message);
      })
});

// Create an HTTP server and listen for requests on port 3000
app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});
