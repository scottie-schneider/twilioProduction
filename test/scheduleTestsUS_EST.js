const assert = require('assert');
var moment = require('moment');
const scheduler = require('../routes/schedule')

describe('EST - Day 0 - weekends', function () {
  // DAY 0 Weekday
  // before day
  it('Start: Friday 9/14 05:27, 1 min delay, maxDelay: 20 min. Schedules Friday 14th at 9:01', function () {
    assert.equal(scheduler.getTime("09:00", "18:00", 1536917220, 60000, undefined, undefined, 1200000, 0, 1, "America/New_York"), 1536930060000)
  })
  // during day
  it('Start: Thursday 9/13 11:34, 1 min delay, maxDelay: 20 min. Schedules Thursday 13th at 1135', function () {
    assert.equal(scheduler.getTime("09:00", "18:00", 1536852840, 60000, undefined, undefined, 1200000, 0, 1, "America/New_York"), 1536852900000)
  })
  // after late cutoff
  it('Start: Wednesday 9/12 20:35, 10 min delay, maxDelay: 20 min. Schedules Thursday 13th at 09:10', function () {
    assert.equal(scheduler.getTime("09:00", "18:00", 1536798900, 600000, undefined, undefined, 1200000, 0, 1, "America/New_York"), 1536844200000)
  })
  // DAY 0 Weekend
  // before day
  it('Start: Saturday 9/15 07:35, 13 min delay, maxDelay: 1 hour Schedules Saturday at 9:13', function () {
    assert.equal(scheduler.getTime("09:00", "18:00", 1537011300, 780000, undefined, undefined, 3600000, 0, 1, "America/New_York"), 1537017180000)
  })
  // during day
  it('Start: Sunday 9/16 15:02, 42 min delay, maxDelay: 1 hour Schedules Sunday 16th at 15:44', function () {
    assert.equal(scheduler.getTime("09:00", "18:00", 1537124520, 2520000, undefined, undefined, 3600000, 0, 1, "America/New_York"), 1537127040000)
  })
  // after late cutoff
  it('Start: Sunday 9/16 22:20, 29 min delay, maxDelay: 1 hour Schedules Monday 17th at 09:29', function () {
    assert.equal(scheduler.getTime("09:00", "18:00", 1537150800, 1740000, undefined, undefined, 3600000, 0, 1, "America/New_York"), 1537190940000)
  })
})

describe('EST - Day 1 - weekends', function () {
  // DAY 1 Weekday
  // before day
  it('Start: Monday 9/17 05:29, maxDelay: 1 hour Schedules Tuesday 18th at 15:20', function () {
    assert.equal(scheduler.getTime("09:00", "18:00", 1537176540, undefined, 20, 15, 3600000, 1, 1, "America/New_York"), 1537298400000)
  })
  // during day
  it('Start: Tuesday 18th 10:45, maxDelay: 1 hour Schedules Wednesday 19th at 11:00', function () {
    assert.equal(scheduler.getTime("09:00", "18:00", 1537281900, undefined, 00, 11, 3600000, 1, 1, "America/New_York"), 1537369200000)
  })
  // after late cutoff
  it('Start: Wednesday 19th 22:03, maxDelay: 1 hour Schedules Friday 21st at 16:20', function () {
    assert.equal(scheduler.getTime("09:00", "18:00", 1537408980, undefined, 20, 16, 3600000, 1, 1, "America/New_York"), 1537561200000)
  })
  // DAY 1 Weekend
  // before day
  it('Start: Saturday 9/15 05:29, maxDelay: 1 hour Schedules Sunday 16th at 12:23', function () {
    assert.equal(scheduler.getTime("09:00", "18:00", 1537003740, undefined, 23, 12, 3600000, 1, 1, "America/New_York"), 1537114980000)
  })
  // during day
  it('Start: Saturday 9/15 10:45, maxDelay: 1 hour Schedules Sunday 16th at 11:00', function () {
    assert.equal(scheduler.getTime("09:00", "18:00", 1537022700, undefined, 00, 11, 3600000, 1, 1, "America/New_York"), 1537110000000)
  })
  // after late cutoff
  it('Start: Sunday 9/16 22:03, maxDelay: 1 hour Schedules Tuesday 18th at 16:20', function () {
    assert.equal(scheduler.getTime("09:00", "18:00", 1537149780, undefined, 20, 16, 3600000, 1, 1, "America/New_York"), 1537302000000)
  })
})

