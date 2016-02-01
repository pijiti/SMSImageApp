var data = require('../data.json');
console.log('Data from external file');
console.log(data);
module.exports = {
  'Demo test Google' : function (browser) {
    browser
      .url('http://remotevalue.epitome.com.ng/sendcommand.html')
      .waitForElementVisible('body', 1000)
      .setValue('input[id=user]', data.username)
      .setValue('input[id=pass]', data.password)
      .setValue('input[id=event]', data.event)
      .setValue('input[id=params]', data.name)
      .setValue('input[type=station]', data.station_id)
      .waitForElementVisible('button[id=go]', 1000)
      .click('button[id=go]')
      .pause(1000)
      .assert.containsText('#main', 'Night Watch')
      .end();
  }
};