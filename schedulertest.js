var moment = require('moment');
moment().format();

// Testing and stuff
function testMe () {
  return 'hello testing world'
}

// define inDate as a moment
// define winCloseMoment as a moment
let winCloseMoment = moment().add(7, 'days');
let inDate = moment()
console.log()




// TODO: require underscore
// TODO: require moment-timeZone
// TODO: require request

// Psuedo code
// 1 establish variables from parameters
const maxDelay;
// finds the latest campaign event to go out that day.
// Represented in bubble by filtering the campaign events by day delay 0 (to pull day 1 messages)
// and then looking for the largest delay with the :max modifier

const createdAt;
// Start Time: comes from the creation date of the campaign event
// NOTE: What happens if there is a delta (delay) between the creation of the campaign event
// and the time the function runs? Would extracting the current time (time function is running)
// be more reliable? Discuss.
// This is represented in Bubble by the parameter UNIX (ms) - Campaign Event's Creation Date extract UNIX (ms)

const inTime = createdAt + maxDelay;
// The sum of the two creates a time stamp that can be used for comparison

const eventDelta;
// Represented in Bubble as Delay (ms)
// Passed as CE's delay, which is in ms

const imm = createdAt + eventDelta;

const now = moment();
//Pulling the current date
// TODO: Check in what format this is in

const lowerLimit;
// passed as the Early Cutoff from Bubble (campaign's cutoff time early)
// example, "09:00"

const upperLimit;
// passed as the campaigns cutoff time late, see lowerLimit

const win_open;
// this is taken from lowerLimit and we're parsing the first two characters from it
// for example "09:00" and we're taking 09

const win_close;
// this is taken from upperLimit and we're parsing the first two characters from it
// for example "09:00" and we're taking 09

const timeZone;
// takes the time zone from the campaign
// ex: "Time Zone": "America/Los_Angeles"

const addDay;
// the day delay from bubble.
// 0 day delay is meant to go out immediately, 1 day delay is day after, etc.

const addHour;
// the hour to send
// "V3_timetosend_hour": 9

const addMin;
// the minute to send
// "v3 minutes number": 10

const sendWeekends;
// a boolean
// "V3_sendOnWeekends": true

let inDate = moment.tz(inTime, timeZone)
// Creates moment with a time zone based on the campaign time zone
let inDOW = inDate.isoWeekday();
// returns a number from 1 (Monday) - 7 (Sunday)

let winOpenMoment = moment.tz([inDate.year(), inDate.month(), inDate.date(), win_open], timeZone);
let winCloseMoment = moment.tz([inDate.year(), inDate.month(), inDate.date(), win_close], timeZone);
// NOTE: Not sure why this is necessary, surely there's a better way to contruct this?

console.log(`inDate: ${inDate}, winOpenMoment is ${winOpenMoment}, winCloseMoment is ${winCloseMoment}`);

let rollOverDay;

// if the indate is beyond the winClose, return one so everything can be adjusted over one day
// NOTE: Try a ternary operator here and clean the code up a bit
if (inDate.format('x') > winCloseMoment.format('x')) {
  rollOverDay = 1;
}
else {
  rollOverDay = 0;
}

console.log("rollover day:", " ", rollOverDay);
// below function takes the addDay parameter
function schedule(checkAddDay) {

  if (checkAddDay === 0) { // schedule immediate events

// if the inDate is between the open and close cutoff times, runoff
    if (winOpenMoment.format('x') < inDate.format('x') && inDate.format('x') < winCloseMoment.format('x')) {
      sched_time = moment.tz(imm, timeZone).add({seconds: 7});
      sched_time2 = sched_time.add(acctWeekend(inDOW), 'days');

      return sched_time2; // send now
    }

// if the inDate is same day but too early, wait until the open window
    else if (winOpenMoment.format('x') > inDate.format('x')) {
      sched_time = winOpenMoment.add({milliseconds: eventDelta});
      sched_time2 = sched_time.add(acctWeekend(inDOW), 'days');

      console.log("same", sched_time, acctWeekend(inDOW), sched_time2);

      return sched_time2; // wait until the open window
    }

// if the inDate is same day but too late, rollover to next day
    else {
      sched_time = winOpenMoment.add({days: 1, milliseconds: eventDelta});
      sched_time2 = sched_time.add({days:parseInt(acctWeekend(sched_time.isoWeekday()))});

      console.log("next", parseInt(acctWeekend(sched_time.isoWeekday())), sched_time2.format());

      return sched_time2; // wait until tomorrow
    }
  }

// when scheduling the non-Day 0 events
  else { // event type delay
    sched_time = moment.tz([inDate.year(), inDate.month(), inDate.date(), addHour, addMin], timeZone).add({days: addDay}); // add rollover to Day Delay
    sched_time2 = sched_time.add(parseInt(acctWeekend(inDOW)), 'days');

    console.log("del", sched_time.isoWeekday(), 'day_add: ', addDay + rollOverDay, 'wkend: ', acctWeekend(inDOW), sched_time2);

    return sched_time2;
  }
}

