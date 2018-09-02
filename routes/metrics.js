require('dotenv').load();
const routes = require('express').Router();
const axios = require('axios'); // promised based requests - like fetch()
const accountSid = process.env.twilio_accountSID;
const authToken = process.env.twilio_authToken;
const client = require('twilio')(accountSid, authToken);

let spend = {};

routes.get('/twilio', (req,res) => {
  
  // get Twilio expenses
  function getTwilioCosts() {
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
        res.send(spend)
    });
  }
  getTwilioCosts();
})
module.exports = routes;
