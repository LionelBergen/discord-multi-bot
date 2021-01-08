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
    MockDiscordClient.expectDiscordNewClientCall(fakeDiscordToken1);
    
    const newTag1 = await DiscordManager.initNewDiscordClient(fakeDiscordToken1);
    assert.ok(newTag1);
    assert.ok(MockDiscordClient.wasLoginMethodCalled(newTag1));
    
    MockDiscordClient.expectDiscordNewClientCall(fakeDiscordToken2);
    const newTag2 = await DiscordManager.initNewDiscordClient(fakeDiscordToken2);
    assert.ok(newTag2);
    assert.ok(MockDiscordClient.wasLoginMethodCalled(newTag2));
  });
  
  it('When Discord init throws error', async () => {
    const fakeDiscordToken1 = '$$$$$$$$';
    MockDiscordClient.expectDiscordNewClientCallThatThrowsErrorOnLogin(fakeDiscordToken1);
    
    try {
      DiscordManager.initNewDiscordClient(fakeDiscordToken1);
      assert.fail("Did not throw an error");
    } catch(error) {
      // pass
    }
  });
});

describe('test handling events', () => {
  it('When Discord has an error event', async () => {
    MockDiscordClient.expectDiscordNewClientCall('fakediscordtoken');
    const newTag1 = await DiscordManager.initNewDiscordClient('fakediscordtoken');
    assert.ok(newTag1);
    try {
      MockDiscordClient.activateEventError(newTag1);
      assert.fail("error should have been thrown...");
    } catch(error) {
      assert.equal("Testing error", error);
    }
  });
  
  it('When Discord has a ready event, add new client', async () => {
    MockDiscordClient.expectDiscordNewClientCall('fakediscordtoken');
    const newTag1 = await DiscordManager.initNewDiscordClient('fakediscordtoken');
    assert.ok(newTag1);
    MockDiscordClient.activateReadyEvent(newTag1);
    // We can't assert the client was added, so do nothing
  });
});

