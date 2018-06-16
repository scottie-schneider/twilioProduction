const express = require('express');
const VoiceResponse = require('twilio').twiml.VoiceResponse;
const urlencoded = require('body-parser').urlencoded;
const axios = require('axios'); // promised based requests - like fetch()

const app = express();
app.set('port', (process.env.PORT || 5000));
// Parse incoming POST params with Express middleware
app.use(urlencoded({ extended: false }));

app.get('/', (request, response) => {
  response.send('hello world');
})
// Create a route that will handle Twilio webhook requests, sent as an
// HTTP POST to /voice in our application
app.post('/voice', (request, response) => {
async function go(){
  try{
    let campaignPhone = request.body.To;
    //if the first 3 characters are +61, make it an aussie number
    console.log('campaign phone below');
    console.log(campaignPhone)

    if(campaignPhone.slice(0,3) == "+61"){
      campaignPhone = request.body.To.substring(3);
      console.log(`aussie number ${campaignPhone}`)
    }
    // if the first 2 characters are +1, then it's a us/canada number and proceed as normal
    if(campaignPhone.slice(0,2) == "+1"){
      campaignPhone = request.body.To.substring(1);
      console.log(`US number, ${campaignPhone}`)
    }
    const wes = await axios(`https://followupedge.com/api/1.1/obj/user?api_token=98107ac3b7b363d93f1b9e3863b79bee&constraints=%5B%7B%22key%22%3A%22CampaignPhone%22%2C%22constraint_type%22%3A%22equals%22%2C%22value%22%3A%22${campaignPhone}%22%7D%5D`);
    if(wes.data.response.results.length == 0){
      console.log('not found');
      response.send('not found')
    }else {
      console.log(wes.data.response.results);
      console.log(wes.data.response.results[0].personalPhone);
      console.log(request.body.From);
      var phoneNumber = wes.data.response.results[0].personalPhone;
      var callerId = request.body.From;
      var twiml = new VoiceResponse();

      var dial = twiml.dial({callerId : callerId});
      dial.number(phoneNumber);

      response.send(twiml.toString());
      // TODO: hit bubble endpoint
      axios.post('https://followupedge.com/api/1.1/wf/gotacall', {
        user: wes.data.response.results[0]._id,
        prospectPhone: request.body.From
      })
      .catch((e) => {
        console.log('you have an error')
        console.log(e.message);
      })
    }
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
