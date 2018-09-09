require('dotenv').load();
const routes = require('express').Router();
const axios = require('axios'); // promised based requests - like fetch()
const accountSid = process.env.twilio_accountSID;
const authToken = process.env.twilio_authToken;
const client = require('twilio')(accountSid, authToken);

// moment
const moment = require('moment');
moment().format();

// Stripe
const stripe = require("stripe")(
  process.env.STRIPESK
);

let spend = {};
// note: I can collapse the code, but this should really be replaced by route modularization
routes.get('/stripe', (req,res) => {
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
              let day = parseInt(moment.unix(upcoming.date).format("DD"));
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
        // TODO: sort the invoiceObj by keys, ascending in value (number not string ;))
        console.log(invoiceObj);
        res.send({
          invoiceObj: invoiceObj,
          totalInvoiceThisMonth: totalInvoiceThisMonth/100,
          totalOpenInvoices: totalOpenInvoices,
          totalReclaimable: totalOpenInvoices + (totalInvoiceThisMonth/100)
        })
      }
    }
  })
})
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
routes.get('/users', (req,res) => {
  res.send('Hello from users land.') 
})
module.exports = routes;