describe('sendDiscordMessage', () => {
  it('Should send a discord message', async () => {
    const mockDiscordMessage = "hello";
    
    // login to discord
    MockDiscordClient.expectDiscordNewClientCall('fakediscordtoken', undefined, [{name: 'fakeChannel', send: createFakeSendFunction()}]);
    const newTag1 = await DiscordManager.initNewDiscordClient('fakediscordtoken');

    // Send mock ready event
    MockDiscordClient.activateReadyEvent(newTag1);
    
    // Send message to the channel
    let result = await DiscordManager.sendDiscordMessage(newTag1, 'fakeChannel', mockDiscordMessage);
    assert.equal('suceeded', result);
    
    // Send another message, for good measure
    result = await DiscordManager.sendDiscordMessage(newTag1, 'fakeChannel', 'some other message');
    assert.equal('suceeded', result);
  });

  it('Should send a discord message, two different clients', async () => {
    const mockDiscordMessageForClient1 = "hello";
    const mockDiscordMessageForClient2 = "gfldhjgfldkjgfldkjgfdkljfg";
    
    MockDiscordClient.expectDiscordNewClientCall('fakediscordtoken1', undefined, [{name: 'fakeChannel1', send: createFakeSendFunction(mockDiscordMessageForClient1)}]);
    const newTag1 = await DiscordManager.initNewDiscordClient('fakediscordtoken1');
    
    MockDiscordClient.expectDiscordNewClientCall('fakediscordtoken2', undefined, [{name: 'fakeChannel2', send: createFakeSendFunction(mockDiscordMessageForClient2)}]);
    const newTag2 = await DiscordManager.initNewDiscordClient('fakediscordtoken2');

    MockDiscordClient.activateReadyEvent(newTag1);
    MockDiscordClient.activateReadyEvent(newTag2);
    
    let result = await DiscordManager.sendDiscordMessage(newTag1, 'fakeChannel1', mockDiscordMessageForClient1);
    assert.equal('suceeded', result);
    
    result = await DiscordManager.sendDiscordMessage(newTag2, 'fakeChannel2', mockDiscordMessageForClient2);
    assert.equal('suceeded', result);
  });

  it('Should throw an error when Discord does (send function)', async () => {
    const mockDiscordMessage = "hello";
    const mockError = 'Some fake discord error';
    MockDiscordClient.expectDiscordNewClientCall('fakediscordtoken', undefined, [{name: 'fakeChannel', send: createFakeSendFunctionThrowsErrorOnFirstSend(mockError)}]);
    const newTag1 = await DiscordManager.initNewDiscordClient('fakediscordtoken');
    MockDiscordClient.activateReadyEvent(newTag1);
    
    await DiscordManager.sendDiscordMessage(newTag1, 'fakeChannel', mockDiscordMessage)
    .then(function(data) { 
      assert.fail("expected to fail. returned data: " + data);
    })
    .catch(function(error) {
      assert.equal(mockError, error);
    });

    // ensure client can still send data
    assert.ok(DiscordManager.sendDiscordMessage(newTag1, 'fakeChannel', 'some message'));
  });

  it('Should throw an error when channel cannot be found', async () => {
    const mockDiscordMessage = "hello";
    MockDiscordClient.expectDiscordNewClientCall('fakediscordtoken', undefined, [{name: 'fakeChannel', send: createFakeSendFunction(mockDiscordMessage)}]);
    const newTag1 = await DiscordManager.initNewDiscordClient('fakediscordtoken');
    MockDiscordClient.activateReadyEvent(newTag1);
    
    try {
      await DiscordManager.sendDiscordMessage(newTag1, 'nonExistentChannel', mockDiscordMessage);
      fail("expected to throw an error..");
    } catch(error) {
      assert.equal("Cannot find a channel with name: nonExistentChannel", error);
    }
  });

  it('Should throw an error when client cannot be found', async () => {
    const mockDiscordMessage = "hello";
    MockDiscordClient.expectDiscordNewClientCall('fakediscordtoken', undefined, [{name: 'fakeChannel', send: createFakeSendFunction(mockDiscordMessage)}]);
    const newTag1 = await DiscordManager.initNewDiscordClient('fakediscordtoken');
    MockDiscordClient.activateReadyEvent(newTag1);
    
    try {
      await DiscordManager.sendDiscordMessage('nonExistedTag', 'fakeChannel', mockDiscordMessage);
      fail("expected to throw an error..");
    } catch(error) {
      assert.equal("Cannot find client matching tag: nonExistedTag", error);
    }
  });

  it('Should throw an error when channel cannot be found', async () => {
    const mockDiscordMessage = "hello";
    MockDiscordClient.expectDiscordNewClientCall('fakediscordtoken', undefined, [{name: 'fakeChannel', send: createFakeSendFunction(mockDiscordMessage)}]);
    const newTag1 = await DiscordManager.initNewDiscordClient('fakediscordtoken');
    MockDiscordClient.activateReadyEvent(newTag1);
    
    try {
      await DiscordManager.sendDiscordMessage(newTag1, 'nonExistentChannel', mockDiscordMessage);
      fail("expected to throw an error..");
    } catch(error) {
      assert.equal("Cannot find a channel with name: nonExistentChannel", error);
    }
  });
  
  it('Should throw an error when message is 2,000 characters long', async () => {
    const mockDiscordMessage = 'hello really long message hello really long messagehello really long messagehello really long messagehello really long messagehello really long messagehello really long messagehello really long message hello really long messagehello really long messagehello really long messagehello really long messagehello really long messagehello really long messagehello really long message hello really long messagehello really long messagehello really long messagehello really long messagehello really long messagehello really long messagehello really long message hello really long messagehello really long messagehello really long messagehello really long messagehello really long messagehello really long messagehello really long message hello really long messagehello really long messagehello really long messagehello really long messagehello really long messagehello really long messagehello really long message hello really long messagehello really long messagehello really long messagehello really long messagehello really long messagehello really long messagehello really long message hello really long messagehello really long messagehello really long messagehello really long messagehello really long messagehello really long messagehello really long message hello really long messagehello really long messagehello really long messagehello really long messagehello really long messagehello really long messagehello really long message hello really long messagehello really long messagehello really long messagehello really long messagehello really long messagehello really long messagehello really long message hello really long messagehello really long messagehello really long messagehello really long messagehello really long messagehello really long messagehello really long message hello really long messagehello really long messagehello really long messagehello really long messagehello really long messagehello really long messagehello really long message hello really long messagehello really long messagehello really long messagehello really long messagehello really long messagehello really long message';
    MockDiscordClient.expectDiscordNewClientCall('fakediscordtoken', undefined, [{name: 'fakeChannel', send: createFakeSendFunction(mockDiscordMessage)}]);
    const newTag1 = await DiscordManager.initNewDiscordClient('fakediscordtoken');
    MockDiscordClient.activateReadyEvent(newTag1);
    
    try {
      await DiscordManager.sendDiscordMessage(newTag1, 'fakeChannel', mockDiscordMessage);
      fail("expected to throw an error..");
    } catch(error) {
      assert.equal("Message cannot be 2000 characters long!", error);
    }
  });
});

