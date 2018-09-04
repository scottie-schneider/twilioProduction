const routes = require('express').Router();
const business = require('moment-business');
//https://github.com/jamesplease/moment-business
const moment = require('moment')
const timezone = require('moment-timezone')
routes.get('/', (req,res) => {
  res.status(200).json({message: 'Schedule me!'})
})

function determineStartDayNoWeekends(createdAtUnix, timeZone) {
  let day = moment.unix(createdAtUnix)
  console.log(`UTC time is a ${day.format('ddd')}`)
  let localDay = moment.tz(day, timeZone); // Adjust for local timezone
  let copyLocalDay = localDay.clone() // Clone the day so your changes don't affect the mutable moment object (https://momentjs.com/docs/#/parsing/moment-clone/)
  if(business.isWeekDay(copyLocalDay.startOf('day'))){ // set the copy to start of the day and see if it's a weekday
    console.log(`This is a weekday, it's a ${localDay.format("ddd")}`)
    console.log(`Adjusted Time is ${localDay}`)
    console.log(localDay.unix())
    return localDay.unix(); // if the day is a weekday then return that day, adjusted of course for local time zone
  }else {
    console.log(`This is not a weekday, it's a ${localDay.format("ddd")}`)
    localDay = business.addWeekDays(localDay, 1).startOf('day'); //if it is a weekday, then adjust that by one business day, set to start of day
    console.log(`I'm going to start on a ${localDay}`)
    console.log(localDay.unix())
    return localDay.unix()
  }
}

function determineStartDayWeekends(createdAtUnix, timeZone){
  // create a moment out of the unix timestamp
  let day = moment.unix(createdAtUnix)
  console.log(`Day with weekends ${day}`)
  // translate this into user's local time zone
  let localDay = moment.tz(day, timeZone); // Adjust for local timezone
  console.log(`Local day returning from startDayweekends ${localDay}`)
  // this is the day they start the campaign
  return localDay.unix();
}
// below is for NO WEEKENDS !
function determineDelayNW(startDay, earlyCutoff, lateCutoff, timeZone, maxDelay){ // startDay received from above function
  // calculate the time plus the max Delay in milliseconds
  let localDay = moment.tz(moment.unix(startDay), timeZone).add(maxDelay, 'ms') // reset to timezone and add maxDelay
  console.log(`localDay is ${localDay}`)
  let earlyCutoffTime = localDay.clone().hour(parseInt(earlyCutoff.substring(0,2))).minute(0) // sets the bounds
  let lateCutoffTime = localDay.clone().hour(parseInt(lateCutoff.substring(0,2))).minute(0) // sets the bounds
  console.log(`earlyCutoffTime is ${earlyCutoffTime}`);
  console.log(`lateCutoffTime is ${lateCutoffTime}`);
  if(localDay.isAfter(lateCutoffTime)){
    console.log('next day!')
    // add a day to local Day set to the early cutoff time
    localDay = business.addWeekDays(localDay, 1).hour(parseInt(earlyCutoff.substring(0,2))).minute(0);
    console.log(`new day is ${localDay}`)
    return localDay.unix()
  }else if(localDay.isBetween(earlyCutoffTime, lateCutoffTime)) {
    console.log('today, no adjustment')
    console.log(`day to start is ${localDay}`)
    return localDay.unix()
  } else {
    console.log('it is before')
    // set the day to the earlyCutoff time
    localDay = localDay.hour(parseInt(earlyCutoff.substring(0,2))).minute(0);
    console.log(`will be scheduled starting with ${localDay}`)
    console.log(`${localDay.unix()}`)
    return localDay.unix();
  }
}

