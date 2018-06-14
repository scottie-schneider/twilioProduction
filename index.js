const express = require('express');
const VoiceResponse = require('twilio').twiml.VoiceResponse;
const urlencoded = require('body-parser').urlencoded;
const axios = require('axios'); // promised based requests - like fetch()

const app = express();
app.set('port', (process.env.PORT || 5000));
// Parse incoming POST params with Express middleware
app.use(urlencoded({ extended: false }));


// Create a route that will handle Twilio webhook requests, sent as an
// HTTP POST to /voice in our application
app.post('/voice', (request, response) => {
async function go(){
  try{
    const wes = await axios(`https://followupedge.com/version-test/api/1.1/obj/user?api_token=98107ac3b7b363d93f1b9e3863b79bee&constraints=%5B%7B%22key%22%3A%22CampaignPhone%22%2C%22constraint_type%22%3A%22equals%22%2C%22value%22%3A%22${request.body.To.substring(1)}%22%7D%5D`);
    console.log(wes.data.response.results[0].personalPhone);
    console.log(request.body.From);
    var phoneNumber = wes.data.response.results[0].personalPhone;
    var callerId = request.body.From;
    var twiml = new VoiceResponse();

    var dial = twiml.dial({callerId : callerId});
    if (phoneNumber != null) {
      dial.number(phoneNumber);
    } else {
      dial.client("support_agent");
    }
    response.send(twiml.toString());
    // TODO: hit bubble endpoint
    axios.post('https://followupedge.com/version-test/api/1.1/gotacall/initialize', {
    user: wes.data.response.results[0]._id,
    prospectPhone: request.body.From
  })
  }catch (e){
    console.log(e);
  }
}
  go();
});

// Create an HTTP server and listen for requests on port 3000
app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});
