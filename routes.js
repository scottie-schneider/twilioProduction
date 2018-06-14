const express = require('express');
const axios = require('axios');
const querystring = require("querystring");
const router = express.Router();
const crypto = require('crypto')
const request = require('request')
const VoiceResponse = require('twilio').twiml.VoiceResponse;


/*
Overall goals
  * Connect with the bubble database and pull everything into a Mlab instance
  * Build a super admin screen where we can control everything we need
  * A REST API where we can update, control, optimize, and build Facebook ads
  * Replace the Bubble backend
  * Create a replicatable system of components that can be reused
*/
router.post('/', (req, res) => {

  // Use the Twilio Node.js SDK to build an XML response
  const twiml = new VoiceResponse();
  twiml.say({ voice: 'alice' }, 'hello world!');

  // Render the response as XML in reply to the webhook request
  res.type('text/xml');
  res.send(twiml.toString());

})

module.exports = router;