function determineDelay(startDay, earlyCutoff, lateCutoff, timeZone, maxDelay){ // startDay received from above function
  // calculate the time plus the max Delay in milliseconds
  let localDay = moment.tz(moment.unix(startDay), timeZone) // reset to timezone
  console.log(`localDay is ${localDay}`)
  let earlyCutoffTime = localDay.clone().hour(parseInt(earlyCutoff.substring(0,2))).minute(0) // sets the bounds
  let lateCutoffTime = localDay.clone().hour(parseInt(lateCutoff.substring(0,2))).minute(0) // sets the bounds
  console.log(`earlyCutoffTime is ${earlyCutoffTime}`);
  console.log(`lateCutoffTime is ${lateCutoffTime}`);
  if(localDay.clone().add(maxDelay, 'ms').isAfter(lateCutoffTime)){
    console.log('next day!')
    // add a day to local Day set to the early cutoff time
    localDay.add(1, 'days').hour(parseInt(earlyCutoff.substring(0,2))).minute(0);
    console.log(`new day is ${localDay}`)
    return localDay.unix()
  }else if(localDay.clone().add(maxDelay, 'ms').isBetween(earlyCutoffTime, lateCutoffTime)) {
    console.log('today, no adjustment')
    console.log(`day to start is ${localDay}`)
    return localDay.unix()
  } else {
    console.log('it is before')
    // set the day to the earlyCutoff time
    console.log(`LocalDay show me the way ${localDay}`) // this is a day later than needed.
    localDay = localDay.hour(parseInt(earlyCutoff.substring(0,2))).minute(0);
    console.log(`will be scheduled starting with ${localDay}`)
    console.log(`${localDay.unix()}`)
    return localDay.unix();
  }
}
// before the cutoff time zone, starts day of at 9
// determineDelay(1536510362, "09:00", "19:00", "Australia/Sydney", 1200000)

//determineDelayNW(1535950800, "09:00", "19:00", "Australia/Sydney", 1200000)
// after the late time, starts a day later at early time zone
//determineDelayNW(1535968800, "09:00", "19:00", "Australia/Sydney", 1200000)
function scheduleDayOne(startTime, timeDelay){
  // take the startTime, and then add the timeDelay in MS - this is the time we need it to send out
  let scheduledTime = moment.unix(startTime).add(timeDelay, 'ms')
  console.log(`UTC - ${scheduledTime}`)
  console.log(`UTC Unix - ${scheduledTime.unix()}`)
  return scheduledTime.unix();
}
// should schedule for monday 10th 9:20am in Sydney ()
//scheduleDayOne(1536534002, 1200000)

function scheduleDays(startTime, determinedDelay, earlyCutoff, lateCutoff, timeZone, hour, minute){
  
}
// before the cutoff time zone, starts day of at 9
//determineDelayNW(1536510362, "09:00", "19:00", "Australia/Sydney", 1200000)
// within the time zones, starts on time
//determineDelayNW(1535950800, "09:00", "19:00", "Australia/Sydney", 1200000)
// after the late time, starts a day later at early time zone
//determineDelayNW(1535968800, "09:00", "19:00", "Australia/Sydney", 1200000)

