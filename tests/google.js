module.exports = {
  'Demo test Google' : function (browser) {
    browser
      .url('http://remotevalue.epitome.com.ng/sendcommand.html')
      .waitForElementVisible('body', 1000)
      .setValue('input[id=user]', 'umer')
      .setValue('input[id=pass]', '1234')
      .setValue('input[id=station]' , '74')
      .setValue('input[id=event]' , 'incoming_messages')
      .setValue('input[id=params]' , '74')
      .waitForElementVisible('button[name=btnG]', 1000)
      .click('button[id=go]')
      .pause(1000)
      .assert.containsText('#main', 'Night Watch')
      .end();
  }
};