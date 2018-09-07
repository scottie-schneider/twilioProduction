const routes = require('express').Router();
const business = require('moment-business');
//https://github.com/jamesplease/moment-business
const moment = require('moment')
const timezone = require('moment-timezone')

function determineStartDayNoWeekends(createdAtUnix, timeZone) {
  //console.log('entering determineStartDayNoWeekends')
  let day = moment.unix(createdAtUnix)
  // console.log(`unfiltered day is ${day}`)
  // console.log(`UTC time is a ${day.format('ddd')}`)
  let localDay = moment.tz(day, timeZone); // Adjust for local timezone
  let copyLocalDay = localDay.clone() // Clone the day so your changes don't affect the mutable moment object (https://momentjs.com/docs/#/parsing/moment-clone/)
  if(business.isWeekDay(copyLocalDay.startOf('day'))){ // set the copy to start of the day and see if it's a weekday
    // console.log(`This is a weekday, it's a ${localDay.format("ddd")}`)
    // console.log(`Adjusted Time is ${localDay}`)
    // console.log(localDay.unix())
    return localDay.unix(); // if the day is a weekday then return that day, adjusted of course for local time zone
  }else {
    // console.log(`This is not a weekday, it's a ${localDay.format("ddd")}`)
    localDay = business.addWeekDays(localDay, 1).startOf('day'); //if it is a weekday, then adjust that by one business day, set to start of day
    // console.log(`I'm going to start on a ${localDay}`)
    // console.log(localDay.unix())
    return localDay.unix()
  }
}

function determineStartDayWeekends(createdAtUnix, timeZone){
  // create a moment out of the unix timestamp
  let day = moment.unix(createdAtUnix)
  // console.log(`Day with weekends ${day}`)
  // translate this into user's local time zone
  let localDay = moment.tz(day, timeZone); // Adjust for local timezone
  // console.log(`Local day returning from startDayweekends ${localDay}`)
  // this is the day they start the campaign
  return localDay.unix();
}
// below is for NO WEEKENDS !
function determineDelayNW(startDay, earlyCutoff, lateCutoff, timeZone, maxDelay){ // startDay received from above function
  // console.log('entering determineDelayNW')
  // calculate the time plus the max Delay in milliseconds
  let localDay = moment.tz(moment.unix(startDay), timeZone) // reset to timezone
  // console.log(`localDay is ${localDay}`)
  let earlyCutoffTime = localDay.clone().hour(parseInt(earlyCutoff.substring(0,2))).minute(0) // sets the bounds
  let lateCutoffTime = localDay.clone().hour(parseInt(lateCutoff.substring(0,2))).minute(0) // sets the bounds
  // console.log(`earlyCutoffTime is ${earlyCutoffTime}`);
  // console.log(`lateCutoffTime is ${lateCutoffTime}`);
  if(localDay.clone().add(maxDelay, 'ms').isAfter(lateCutoffTime)){
    // console.log('next day!')
    // add a day to local Day set to the early cutoff time
    localDay = business.addWeekDays(localDay, 1).hour(parseInt(earlyCutoff.substring(0,2))).minute(0);
    // console.log(`new day is ${localDay}`)
    return localDay.unix()
  }else if(localDay.clone().add(maxDelay, 'ms').isBetween(earlyCutoffTime, lateCutoffTime)) {
    // console.log('today, no adjustment')
    // console.log(`day to start is ${localDay}`)
    return localDay.unix()
  } else {
    // console.log('it is before')
    // set the day to the earlyCutoff time
    localDay = localDay.hour(parseInt(earlyCutoff.substring(0,2))).minute(0);
    // console.log(`will be scheduled starting with ${localDay}`)
    // console.log(`${localDay.unix()}`)
    return localDay.unix();
  }
}