function getTime(earlyCutoff, lateCutoff, createdDateUnix, delay, minToSend, hourToSend, dayMaxDelay, dayOffset, sendWeekends, timeZone){
  // Step 1: Find the actual start date
  if(sendWeekends === 0){
    // determineStartDayNoWeekends - spits out a weekday to start with, local time zone
    let phase1 = determineStartDayNoWeekends(createdDateUnix, timeZone);
    // determineDelayNW(startDay, earlyCutoff, lateCutoff, timeZone, maxDelay) - figures out the actual day to start
    let startDay = determineDelayNW(phase1, earlyCutoff, lateCutoff, timeZone, dayMaxDelay)
    // if day 0
    if(dayOffset === 0){
      // add the startTime + delay
      console.log('day 0')
      let time = moment.unix(startDay).add(delay, 'ms')
      console.log(`UTC Time: ${time}`)
      console.log(`UTC Time (UNIX): ${time.unix()}`)
      console.log(`Local Time: ${moment.tz(time, timeZone)}`)
      console.log(`Local Time (UNIX): ${moment.tz(time, timeZone).unix()}`)
      return time;
    }else{ // if not day 0
      // add the startTime + dayDelay IN BUSINESS DAYS IN LOCAL
      let time = moment.tz(moment.unix(startDay), timeZone)
      time = business.addWeekDays(time.startOf('day'), dayOffset)
      // adjust for time (hours, minutes)
      
      time.hour(parseInt(hourToSend)).minute(parseInt(minToSend))
      // return the timeStamp
      console.log(`adjusted Time is ${time}`)
      console.log(`${time.unix()}`)
      return time
    }
  } else {
    // if send on weekends
    let phase1 = determineStartDayWeekends(createdDateUnix, timeZone);
    let startDay = determineDelay(phase1, earlyCutoff, lateCutoff, timeZone, dayMaxDelay)
    // if day 0
    if(dayOffset === 0){
      // add the startTime + delay
      console.log('day 0')
      let time = moment.tz(moment.unix(startDay), timeZone)
      time = time.add(delay, 'ms')
      console.log(`UTC Time: ${time}`)
      console.log(`UTC Time (UNIX): ${time.unix()}`)
      console.log(`Local Time: ${moment.tz(time, timeZone)}`)
      console.log(`Local Time (UNIX): ${moment.tz(time, timeZone).unix()}`)
      // return time
      return time.unix()
    }else {
      console.log('day 1+')
      // add a certain number of days
      let time = moment.tz(moment.unix(startDay), timeZone)
      console.log(`Inside getTime ${time}`)
      time = time.add(dayOffset,'days')
      // adjust for hour and minute
      time.hour(parseInt(hourToSend)).minute(parseInt(minToSend))
      // return time
      console.log(`adjusted Time is ${time}`)
      console.log(`${time.unix()}`)
      return time.unix()
    }
  }
  
  
  
  
  // if not send weekends
}
//getTime(earlyCutoff, lateCutoff, createdDateUnix, delay, minToSend, hourToSend, dayMaxDelay, dayOffset, sendWeekends, timeZone)
// Should schedule for 9:01am Fri Aug 31st (Aussie time) and Thu Aug 30 1801 for UTC
//getTime("09:00", "18:00", 1535657223, 60000, undefined, undefined, 1200000, 1, 0, "Australia/Sydney")
// should schedule for 12:12am Tuesday the 4th (Aussie time)
//getTime("09:00", "18:00", 1535750762, 600000, 12, 12, 3360000, 1, 1, "Australia/Sydney")

// test cases
// Thursday in the states, Friday in Australia - start date Friday +10
//determineStartDayNoWeekends(1535657223, "Australia/Sydney");
// Friday in the states, Saturday in Australia - start date Monday +10
//determineStartDayNoWeekends(1535750762, "Australia/Sydney");
// Saturday in the states, Sunday in Australia - start date Monday +10
//determineStartDayNoWeekends(1536423962, "Australia/Sydney");
// Sunday in the states, Monday in Australia
//determineStartDayNoWeekends(1536510362, "Australia/Sydney");

// Thursday in the states, Friday in Australia - start date Friday +10
//determineStartDayWeekends(1535657223, "Australia/Sydney");
// Friday in the states, Saturday in Australia - start date Saturday +10
//determineStartDayWeekends(1535750762, "Australia/Sydney");
// Saturday in the states, Sunday in Australia - start date Sunday +10
//determineStartDayWeekends(1536423962, "Australia/Sydney");
// Sunday in the states, Monday in Australia - Start date Monday +10
//determineStartDayWeekends(1536510362, "Australia/Sydney");


routes.get('/weekends', (req,res) => {
  // whether or not we add a day to the sequence
  let dayAdd = 0;
  // the given day delay on the campaign event
  let dayDelay = 0;
  
  // defines dayAdd as either 0 or 1
  checkAddDayWeekends();
  
  if(dayAdd == 0){
    // schedule day 0
    scheduleDayOne();
  }else{
    // dayDelay
    scheduleDay();
  }
  res.status(200).json({message: 'Sending with weekends!'})
})

routes.get('/noweekends', (req,res) => {
  // define variables
  let dayAdd = 0;
  // the given day delay on the campaign event
  let dayDelay = 0;
  
  // defines dayAdd from 0 - 6
  checkAddDayNoWeekends();
  
  if(dayAdd == 0){
    // schedule day 0
    scheduleDayOne();
  }else{
    // dayDelay
    scheduleDay();
  }
  res.status(200).json({message: 'Sending with no weekends!'})
})

module.exports = routes;
module.exports.determineStartDayNoWeekends = determineStartDayNoWeekends;
module.exports.getTime = getTime;
