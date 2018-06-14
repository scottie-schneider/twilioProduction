const express = require('express');
const axios = require('axios');
const querystring = require("querystring");
const router = express.Router();
const Twilio = require('twilio')
const crypto = require('crypto')
const request = require('request')



/*
Overall goals
  * Connect with the bubble database and pull everything into a Mlab instance
  * Build a super admin screen where we can control everything we need
  * A REST API where we can update, control, optimize, and build Facebook ads
  * Replace the Bubble backend
  * Create a replicatable system of components that can be reused
*/
router.post('/', (req, res) => {

const url = 'https://handler.twilio.com/twiml/EH2fedbe3a5c939d2f5ad7a4e325a390dd?AccountSid=ACde1a258b0739ab5329d862519e4f16f6'

const twilioSig = crypto.createHmac('sha1', '70a625b9522cb1e511f60afaebfde860').update(new Buffer(url, 'utf-8')).digest('Base64')

  request({url: url, headers: { 'X-TWILIO-SIGNATURE': twilioSig }}, function(err, res, body) {
    console.log(res.body)
    res.send('yep')
  })

})

module.exports = router;
