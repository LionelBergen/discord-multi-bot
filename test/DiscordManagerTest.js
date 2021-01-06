const DiscordManager = require('../src/DiscordManager.js');
const Discord = require('discord.js');
const assert = require('assert');
const MockDiscordClient = require('./resources/MockDiscordClient.js');

afterEach(function() {
  MockDiscordClient.reset();
});

describe('Init Discord Client', () => {
  it('Should init 2 new clients', async () => {
    const fakeDiscordToken1 = '$$$$$$$$';
    const fakeDiscordToken2 = '###########';
    MockDiscordClient.login(fakeDiscordToken1);
    
    const newTag1 = await DiscordManager.initNewDiscordClient(fakeDiscordToken1);
    assert.ok(newTag1);
    
    MockDiscordClient.login(fakeDiscordToken2);
    const newTag2 = await DiscordManager.initNewDiscordClient(fakeDiscordToken2);
    assert.ok(newTag2);
  });
  
  it('When Discord init throws error', async () => {
    const fakeDiscordToken1 = '$$$$$$$$';
    MockDiscordClient.loginThrowsError(fakeDiscordToken1);
    
    try {
      DiscordManager.initNewDiscordClient(fakeDiscordToken1);
      assert.fail("Did not throw an error");
    } catch(error) {
      // pass
    }
  });
  
  // Not sure what should happen when errors occur via discord.
  it('When Discord has an error event', async () => {
    MockDiscordClient.login('fakediscordtoken');
    const newTag1 = await DiscordManager.initNewDiscordClient('fakediscordtoken');
    assert.ok(newTag1);
    MockDiscordClient.activateEventError();
  });
});