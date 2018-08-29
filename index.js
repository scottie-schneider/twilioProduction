
const accountSid = process.env.twilio_accountSID;
const authToken = process.env.twilio_authToken;
// Required modules follow
const express = require('express');
const VoiceResponse = require('twilio').twiml.VoiceResponse;
const bodyParser = require('body-parser');
const axios = require('axios'); // promised based requests - like fetch()
//const client = require('twilio')(accountSid, authToken);

////////////////////////////////////////////////////////////////////////////////
// Stripe specific info
require('dotenv').config();

const stripe = require("stripe")(
  'sk_live_nXtU4rFd1oGkcNOzI1L65b55'
  //process.env.STRIPESK
);

const moment = require('moment');
moment().format();

////////////////////////////////////////////////////////////////////////////////

const app = express();
app.set('port', (process.env.PORT || 5000));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Parsing
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Sanity check
app.get('/', (request, response) => {
  response.send('hello world');
});
// pinging Twilio for the monthly spend. Using boilerplate code found on their site
app.get('/expenses', (request, response) => {
  let spend = {};
  // use the lastMonth modifier to return total spend month before
  client.usage.records.lastMonth.list({
  }).then(function(results) {
      if (!results) {
          throw { message: 'Ruh roh - couldn\'t list numbers because: '};
      }
      for(item in results){
        if(results[item].category == 'totalprice'){
          console.log(results[item].price)
          spend['lastMonth'] = results[item].price;
        }
      }
      // Return promise for the next call to Twilio...
      return client.usage.records.thisMonth.list({})
  }).then(function(thisMonth) {
      // handle the case where there are no numbers found
      for(item in thisMonth){
        if(thisMonth[item].category == 'totalprice'){
          console.log(thisMonth[item].price)
          spend['thisMonth'] = thisMonth[item].price;
        }
      }
  }).then(function(number) {
      // Success!  This is our final state
      console.log('Success');
  }).catch(function(error) {
      // Handle any error from any of the steps...
      console.error('Buying the number failed. Reason: '+error.message);
  }).finally(function() {
      // This optional function is *always* called last, after all other callbacks
      // are invoked.  It's like the "finally" block of a try/catch
      console.log(spend);
      response.send(spend)
  });
})
// calculate upcoming invoices
app.get('/upcoming', (request, response) => {
  // object that holds the invoices in the format { 'date' : '$200'}, such as { '20' : 200 }
  let invoiceObj = {};
  let customerList = [];
  let totalInvoiceThisMonth = 0;
  let totalInvoiceNextMonth = 0;
  let totalOpenInvoices = 0;
  let countUpcoming = 0;
  let countOpen = 0;
  let check = 0;

  //////////////////////////////////////////////
  // Get those customers!
  //////////////////////////////////////////////

  stripe.customers.list({ limit: 100 })
  .then(function(customers){
    for(let i = 0; i < customers.data.length; i++){
      customerList.push(customers.data[i].id);
    }

    //////////////////////////////////////////////
    // Get any open invoices left for the month
    //////////////////////////////////////////////

    stripe.invoices.list(
      {
        limit: 100,
        due_date: {
          'gt': moment.utc().month(), // due date is after this current month's timestamp
          // NOTE: You'll still want to check if there are any super old invoices you're not catching...
          // TODO: Ensure we're paginating
        }
      },
      function(err, invoices) {
        for(let i = 0; i < invoices.data.length; i++){
          if(!invoices.data[i].paid && !invoices.data[i].closed){
            totalOpenInvoices += invoices.data[i].amount_due/100;
            countOpen++;
            console.log(`There is an open invoice due for ${invoices.data[i].amount_due/100}, from customer ${invoices.data[i].customer}: ${invoices.data[i].id}`)
          } else{
            countOpen++
          }
          if(countOpen > invoices.data.length -1){
            done();
          }
        }
      }
    );


    //////////////////////////////////////////////
    // Getting upcoming invoices (not charged yet)
    //////////////////////////////////////////////

    // for each, run the function with a callback
    const asyncForEach = (array, callback) => {
      for(let index = 0; index < array.length; index++){
        callback(array[index])
      }
    }

    const getUpcomingInvoices = async () => {
      await asyncForEach(customerList, async(num) => {
        stripe.invoices.retrieveUpcoming(
          num,
          function(err, upcoming) {
            if(upcoming){ // if the invoice is not null
              let date = moment.unix(upcoming.date);
              let day = moment.unix(upcoming.date).format("DD");
              if (moment(date).isSame(new Date(), 'month')){ // invoice is for this month
                if(day in invoiceObj){ // if invoice exists and day is in the object
                  console.log(`UPCOMING ${upcoming.amount_due/100}, paid on the ${day}, by customerID: ${num}`);
                  totalInvoiceThisMonth += upcoming.amount_due;
                  invoiceObj[day] += upcoming.amount_due/100;
                  countUpcoming++;
                }else{ // if invoice exists and day isn't in the object yet
                  totalInvoiceThisMonth += upcoming.amount_due;
                  invoiceObj[day] = upcoming.amount_due/100;
                  console.log(`UPCOMING ${upcoming.amount_due/100}, paid on the ${day}, by customerID: ${num}`);
                  countUpcoming++
                }
              } else { // invoice is for next month
                countUpcoming++;
              }
              if(countUpcoming > customerList.length - 1){
                done();
              }
            }else {
              countUpcoming++
              if(countUpcoming > customerList.length - 1){
                done();
              }
            }
          }
        )
      })
    }

  getUpcomingInvoices();
    function done() {
      check++;
      if(check == 2){
        console.log(`Current upcoming invoice total: $${totalInvoiceThisMonth/100}`)
        console.log(`Current oustanding invoices (LATE): $${totalOpenInvoices}`)
        console.log(`Total reclaimable income til end of month: $${totalOpenInvoices+totalInvoiceThisMonth/100}`)
        console.log(invoiceObj);
        response.send({
          invoiceObj: invoiceObj,
          totalInvoiceThisMonth: totalInvoiceThisMonth/100,
          totalOpenInvoices: totalOpenInvoices,
          totalReclaimable: totalOpenInvoices + (totalInvoiceThisMonth/100)
        })
      }
    }
  })
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
// Oh shit, recreating the scheduler function here.
app.post('/schedule', (request, response) => {
  console.log('scheduled!')
  response.send('Hello Scheduler')
})
// Create an HTTP server and listen for requests on port 5000
app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});
