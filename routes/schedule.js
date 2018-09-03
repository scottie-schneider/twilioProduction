const routes = require('express').Router();

routes.get('/', (req,res) => {
  res.status(200).json({message: 'Schedule me!'})
})

routes.get('/weekends', (req,res) => {
  res.status(200).json({message: 'Sending with weekends!'})
  // ID the user, and look for the prospect
    // Doesn't exist: create prospect
      // ownerId
      // Campaign object with campaignId
      // prospectId
    // Does exist:
      // clear the old campaign events
      // add the new campaign Object
  // returns error status or success
})

routes.get('/noweekends', (req,res) => {
  res.status(200).json({message: 'Sending with no weekends!'})
  // TODO: Create campaign events on Prospect object
  // Get the list of campaign events by day from bubble
    // for each campaign event by day
      // create a new day object in the Campaign
      // poll bubble for a list of the campaign events (v3_day)
        // add each CE to the appropriate day
        // NOTE: how do we sort by time?
          // if day delay = 0, then sort by delay
          // if day delay != 0, sort by timestamp
  // TODO: Schedule those bad boys (assigning timestamps)
    // for day = 0 && sendOnWeekends
      // are we before the early cutoff time?
      
      // are we after the late cutoff time? (current day)
      
      // are we within the margins?
        
    // for day != 0 && sendOnWeekends
      // what's the delta from the last event scheduled? ie., day 1 and last was day 0
      
    // for day = 0 && !sendOnWeekends
    // is today a weekend?
      // yes: push to next non weekend day
      // no: let's go!
    // for day != 0 && !sendOnWeekends
    // is today a weekend?
      // yes: push to next non weekend day
      // no: let's go!
        // take delta from last scheduled event
  
  // TODO: once scheduled and timestamps assigned, schedule in Bubble
  
  // TODO: testing
    // does the number of timestamp events/day match with the number of object events per day?
    // does the total number of events match?
    // if send on weekends: are we sending on weekends?
    // if not send on weekends, are weekends exempted?
    // TODO: handling for multiple weekends and state
})

module.exports = routes;
