let DiscordManager = require('../src/DiscordManager.js');
const Discord = require('discord.js');
const assert = require('assert');
const MockDiscordClient = require('./resources/MockDiscordClient.js');

afterEach(function() {
  MockDiscordClient.reset();
  delete require.cache[require.resolve('../src/DiscordManager.js')];
  DiscordManager = require('../src/DiscordManager.js');
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
});

describe('test handling events', () => {
  // Not sure what should happen when errors occur via discord.
  it('When Discord has an error event', async () => {
    MockDiscordClient.login('fakediscordtoken');
    const newTag1 = await DiscordManager.initNewDiscordClient('fakediscordtoken');
    assert.ok(newTag1);
    try {
      MockDiscordClient.activateEventError();
      assert.fail("error should have been thrown...");
    } catch(error) {
      assert.equal("Testing error", error);
    }
  });
  
  it('When Discord has a ready event, add new client', async () => {
    MockDiscordClient.login('fakediscordtoken');
    const newTag1 = await DiscordManager.initNewDiscordClient('fakediscordtoken');
    assert.ok(newTag1);
    MockDiscordClient.activateReadyEvent();
    // can't assert clients, but just ensure no errors occur
  });
});

describe('sendDiscordMessage', () => {
  it('Should send a discord message', async () => {
    const mockDiscordMessage = "hello";
    let wasSendFunctionSent = false;
    
    // login to discord
    MockDiscordClient.login('fakediscordtoken');
    const newTag1 = await DiscordManager.initNewDiscordClient('fakediscordtoken');
    MockDiscordClient.activateReadyEvent();

    // Add a discord channel and ready Discord Client
    MockDiscordClient.addChannel('fakeChannel', function(message) { 
      assert.equal(mockDiscordMessage, message); 
      wasSendFunctionSent = true;
      return Promise.resolve('suceeded');
    });
    
    // Send message to the channel
    const result = await DiscordManager.sendDiscordMessage(newTag1, 'fakeChannel', mockDiscordMessage);
    assert.ok(wasSendFunctionSent);
    assert.equal('suceeded', result);
  });
  
  it('Should throw an error when Discord does', async () => {
    const mockDiscordMessage = "hello";
    MockDiscordClient.login('fakediscordtoken');
    const newTag1 = await DiscordManager.initNewDiscordClient('fakediscordtoken');
    MockDiscordClient.activateReadyEvent();
    MockDiscordClient.addChannel('fakeChannel', function(message) {
      return Promise.reject('Some fake Discord error');
    });
    
    await DiscordManager.sendDiscordMessage(newTag1, 'fakeChannel', mockDiscordMessage)
    .then(function(data) { 
      assert.fail("expected to fail. returned data: " + data);
    })
    .catch(function(error) {
      assert.equal('Some fake Discord error', error);
    });    
  });
  // TODO: Write tests for other paths
});

// TODO: Write tests for logout

