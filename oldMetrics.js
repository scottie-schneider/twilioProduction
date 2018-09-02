

function getTwilioCosts() {
  var options = {
     'method' : 'get',
     'contentType': 'application/json'
    };
    var response = UrlFetchApp.fetch('https://sheltered-harbor-86803.herokuapp.com/expenses', options)
    var json = response.getContentText();
    var data = JSON.parse(json);
    Logger.log(data);
     // clear any previous content
    sheet.getRange("J3").clearContent();
    sheet.getRange("J5").clearContent();
    // paste in the values
    sheet.getRange("J3").setValue(data["lastMonth"]);
    sheet.getRange("J5").setValue(data["thisMonth"]);
}

function getUpcomingStripe() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getActiveSheet();
  var options = {
     'method' : 'get',
     'contentType': 'application/json'
    };
    var response = UrlFetchApp.fetch('https://sheltered-harbor-86803.herokuapp.com/upcoming', options)
    var json = response.getContentText();
    var data = JSON.parse(json);
    Logger.log(data);
    // get the remainder we'll collect this month
    var totalToCollect = data["totalInvoiceThisMonth"];
    // get the failed invoices, bad customers!
    var badCustomers = data["totalOpenInvoices"]
    // get the total reclaimable
    var reclaimable = data["totalReclaimable"];
    // get the by day invoice object
    var byDayInvoiceObject = data["invoiceObj"]
     // clear any previous content
    sheet.getRange("I3").clearContent();
    sheet.getRange("I5").clearContent();
    sheet.getRange("I7").clearContent();
    // paste in the values
    sheet.getRange("I3").setValue(totalToCollect);
    sheet.getRange("I5").setValue(badCustomers);
    sheet.getRange("I7").setValue(reclaimable);
    
}

function calculateChurn(month, churn){
  for (var num in churn) {
    if(num < month){
      // add users active to churn[month][0]
      churn[month][2] += churn[num][0]
    }
  }
}

function displayChurn(churn){
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getActiveSheet();
  
  Logger.log('starting churn');
  var churnArray = [];
  for(var month in churn){
    var totalUsers = churn[month][0] + churn[month][2]
    var churnNumber = churn[month][1]
    var churnPercentage = churnNumber/totalUsers
    churnArray.push([month, churnPercentage*100])
  }
  Logger.log(churnArray);
  var len = churnArray.length;
  churnArray = churnArray.sort(function(a,b){
  if(a[0] < b[0]){
    return -1;
  }else if(a[0] > b[0]){
    return 1;
  }
    return 0;
  })
  var month = [];
  var churnPercentage = [];
  for(var i = 0; i < len; i++){
    month.push([churnArray[i][0]])
    churnPercentage.push([churnArray[i][1]])
  }
   // clear any previous content
  sheet.getRange(2,5,500,1).clearContent();
  sheet.getRange(2,6,500,1).clearContent();
  // paste in the values
  sheet.getRange(2,5,len,1).setValues(month);
  sheet.getRange(2,6,len,1).setValues(churnPercentage);
}

function getCancelledUsers(){
  var totalResults = [];
  do{
    var options = {
     'method' : 'get',
     'contentType': 'application/json'
    };
    var response = UrlFetchApp.fetch('https://followupedge.com/api/1.1/obj/user?api_token=98107ac3b7b363d93f1b9e3863b79bee&constraints=%5B%7B%0A%20%20%20%20%20%20%20%20%22key%22%3A%20%22cancelled%20(yes%20or%20no)%22%2C%0A%20%20%20%20%20%20%20%20%22constraint_type%22%3A%20%22equals%22%2C%0A%20%20%20%20%20%20%20%20%22value%22%3A%20%22yes%22%0A%20%20%20%20%7D%5D', options)
    //var json = response.getContentText();
    //var data = JSON.parse(json);
    Logger.clear();
    Logger.log(data)
    //for(var i = 0; i < data["response"]["results"].length; i++){
      //totalResults.push(data["response"]["results"][i])
    //}
  }
  while(data["response"]["remaining"] != 0);

  //Logger.log(data["response"]["remaining"])
  //Logger.clear();
  //Logger.log(totalResults.length)
  return totalResults;
}

