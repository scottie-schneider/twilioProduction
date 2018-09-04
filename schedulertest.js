

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
  // how do we communicate this back to the other campaign events?
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