function determineDelay(startDay, earlyCutoff, lateCutoff, timeZone, maxDelay){ // startDay received from above function
  // calculate the time plus the max Delay in milliseconds
  let localDay = moment.tz(moment.unix(startDay), timeZone) // reset to timezone
  // console.log(`localDay is ${localDay}`)
  let earlyCutoffTime = localDay.clone().hour(parseInt(earlyCutoff.substring(0,2))).minute(0) // sets the bounds
  let lateCutoffTime = localDay.clone().hour(parseInt(lateCutoff.substring(0,2))).minute(0) // sets the bounds
  // console.log(`earlyCutoffTime is ${earlyCutoffTime}`);
  // console.log(`lateCutoffTime is ${lateCutoffTime}`);
  if(localDay.clone().add(maxDelay, 'ms').isAfter(lateCutoffTime)){
    // console.log('next day!')
    // add a day to local Day set to the early cutoff time
    localDay.add(1, 'days').hour(parseInt(earlyCutoff.substring(0,2))).minute(0);
    // console.log(`new day is ${localDay}`)
    return localDay.unix()
  }else if(localDay.clone().add(maxDelay, 'ms').isBetween(earlyCutoffTime, lateCutoffTime)) {
    // console.log('today, no adjustment')
    // console.log(`day to start is ${localDay}`)
    return localDay.unix()
  } else {
    // console.log('it is before')
    // set the day to the earlyCutoff time
    // console.log(`LocalDay show me the way ${localDay}`) // this is a day later than needed.
    localDay = localDay.hour(parseInt(earlyCutoff.substring(0,2))).minute(0);
    console.log(`will be scheduled starting with ${localDay}`)
    console.log(`${localDay.unix()}`)
    return localDay.unix();
  }
}

function getTime(earlyCutoff, lateCutoff, createdDateUnix, delay, minToSend, hourToSend, dayMaxDelay, dayOffset, sendWeekends, timeZone){
  // Step 1: Find the actual start date
  console.log(`outside if statement ${createdDateUnix}`)
  if(sendWeekends === "no" || sendWeekends == 0){
    console.log(`starting with unix ${createdDateUnix}`)
    // determineStartDayNoWeekends - spits out a weekday to start with, local time zone
    let createDateUnix = createdDateUnix
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
      return time.unix()*1000;
    }else{ // if not day 0
      // add the startTime + dayDelay IN BUSINESS DAYS IN LOCAL
      let time = moment.tz(moment.unix(startDay), timeZone)
      time = business.addWeekDays(time.startOf('day'), dayOffset)
      // adjust for time (hours, minutes)
      
      time.hour(parseInt(hourToSend)).minute(parseInt(minToSend))
      // return the timeStamp
      console.log(`adjusted Time is ${time}`)
      console.log(`${time.unix()}`)
      return time.unix()*1000
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
      return time.unix()*1000
    }else {
      console.log('day 1+')
      // add a certain number of days
      let time = moment.tz(moment.unix(startDay), timeZone)
      console.log(`Inside getTime ${time}`)
      time = time.add(dayOffset,'days')
      // adjust for hour and minute
      time.hour(parseInt(hourToSend)).minute(parseInt(minToSend))
      console.log(`adjusted Time is ${time}`)
      console.log(`${time.unix()}`)
      return time.unix()*1000
    }
  }
}


routes.post('/campaignEvent', (req,res) => {
  
  let earlyCutoff = req.body.earlyCutoff;
  let lateCutoff = req.body.lateCutoff;
  let createDate = Math.round(req.body.createdDateUnix/1000);
  let delay = parseInt(req.body.delay) || undefined;
  let minToSend = parseInt(req.body.minToSend) || undefined;
  let hourToSend = parseInt(req.body.hourToSend) || undefined;
  let dayMaxDelay = parseInt(req.body.dayMaxDelay);
  let dayOffset = parseInt(req.body.dayOffset);
  let sendWeekends = req.body.sendWeekends;
  let timeZone = req.body.timeZone;
  console.log('scheduling!')
  console.log(`
    earlyCutoff : ${req.body.earlyCutoff}
    lateCutoff : ${req.body.lateCutoff}
    createdDateUnix : ${createDate}
    delay : ${req.body.delay}
    minToSend : ${req.body.minToSend}
    hourToSend : ${req.body.hourToSend}
    dayMaxDelay : ${req.body.dayMaxDelay}
    dayOffset : ${req.body.dayOffset}
    sendWeekends : ${req.body.sendWeekends}
    timeZone : ${req.body.timeZone}`
  )
  let time = getTime(earlyCutoff, lateCutoff, createDate, delay, minToSend, hourToSend, dayMaxDelay, dayOffset, sendWeekends, timeZone)
  console.log(`final time is ${time}`)
  res.status(200).json({scheduledTimeMilliseconds: time})
})

module.exports = routes;
module.exports.determineStartDayNoWeekends = determineStartDayNoWeekends;
module.exports.getTime = getTime;
