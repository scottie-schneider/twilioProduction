

var express = require('express');
var twilio = require('twilio');
var VoiceResponse = twilio.twiml.VoiceResponse;

// POST /calls/connect
router.post('/connect', twilio.webhook({validate: false}), function(req, res, next) {
  var phoneNumber = '+15128176951';
  var callerId = '+15128176776';
  var twiml = new VoiceResponse();

  var dial = twiml.dial({callerId : callerId});
  if (phoneNumber != null) {
    dial.number(phoneNumber);
  }

  res.send(twiml.toString());
});