// checked, functions 8/27
function getActiveUsers(){
  var totalResults = [];
  cursor=0;
  do{
    var options = {
     'method' : 'get',
     'contentType': 'application/json'
    };
    var url = 'https://followupedge.com/api/1.1/obj/user?api_token=98107ac3b7b363d93f1b9e3863b79bee&cursor='+ cursor + '&constraints=%5B%0A%20%20%7B%0A%20%20%20%20%20%20%20%20%22key%22%3A%20%22isViewer%22%2C%0A%20%20%20%20%20%20%20%20%22constraint_type%22%3A%20%22not%20equal%22%2C%0A%20%20%20%20%20%20%20%20%22value%22%3A%20%22yes%22%0A%20%20%7D%2C%0A%20%20%7B%0A%20%20%20%20%20%20%20%20%22key%22%3A%20%22agency_non_paying%20(yes%20or%20no)%22%2C%0A%20%20%20%20%20%20%20%20%22constraint_type%22%3A%20%22not%20equal%22%2C%0A%20%20%20%20%20%20%20%20%22value%22%3A%20%22yes%22%0A%20%20%7D%2C%0A%20%20%7B%0A%20%20%20%20%20%20%20%20%22key%22%3A%20%22no_charge%22%2C%0A%20%20%20%20%20%20%20%20%22constraint_type%22%3A%20%22not%20equal%22%2C%0A%20%20%20%20%20%20%20%20%22value%22%3A%20%22yes%22%0A%20%20%7D%2C%0A%20%20%7B%0A%20%20%20%20%20%20%20%20%22key%22%3A%20%22cancelled%20(yes%20or%20no)%22%2C%0A%20%20%20%20%20%20%20%20%22constraint_type%22%3A%20%22not%20equal%22%2C%0A%20%20%20%20%20%20%20%20%22value%22%3A%20%22yes%22%0A%20%20%7D%0A%5D'
    var response = UrlFetchApp.fetch(url, options)
    var json = response.getContentText();
    var data = JSON.parse(json);
    for(var i = 0; i < data["response"]["results"].length; i++){
      totalResults.push(data["response"]["results"][i])
    }
    cursor+=data["response"]["count"]
  }
  while(data["response"]["remaining"] != 0);

  Logger.log(totalResults)
  return totalResults;
}


function getStats() {
  getTwilioCosts();
  getUpcomingStripe();
  var churn = {};
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getActiveSheet();
  
  var users = getCancelledUsers();
  var emails = [];
  var cancelDate = [];

  users.forEach(function(elem){
    ////////////////////////////////////////////////////////
    // Extract all the emails into an array
    ////////////////////////////////////////////////////////
    emails.push([elem["authentication"]["email"]["email"]]);
    ////////////////////////////////////////////////////////
    // Determine when the user cancelled, if applicable
    ////////////////////////////////////////////////////////
    if(elem["cancelled_date"] != null) {
      var d = new Date(elem["cancelled_date"]);
      var month = d.getMonth();
      // for that month increment the key with that value + 1
      // push that month
      if(churn.hasOwnProperty(month+1)){
        churn[month+1][1]++
      }else{
        churn[month+1] = [0,1,0]
      }
      cancelDate.push([month+1]);
    } else {
      cancelDate.push(["UPDATE DATE"])
    }
  });
  // User Count (total)
  var lenUsers = cancelDate.length;
  
  // clear any previous content
  sheet.getRange(2,1,500,1).clearContent();
  sheet.getRange(2,2,500,1).clearContent();
  
  // paste in the values
  sheet.getRange(2,1,lenUsers,1).setValues(emails);
  sheet.getRange(2,2,lenUsers,1).setValues(cancelDate);
  
  var newChurn = getUsersByMonth(churn);
  // object 1 stays as it is, so it doesn't get used to iterate
  for(var month in newChurn){
    calculateChurn(month, newChurn)
  }
  displayChurn(churn);
}

function getUsersByMonth(churn) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getActiveSheet();
  
  var users = getActiveUsers();
  var emails = [];
  var createdDates = [];

  //Logger.log(users.response)
  //Logger.log(data["response"]["users"]);
  users.forEach(function(elem){
    ////////////////////////////////////////////////////////
    // Extract all the emails into an array
    ////////////////////////////////////////////////////////
    emails.push([elem["authentication"]["email"]["email"]]);
    ////////////////////////////////////////////////////////
    // Determine when the user cancelled, if applicable
    ////////////////////////////////////////////////////////
    
      var d = new Date(elem["Created Date"]);
      var month = d.getMonth();
      // take the UTM date and make it into a month
      if(churn.hasOwnProperty(month+1)){
        churn[month+1][0]++
      }else{
        churn[month+1] = [1,0,0]
      }
      // push that month
      createdDates.push([month+1]);

  });
  // User Count (total)
  var len = createdDates.length;
  // clear any previous content
  sheet.getRange(2,3,500,1).clearContent();
  sheet.getRange(2,4,500,1).clearContent();
  // paste in the values
  sheet.getRange(2,3,len,1).setValues(emails);
  sheet.getRange(2,4,len,1).setValues(createdDates);
  Logger.log(churn);
  return churn;
  // calculate and spit out churn

}
