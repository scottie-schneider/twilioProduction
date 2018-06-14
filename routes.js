const express = require('express');
const axios = require('axios');
const querystring = require("querystring");
const router = express.Router();
const Twilio = require('twilio')

router.post('/', (req, res) => {
  let response = {
    id: req.body.id,
    responseText: req.body.responseText
  };
  axios.post('https://gateway.watsonplatform.net/assistant/api/v1/workspaces/73ae684c-61b6-4384-9739-022635ad663e/message?version=2018-02-16',
  {
    input: {
      "text": response.responseText
    }
  },
    {
      auth: {
        username: '6b221e91-5346-4297-9933-513d2b6b7271',
        password: 'OMe1KqyRRQDm'
      }
  })
  .then((response) => {
    res.send(response.data);
  })
  .catch((e) => {
    console.log(e);
  })
})
// TODO: access token to config file
// TODO: data access url to config file
// TODO: make tag dynamic
// TODO: pass prospect id to patch url
// TODO: get request to passing response to watson
// TODO: start rest naming convention
// TODO: add in async testing
// TODO: split off functions into seperate folders and files (require bitch!)


/*
Overall goals
  * Connect with the bubble database and pull everything into a Mlab instance
  * Build a super admin screen where we can control everything we need
  * A REST API where we can update, control, optimize, and build Facebook ads
  * Replace the Bubble backend
  * Create a replicatable system of components that can be reused
*/
router.post('/', (req, res) => {
  let token = '98107ac3b7b363d93f1b9e3863b79bee'
  let campaignNum = '15125984144'


  axios.get(`https://followupedge.com/version-test/api/1.1/obj/user?constraints=%5B%7B%22key%22%3A%22CampaignPhone%22%2C%22constraint_type%22%3A%22equals%22%2C%22value%22%3A%22${campaignNum}%22%7D%5D`,
  {
  },
    {
      headers: {'Authorization': `Bearer ${token}`}
  })
  .then((res) => {
    console.log(`success`)

    // REQUIRED - you must set this
    let phoneNumber = res.data.response.results[0].personalPhone;
    // OPTIONAL
    let callerId =  null;
    // OPTIONAL
    let timeout = null;
    // OPTIONAL
    console.log(phoneNumber)
    // generate the TwiML to tell Twilio how to forward this call
    let twiml = new Twilio.twiml.VoiceResponse();

    let allowedThrough = true

    let dialParams = {};
    twiml.say('Please eat 2 dicks davis.');
    twiml.dial(dialParams, phoneNumber);
})
  .catch((e) => {
    console.log(e);
    console.log('fire the second forward')
  })
})
// twiml.dial(dialParams, phoneNumber);
router.post('/u', (req, res) => {
  let token = '98107ac3b7b363d93f1b9e3863b79bee'
  let response = {
    id: req.body.id,
    responseText: req.body.responseText
  };
  axios.patch(`https://followupedge.com/version-test/api/1.1/obj/prospect/${response.id}`,
  {
    "tag": [
            "hello"
        ]
  },
    {
      headers: {'Authorization': `Bearer ${token}`}
  })
  .then((response) => {
    res.send(response.data);
  })
  .catch((e) => {
    console.log(e);
  })
})

module.exports = router;
