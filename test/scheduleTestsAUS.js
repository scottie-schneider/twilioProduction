const assert = require('assert');
var moment = require('moment');
const scheduler = require('../routes/schedule')

describe('Australia - send on weekends', function () {
  // DAY 0 Weekday
  // before day
  it('Start: Friday 05:27, 1 min delay, maxDelay: 20 min. Schedules Friday at 9:01', function () {
    assert.equal(scheduler.getTime("09:00", "18:00", 1535657223, 60000, undefined, undefined, 1200000, 0, 1, "Australia/Sydney"), 1535670063)
  })
  // during day
  it('Start: Thursday 11:34, 1 min delay, maxDelay: 20 min. Schedules Thursday at 1135', function () {
    assert.equal(scheduler.getTime("09:00", "18:00", 1536197640, 60000, undefined, undefined, 1200000, 0, 1, "Australia/Sydney"), 1536197700)
  })
  // after late cutoff
  it('Start: Wednesday 20:35, 10 min delay, maxDelay: 20 min. Schedules Thursday at 09:10', function () {
    assert.equal(scheduler.getTime("09:00", "18:00", 1536143714, 600000, undefined, undefined, 1200000, 0, 1, "Australia/Sydney"), 1536189014)
  })
  // DAY 0 Weekend
  // before day
  it('Start: Saturday 07:35, 13 min delay, maxDelay: 1 hour Schedules Saturday at 9:13', function () {
    assert.equal(scheduler.getTime("09:00", "18:00", 1536356114, 780000, undefined, undefined, 3600000, 0, 1, "Australia/Sydney"), 1536361994)
  })
  // during day
  it('Start: Sunday 15:02, 42 min delay, maxDelay: 1 hour Schedules Sunday at 15:44', function () {
    assert.equal(scheduler.getTime("09:00", "18:00", 1536469320, 2520000, undefined, undefined, 3600000, 0, 1, "Australia/Sydney"), 1536471840)
  })
  // after late cutoff
  it('Start: Sunday 22:20, 29 min delay, maxDelay: 1 hour Schedules Monday at 09:29', function () {
    assert.equal(scheduler.getTime("09:00", "18:00", 1536495600, 1740000, undefined, undefined, 3600000, 0, 1, "Australia/Sydney"), 1536535740)
  })
  // DAY 1 Weekday
  // before day
  it('Start: Monday 05:29, maxDelay: 1 hour Schedules Tuesday at 15:20', function () {
    assert.equal(scheduler.getTime("09:00", "18:00", 1536520800, undefined, 20, 15, 3600000, 1, 1, "Australia/Sydney"), 1536643200)
  })
  // during day
  it('Start: Tuesday 10:45, maxDelay: 1 hour Schedules Wednesday at 11:00', function () {
    assert.equal(scheduler.getTime("09:00", "18:00", 1536630300, undefined, 00, 11, 3600000, 1, 1, "Australia/Sydney"), 1536714000)
  })
  // after late cutoff
  it('Start: Wednesday 22:03, maxDelay: 1 hour Schedules Friday at 16:20', function () {
    assert.equal(scheduler.getTime("09:00", "18:00", 1536753780, undefined, 20, 16, 3600000, 1, 1, "Australia/Sydney"), 1536906000)
  })
  // DAY 1 Weekend
  // before day
  it('Start: Saturday 05:29, maxDelay: 1 hour Schedules Sunday at 12:23', function () {
    assert.equal(scheduler.getTime("09:00", "18:00", 1536953340, undefined, 23, 12, 3600000, 1, 1, "Australia/Sydney"), 1537064580)
  })
  // during day
  it('Start: Saturday 10:45, maxDelay: 1 hour Schedules Sunday at 11:00', function () {
    assert.equal(scheduler.getTime("09:00", "18:00", 1536972300, undefined, 00, 11, 3600000, 1, 1, "Australia/Sydney"), 1537059600)
  })
  // after late cutoff
  it('Start: Sunday 22:03, maxDelay: 1 hour Schedules Tuesday at 16:20', function () {
    assert.equal(scheduler.getTime("09:00", "18:00", 1537099380, undefined, 20, 16, 3600000, 1, 1, "Australia/Sydney"), 1537251600)
  })
})
// Australia - don't send on weekends
describe('Australia - do not send on weekends', function () {
  // DAY 0 Weekday
  // before day
  it('Start: Friday 8/31 05:27, 1 min delay, maxDelay: 20 min. Schedules Friday 8/31 at 9:01', function () {
    assert.equal(scheduler.getTime("09:00", "18:00", 1535657220, 60000, undefined, undefined, 1200000, 0, 0, "Australia/Sydney"), 1535670060)
  })
  // during day
  it('Start: Thursday 11:34 8/30, 1 min delay, maxDelay: 20 min. Schedules Thursday 8/30 at 1135', function () {
    assert.equal(scheduler.getTime("09:00", "18:00", 1535592840, 60000, undefined, undefined, 1200000, 0, 0, "Australia/Sydney"), 1535592900)
  })
  //after late cutoff
  it('Start: Wednesday 20:35, 10 min delay, maxDelay: 20 min. Schedules Thursday at 09:10', function () {
    assert.equal(scheduler.getTime("09:00", "18:00", 1536143714, 600000, undefined, undefined, 1200000, 0, 0, "Australia/Sydney"), 1536189014)
  })
  //DAY 0 Weekend - No send on weekends
  //before day
  it('Start: Saturday 07:35 9/8, 13 min delay, maxDelay: 1 hour Schedules Monday 9/10 at 9:13', function () {
    assert.equal(scheduler.getTime("09:00", "18:00", 1536356114, 780000, undefined, undefined, 3600000, 0, 0, "Australia/Sydney"), 1536534780)
  })
  // during day
  it('Start: Sunday 15:02 9/9, 42 min delay, maxDelay: 1 hour Schedules Monday at 09:42', function () {
    assert.equal(scheduler.getTime("09:00", "18:00", 1536469320, 2520000, undefined, undefined, 3600000, 0, 0, "Australia/Sydney"), 1536536520)
  })
  // after late cutoff
  it('Start: Sunday 22:20 9/9, 29 min delay, maxDelay: 1 hour Schedules Monday at 09:29', function () {
    assert.equal(scheduler.getTime("09:00", "18:00", 1536495600, 1740000, undefined, undefined, 3600000, 0, 0, "Australia/Sydney"), 1536535740)
  })
  // DAY 1 Weekday - No send on weekends
  // before day
  it('Start: Monday 05:29, maxDelay: 1 hour Schedules Tuesday at 15:20', function () {
    assert.equal(scheduler.getTime("09:00", "18:00", 1536520800, undefined, 20, 15, 3600000, 1, 0, "Australia/Sydney"), 1536643200)
  })
  // during day
  it('Start: Tuesday 10:45, maxDelay: 1 hour Schedules Wednesday at 11:00', function () {
    assert.equal(scheduler.getTime("09:00", "18:00", 1536630300, undefined, 00, 11, 3600000, 1, 0, "Australia/Sydney"), 1536714000)
  })
  // after late cutoff
  it('Start: Wednesday 22:03, maxDelay: 1 hour Schedules Friday at 16:20', function () {
    assert.equal(scheduler.getTime("09:00", "18:00", 1536753780, undefined, 20, 16, 3600000, 1, 0, "Australia/Sydney"), 1536906000)
  })
  // DAY 1 Weekend - No send on weekends
  // before day
  it('Start: Saturday 05:29 9/9, maxDelay: 1 hour Schedules Tuesday 9/11 at 12:23', function () {
    assert.equal(scheduler.getTime("09:00", "18:00", 1536434940, undefined, 23, 12, 3600000, 1, 0, "Australia/Sydney"), 1536632580)
  })
  // during day
  it('Start: Saturday 10:45 9/9, maxDelay: 1 hour Schedules Tuesday at 11:00', function () {
    assert.equal(scheduler.getTime("09:00", "18:00", 1536453900, undefined, 00, 11, 3600000, 1, 0, "Australia/Sydney"), 1536627600)
  })
  // after late cutoff
  it('Start: Sunday 22:03 9/9, maxDelay: 1 hour Schedules Tuesday at 16:20', function () {
    assert.equal(scheduler.getTime("09:00", "18:00", 1536494580, undefined, 20, 16, 3600000, 1, 0, "Australia/Sydney"), 1536646800)
  })
})
// US - send on weekends

// US - don't send on weekends
