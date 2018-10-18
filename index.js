require('dotenv').config();
const accountSid = process.env.twilio_accountSID;
const authToken = process.env.twilio_authToken;
// Required modules follow
const express = require('express');
const VoiceResponse = require('twilio').twiml.VoiceResponse;
const bodyParser = require('body-parser');
const axios = require('axios'); // promised based requests - like fetch()
//const client = require('twilio')(accountSid, authToken);
const schedule = require('./routes/schedule')
const test = require('./routes/test')
const metrics = require('./routes/metrics')

const client = require('twilio')(accountSid, authToken);
////////////////////////////////////////////////////////////////////////////////

////////////////////////////////////////////////////////////////////////////////

const app = express();
app.set('port', (process.env.PORT || 5000));

// Parsing
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Routing
app.use('/schedule', schedule)

app.use('/test', test)

app.use('/metrics', metrics)

// Sanity check
app.get('/', (request, response) => {
  console.log('Home route')
  response.send('hello staging');
});

// calculate upcoming invoices
app.get('/upcoming', (request, response) => {
  
})
// Create a route that will handle Twilio webhook requests, sent as an
// HTTP POST to /voice in our application
app.post('/voice', (request, response) => {
async function go(){
  try{
    let campaignPhone = request.body.To;
    let campaignPhoneType = '';

    console.log('campaign phone below');
    console.log(campaignPhone)

    //if the first 3 characters are +61, make it an aussie number
    if(campaignPhone.slice(0,3) == "+61"){
      campaignPhone = '0' + request.body.To.substring(3);
      campaignPhoneType = 'AUS';
      console.log(`aussie number ${campaignPhone}`)
    }
    // if the first 2 characters are +1, then it's a us/canada number and proceed as normal
    if(campaignPhone.slice(0,2) == "+1"){
      campaignPhone = request.body.To.substring(1);
      campaignPhoneType = 'US';
      console.log(`US number, ${campaignPhone}`)
    }

    // Search the bubble DB for the user's personal phone number
    const wes = await axios(`https://followupedge.com/api/1.1/obj/user?api_token=98107ac3b7b363d93f1b9e3863b79bee&constraints=%5B%7B%22key%22%3A%22CampaignPhone%22%2C%22constraint_type%22%3A%22equals%22%2C%22value%22%3A%22${campaignPhone}%22%7D%5D`);
    if(wes.data.response.results.length == 0){
      console.log(wes.data.response)
      console.log('not found');
      response.send('not found')
    }else {
      console.log('personal phone is ' + wes.data.response.results[0].personalPhone);
      console.log('number calling is ' + request.body.From);
      if(campaignPhoneType == 'AUS'){
        var phoneNumber = '+61' + wes.data.response.results[0].personalPhone.substring(wes.data.response.results[0].personalPhone.length - 9);
      }else if(campaignPhoneType == 'US'){
        var phoneNumber = wes.data.response.results[0].personalPhone;
      }else{
        var phoneNumber = wes.data.response.results[0].personalPhone;
      }

      var callerId = request.body.From;
      var twiml = new VoiceResponse();
      var dial = twiml.dial({callerId : callerId})

      console.log('now attempting to dial')

      // this is a redirect to enable the 'whisper' functionality
      dial.number({url: '/agents'}, phoneNumber);
      response.send(twiml.toString());

      console.log('dialing ' + phoneNumber + ' from ' + callerId)

      if(campaignPhoneType == 'AUS'){
        // post to the bubble endpoint to trigger the unsubscribe wf (AUS)
        axios.post('https://followupedge.com/api/1.1/wf/gotacallaus', {
          user: wes.data.response.results[0]._id,
          prospectPhone: request.body.From
        })
        .catch((e) => {
          console.log('you have an error')
          console.log(e.message);
        })
      }else if(campaignPhoneType == 'US'){
        // post to the bubble endpoint to trigger the unsubscribe wf (US)
        axios.post('https://followupedge.com/api/1.1/wf/gotacall', {
          user: wes.data.response.results[0]._id,
          prospectPhone: request.body.From
        })
        .catch((e) => {
          console.log('you have an error')
          console.log(e.message);
        })
      }
    }
  }catch (e){
    console.log(e);
  }
}
  go();
});

app.post('/agents', (request, response) => {
  async function now(){
    const twiml = new VoiceResponse();
    try{
      let prospectPhone = request.body.To;
      let prospectPhoneType = '';

      console.log('prospect phone below');
      console.log(prospectPhone)

      //if the first 3 characters are +61, make it an aussie number
      if(prospectPhone.slice(0,3) == "+61"){
        prospectPhone = request.body.To.substring(3);
        prospectPhoneType = 'AUS';
        console.log(`aussie number ${prospectPhone}`)
      }
      // if the first 2 characters are +1, then it's a us/canada number and proceed as normal
      if(prospectPhone.slice(0,2) == "+1"){
        prospectPhone = request.body.To.substring(1);
        prospectPhoneType = 'US';
        console.log(`US number, ${prospectPhone}`)
      }
      // call bubble to get the prospect's name
      const name = await axios(`https://followupedge.com/api/1.1/obj/prospect?api_token=98107ac3b7b363d93f1b9e3863b79bee&constraints=%5B%7B%22key%22%3A%22CB%20Mobile%20Number%22%2C%22constraint_type%22%3A%22equals%22%2C%22value%22%3A%22${prospectPhone}%22%7D%5D`);

      if(name.data.response.results[0] != 'undefined'){
        console.log(name.data.response.results[0]['CB Full Name'])
        const fullName = name.data.response.results[0]['CB Full Name'];
        if(fullName){
          twiml.say(fullName + ' is calling.');
          response.send(twiml.toString());
        }else{
          response.send(twiml.toString());
        }
      }
    }catch(e){
      console.log(e);
      console.log('triggered!')
      response.send(twiml.toString());
    }
  }
  now();
})
/////////////////////////////////////////////////////////////
// Text Message Endpoints
/////////////////////////////////////////////////////////////
app.post('/sms', (request, response) => {
  console.log(request);
  client.messages
        .create({
           body: request.body.body,
           from: request.body.from,
           statusCallback: 'https://d38.bubble.is/site/blondielives/api/1.1/wf/sms_status',
           to: request.body.to
         })
        .then((message) => {
          console.log(message.sid);
          response.json({ message_sid: message.sid });
        })
        .catch((e) => {
          axios.post('https://d38.bubble.is/site/blondielives/api/1.1/wf/twilio_sms_error', {
            error: e
          })
          .catch((e) => {
            console.log('you have an error')
            console.log(e.message);
            axios.post('https://d38.bubble.is/site/blondielives/api/1.1/wf/twilio_sms_error', {
              error: e
            })
          })
          response.json( { error: e })
        })
        .done();

});

// Create an HTTP server and listen for requests on port 5000
app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});

module.exports = app;