////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////
// code follows
console.log(context.query);
  // set the base time of when the prospect is created -- schedule today or tomorrow?
  const maxDelay = parseInt(context.query.dayMaxDelay);
  const createdAt = parseInt(context.query.startTime); // prospect creation date
  const inTime = createdAt + maxDelay;

  const eventDelta = parseInt(context.query.delta);
  const imm = createdAt + eventDelta;

  const now = moment();

  const win_open = parseInt(context.query.lowerLimit.substring(0, 2));
  const win_close = parseInt(context.query.upperLimit.substring(0, 2));
  const timeZone = context.query.timezoneID;
  // var elemType = context.query.elemType;

  const addDay = parseInt(context.query.dayOffset);
  const addHour = parseInt(context.query.hourToSend);
  const addMin = parseInt(context.query.minToSend);

  const sendWeekends = context.query.sendWeekends;

  // const inTimeMoment = moment(inTime);
  let inDate = moment.tz(inTime, timeZone);
  let inDOW = inDate.isoWeekday();

  let winOpenMoment = moment.tz([inDate.year(), inDate.month(), inDate.date(), win_open], timeZone);
  let winCloseMoment = moment.tz([inDate.year(), inDate.month(), inDate.date(), win_close], timeZone);

  console.log(`inDate: ${inDate}, winOpenMoment is ${winOpenMoment}, winCloseMoment is ${winCloseMoment}`);

  let rollOverDay;

  // if the indate is beyond the winClose, return one so everything can be adjusted over one day
  // how do we communicate this back to the other campaign events
  if (inDate.format('x') > winCloseMoment.format('x')) {
    rollOverDay = 1;
  }
  else {
    rollOverDay = 0;
  }

  console.log("rollover day:", " ", rollOverDay);

  function schedule(checkAddDay) {

    if (checkAddDay === 0) { // schedule immediate events

  // if the inDate is between the open and close cutoff times, runoff
      if (winOpenMoment.format('x') < inDate.format('x') && inDate.format('x') < winCloseMoment.format('x')) {
        sched_time = moment.tz(imm, timeZone).add({seconds: 7});
        sched_time2 = sched_time.add(acctWeekend(inDOW), 'days');

        return sched_time2; // send now
      }

  // if the inDate is same day but too early, wait until the open window
      else if (winOpenMoment.format('x') > inDate.format('x')) {
        sched_time = winOpenMoment.add({milliseconds: eventDelta});
        sched_time2 = sched_time.add(acctWeekend(inDOW), 'days');

        console.log("same", sched_time, acctWeekend(inDOW), sched_time2);

        return sched_time2; // wait until the open window
      }

  // if the inDate is same day but too late, rollover to next day
      else {
        sched_time = winOpenMoment.add({days: 1, milliseconds: eventDelta});
        sched_time2 = sched_time.add({days:parseInt(acctWeekend(sched_time.isoWeekday()))});

        console.log("next", parseInt(acctWeekend(sched_time.isoWeekday())), sched_time2.format());

        return sched_time2; // wait until tomorrow
      }
    }

  // when scheduling the non-Day 0 events
    else { // event type delay
      sched_time = moment.tz([inDate.year(), inDate.month(), inDate.date(), addHour, addMin], timeZone).add({days: addDay}); // add rollover to Day Delay
      sched_time2 = sched_time.add(parseInt(acctWeekend(inDOW)), 'days');

      console.log("del", sched_time.isoWeekday(), 'day_add: ', addDay + rollOverDay, 'wkend: ', acctWeekend(inDOW), sched_time2);

      return sched_time2;
    }
  }

  // handle weekend
  function acctWeekend(day) {
    if (sendWeekends === 'yes') {
        return 0;
    }
    else { // calc based on delay's sched_time

      if (day !== 6 && day !== 7) {
        return 0;
      }
      else if (day === 6) {
        return 2;
      }
      else {
          return 1;
        }
    }
  }
module.exports = {
  rollOver: function (inDate, winCloseMoment) {
    if (inDate > winCloseMoment) {
      return rollOverDay = 1;
    }
    else {
      return rollOverDay = 0;
    }
  }
}