describe('LogoutOfDiscord', () => {
  it('should logout, multiple clients test',  async () => {
    MockDiscordClient.expectDiscordNewClientCall('fakediscordtoken1');
    const newTag1 = await DiscordManager.initNewDiscordClient('fakediscordtoken1');
    MockDiscordClient.activateReadyEvent(newTag1);
    
    MockDiscordClient.expectDiscordNewClientCall('fakediscordtoken2');
    const newTag2 = await DiscordManager.initNewDiscordClient('fakediscordtoken2');
    MockDiscordClient.activateReadyEvent(newTag2);
    
    assert.ok(DiscordManager.logoutOfDiscord(newTag1));
    assert.ok(MockDiscordClient.wasDestroyMethodCalled(newTag1));
    assert.ok(DiscordManager.logoutOfDiscord(newTag2));
    assert.ok(MockDiscordClient.wasDestroyMethodCalled(newTag2));
  });
});

describe('Clients should not interfere with eachother', () => {
  it('One client fails or logs out, other should stay alive and well', async () => {
    MockDiscordClient.expectDiscordNewClientCall('fakediscordtoken1', undefined, [{name: 'fakeChannel1', send: createFakeSendFunction()}]);
    const newTag1 = await DiscordManager.initNewDiscordClient('fakediscordtoken1');
    
    MockDiscordClient.expectDiscordNewClientCall('fakediscordtoken2', undefined, [{name: 'fakeChannel2', send: createFakeSendFunction()}]);
    const newTag2 = await DiscordManager.initNewDiscordClient('fakediscordtoken2');

    MockDiscordClient.activateReadyEvent(newTag1);
    MockDiscordClient.activateReadyEvent(newTag2);
    
    assert.equal('suceeded', await DiscordManager.sendDiscordMessage(newTag1, 'fakeChannel1', 'hello from client1'));
    assert.equal('suceeded', await DiscordManager.sendDiscordMessage(newTag2, 'fakeChannel2', 'hello from client2'));
    
    try {
      // Force first client to error
      MockDiscordClient.activateEventError(newTag1);
      assert.fail("error was supposed to be thrown!");
    } catch(err) {
      // Ensure it's the error from the mock, not an assert.fail error
      assert.equal('Testing error', err);
    };
    
    // non-failing client should still be able to send messages
    assert.equal('suceeded', await DiscordManager.sendDiscordMessage(newTag2, 'fakeChannel2', 'hello from client2...'));
    assert.equal('suceeded', await DiscordManager.sendDiscordMessage(newTag2, 'fakeChannel2', 'hello from client2....'));
    
    // Throw another client into the mix
    MockDiscordClient.expectDiscordNewClientCall('fakediscordtoken3', undefined, [{name: 'fakeChannel3', send: createFakeSendFunction()}]);
    const newTag3 = await DiscordManager.initNewDiscordClient('fakediscordtoken3');
    MockDiscordClient.activateReadyEvent(newTag3);
    assert.equal('suceeded', await DiscordManager.sendDiscordMessage(newTag3, 'fakeChannel3', 'hello from client3....'));
    
    // Logout of the first client
    await DiscordManager.logoutOfDiscord(newTag1);
    
    // Last logged in client unaffected
    assert.equal('suceeded', await DiscordManager.sendDiscordMessage(newTag3, 'fakeChannel3', 'hello from client3....'));
  });
});

function createFakeSendFunctionThrowsErrorOnFirstSend(errorToThrow) {
  let i = 0;
  return function(message) {
    i++;
    return i==1 ? Promise.reject(errorToThrow) : Promise.resolve();
  };
}

function createFakeSendFunction(mockDiscordMessage) {
  return function(message) {
    if (mockDiscordMessage) {
      assert.equal(mockDiscordMessage, message);
    }
    return Promise.resolve('suceeded');
  };
}











