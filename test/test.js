const assert = require('assert');
var moment = require('moment');
const scheduler = require('../schedulertest')


describe('Roll Over Function', function () {
  let winCloseMoment = moment().add(7, 'days').valueOf()
  
  console.log(`winCloseMoment is ${winCloseMoment}`)
  let inDate = moment.now()
  console.log(`in date is ${inDate}`)
  it('In Date before Win Close should return 0', function () {
    assert.equal(scheduler.rollOver(inDate, winCloseMoment), 0)
  })
  
  let closeMoment2 = moment(winCloseMoment).subtract(8,'days').valueOf();
  console.log(closeMoment2)
  it('In Date after Win Close should return 1', function () {
    assert.equal(scheduler.rollOver(inDate, closeMoment2), 1)
  })
})

var a = moment('2016-01-01');
var b = a.add(1, 'week');
a.format();


// ROUTES //
// /shelteredharbor/schedule route returns a 200 status
// /shelteredharbor/schedule/prospect route creates a prospect under the user

// /shelteredharbor/schedule/events route creates the CE object under the prospect
  // Schedules the events appropriately
  // checks to ensure no bunching is going on 

// SCHEDULER //
// roll over day //
  // inDate is before winClose returns a 0
  
  // inDate is after winClose returns a 1
  
// Schedule Function //
  // inDate between the open and close times
  
  // inDate is same day but too early
    // test it gets delayed until the open window
    // test it gets scheduled after the early cutoff time
  
  // inDate is same day but too late
    // test it gets pushed to the next day
    // test it gets scheduled after the early cutoff time zone the next day
    
  
  
// Safety checks
  // count the number that should be scheduled per day