// describe('EST - Day 2 - weekends', function () {
//   // DAY 2 Weekday
//   // before day
//   it('Start: Monday 05:29 9/10, maxDelay: 1 hour Schedules Wednesday at 10:22', function () {
//     assert.equal(scheduler.getTime("09:00", "18:00", 1536521340, undefined, 22, 10, 3600000, 2, 1, "America/New_York"), 1536711720000)
//   })
//   // during day
//   it('Start: Tuesday 9/11 10:45 9/11, maxDelay: 1 hour Schedules Thursday at 11:00', function () {
//     assert.equal(scheduler.getTime("09:00", "18:00", 1536626700, undefined, 00, 11, 3600000, 2, 1, "America/New_York"), 1536800400000)
//   })
//   // after late cutoff
//   it('Start: Wednesday 9/12 22:03, maxDelay: 1 hour Schedules Saturday 9/15 at 16:20', function () {
//     assert.equal(scheduler.getTime("09:00", "18:00", 1536753780, undefined, 20, 16, 3600000, 2, 1, "America/New_York"), 1536992400000)
//   })
//   // DAY 2 Weekend
//   // before day
//   it('Start: Saturday 9/15 05:29, maxDelay: 1 hour Schedules Monday 17th at 12:23', function () {
//     assert.equal(scheduler.getTime("09:00", "18:00", 1536953340, undefined, 23, 12, 3600000, 2, 1, "America/New_York"), 1537150980000)
//   })
//   // during day
//   it('Start: Saturday 9/15 10:45, maxDelay: 1 hour Schedules Monday 17th at 11:00', function () {
//     assert.equal(scheduler.getTime("09:00", "18:00", 1536972300, undefined, 00, 11, 3600000, 2, 1, "America/New_York"), 1537146000000)
//   })
//   // after late cutoff
//   it('Start: Sunday 9/16 22:03, maxDelay: 1 hour Schedules Wednesday at 16:20', function () {
//     assert.equal(scheduler.getTime("09:00", "18:00", 1537099380, undefined, 20, 16, 3600000, 2, 1, "America/New_York"), 1537338000000)
//   })
// })
// // EST - don't send on weekends
// describe('EST - Day 0 - NO weekends', function () {
//   // DAY 0 Weekday
//   // before day
//   it('Start: Friday 8/31 05:27, 1 min delay, maxDelay: 20 min. Schedules Friday 8/31 at 9:01', function () {
//     assert.equal(scheduler.getTime("09:00", "18:00", 1535657220, 60000, undefined, undefined, 1200000, 0, 0, "America/New_York"), 1535670060000)
//   })
//   // during day
//   it('Start: Thursday 11:34 8/30, 1 min delay, maxDelay: 20 min. Schedules Thursday 8/30 at 1135', function () {
//     assert.equal(scheduler.getTime("09:00", "18:00", 1535592840, 60000, undefined, undefined, 1200000, 0, 0, "America/New_York"), 1535592900000)
//   })
//   //after late cutoff
//   it('Start: Wednesday 20:35, 10 min delay, maxDelay: 20 min. Schedules Thursday at 09:10', function () {
//     assert.equal(scheduler.getTime("09:00", "18:00", 1536143714, 600000, undefined, undefined, 1200000, 0, 0, "America/New_York"), 1536189014000)
//   })
//   //DAY 0 Weekend - No send on weekends
//   //before day
//   it('Start: Saturday 07:35 9/8, 13 min delay, maxDelay: 1 hour Schedules Monday 9/10 at 9:13', function () {
//     assert.equal(scheduler.getTime("09:00", "18:00", 1536356114, 780000, undefined, undefined, 3600000, 0, 0, "America/New_York"), 1536534780000)
//   })
//   // during day
//   it('Start: Sunday 15:02 9/9, 42 min delay, maxDelay: 1 hour Schedules Monday at 09:42', function () {
//     assert.equal(scheduler.getTime("09:00", "18:00", 1536469320, 2520000, undefined, undefined, 3600000, 0, 0, "America/New_York"), 1536536520000)
//   })
//   // after late cutoff
//   it('Start: Sunday 22:20 9/9, 29 min delay, maxDelay: 1 hour Schedules Monday at 09:29', function () {
//     assert.equal(scheduler.getTime("09:00", "18:00", 1536495600, 1740000, undefined, undefined, 3600000, 0, 0, "America/New_York"), 1536535740000)
//   })
// })
//
// describe('EST - Day 1 - NO weekends', function () {
//   // DAY 1 Weekday - No send on weekends
//   // before day
//   it('Start: Monday 05:29, maxDelay: 1 hour Schedules Tuesday at 15:20', function () {
//     assert.equal(scheduler.getTime("09:00", "18:00", 1536520800, undefined, 20, 15, 3600000, 1, 0, "America/New_York"), 1536643200000)
//   })
//   // during day
//   it('Start: Tuesday 10:45, maxDelay: 1 hour Schedules Wednesday at 11:00', function () {
//     assert.equal(scheduler.getTime("09:00", "18:00", 1536630300, undefined, 00, 11, 3600000, 1, 0, "America/New_York"), 1536714000000)
//   })
//   // after late cutoff
//   it('Start: Wednesday 22:03, maxDelay: 1 hour Schedules Friday at 16:20', function () {
//     assert.equal(scheduler.getTime("09:00", "18:00", 1536753780, undefined, 20, 16, 3600000, 1, 0, "America/New_York"), 1536906000000)
//   })
//   // DAY 1 Weekend - No send on weekends
//   // before day
//   it('Start: Saturday 05:29 9/9, maxDelay: 1 hour Schedules Tuesday 9/11 at 12:23', function () {
//     assert.equal(scheduler.getTime("09:00", "18:00", 1536434940, undefined, 23, 12, 3600000, 1, 0, "America/New_York"), 1536632580000)
//   })
//   // during day
//   it('Start: Saturday 10:45 9/9, maxDelay: 1 hour Schedules Tuesday at 11:00', function () {
//     assert.equal(scheduler.getTime("09:00", "18:00", 1536453900, undefined, 00, 11, 3600000, 1, 0, "America/New_York"), 1536627600000)
//   })
//   // after late cutoff
//   it('Start: Sunday 22:03 9/9, maxDelay: 1 hour Schedules Tuesday at 16:20', function () {
//     assert.equal(scheduler.getTime("09:00", "18:00", 1536494580, undefined, 20, 16, 3600000, 1, 0, "America/New_York"), 1536646800000)
//   })
// })
// describe('EST - Day 2 - NO weekends', function () {
//   // DAY 2 Weekday
//   // before day
//   it('Start: Thursday 05:29 9/10, maxDelay: 1 hour Schedules Monday at 10:22', function () {
//     assert.equal(scheduler.getTime("09:00", "18:00", 1536780540, undefined, 22, 10, 3600000, 2, 0, "America/New_York"), 1537143720000)
//   })
//   // during day
//   it('Start: Tuesday 9/11 10:45 9/11, maxDelay: 1 hour Schedules Thursday 13th at 11:00', function () {
//     assert.equal(scheduler.getTime("09:00", "18:00", 1536626700, undefined, 00, 11, 3600000, 2, 0, "America/New_York"), 1536800400000)
//   })
//   // after late cutoff
//   it('Start: Wednesday 9/12 22:03, maxDelay: 1 hour Schedules Monday 9/17 at 16:20', function () {
//     assert.equal(scheduler.getTime("09:00", "18:00", 1536753780, undefined, 20, 16, 3600000, 2, 0, "America/New_York"), 1537165200000)
//   })
//   // DAY 2 Weekend
//   // before day
//   it('Start: Saturday 9/15 05:29, maxDelay: 1 hour Schedules Wednesday 19th at 12:23', function () {
//     assert.equal(scheduler.getTime("09:00", "18:00", 1536953340, undefined, 23, 12, 3600000, 2, 0, "America/New_York"), 1537323780000)
//   })
//   // during day
//   it('Start: Saturday 9/15 10:45, maxDelay: 1 hour Schedules Wednesday 19th at 11:00', function () {
//     assert.equal(scheduler.getTime("09:00", "18:00", 1536972300, undefined, 00, 11, 3600000, 2, 0, "America/New_York"), 1537318800000)
//   })
//   // after late cutoff
//   it('Start: Sunday 9/16 22:03, maxDelay: 1 hour Schedules Wednesday at 19th 16:20', function () {
//     assert.equal(scheduler.getTime("09:00", "18:00", 1537099380, undefined, 20, 16, 3600000, 2, 0, "America/New_York"), 1537338000000)
//   })
// })
