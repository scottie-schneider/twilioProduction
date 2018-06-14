/**
 *  Call Forward Template
 *
 *  This Function will forward a call to another phone number. If the call isn't answered or the line is busy,
 *  the call is optionally forwarded to a specified URL. You can optionally restrict which calling phones
 *  will be forwarded.
 */

exports.handler = function(context, event, callback) {
  // async call to bubble to get user

  let token = '98107ac3b7b363d93f1b9e3863b79bee;'
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
    let callerId =  event.CallerId || null;
    // OPTIONAL
    let timeout = event.Timeout || null;
    // OPTIONAL
    let allowedCallers = event.allowedCallers || [];

    // generate the TwiML to tell Twilio how to forward this call
    let twiml = new Twilio.twiml.VoiceResponse();

    let allowedThrough = true
    if (allowedCallers.length > 0) {
      if (allowedCallers.indexOf(event.From) === -1) {
        allowedThrough = false;
      }
    }

    let dialParams = {};
    if (callerId) {
      dialParams.callerId = callerId
    }
    if (timeout) {
      dialParams.timeout = timeout
    }

    if (allowedThrough) {
      twiml.dial(dialParams, phoneNumber);
    }
    else {
      twiml.say('Sorry, you are calling from a restricted number. Good bye.');
    }
    return twiml;
})
  .catch((e) => {
    console.log(e);
    console.log('fire the second forward')
  })
});

  // return the TwiML
  callback(null, twiml);
};
