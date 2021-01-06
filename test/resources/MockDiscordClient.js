const Discord = require('discord.js');
const assert = require('assert');
const sinon = require('sinon');

const sandbox = sinon.createSandbox();

class FakeDiscordClient {
  constructor(expectedDiscordToken, tag) {
    this.expectedDiscordToken = expectedDiscordToken;
    this.channels = [];
    this.user = {tag: (tag || 'mockUserTag') };
  }
  
  on(nameOfEvent, data) {
    if (nameOfEvent == 'error') {
      this.errorEventFunction = data;
    } else if (nameOfEvent == 'ready') {
      this.readyEvent = data;
    }
  }
  
  activateEventError() {
    this.errorEventFunction('Testing error');
  }
  
  activateReadyEvent() {
    this.readyEvent('ready');
  }
  
  login(discordToken) {
    assert.equal(this.expectedDiscordToken, discordToken);
    this.user = {tag: 'user#' + discordToken };
    return Promise.resolve('yolo');
  }
}

class FakeDiscordClientThrowsErrors extends FakeDiscordClient {
  login() {
    return Promise.reject('ERROR!');
  }
}

class MockDiscordClient {
  constructor() {
    this.resetAllVariables();
  }
  
  // TODO: uninitialized confusion
  resetAllVariables() {
    this.loginCalls = 0;
    this.clientConstructorStub = sandbox.stub(Discord, 'Client');
    this.discordMockClient;
    // Client() method called but not run yet
    this.discordMockClientUninitialized;
  }
  
  login(discordToken, clientTag) {
    const self = this;
    this.clientConstructorStub.callsFake(function() {
      self.discordMockClientUninitialized = new FakeDiscordClient(discordToken, clientTag);
      return self.discordMockClientUninitialized;
    }).onCall(this.loginCalls);
    this.loginCalls++;
  }
  
  activateEventError() {
    this.discordMockClientUninitialized.activateEventError();
  }
  
  activateReadyEvent() {
    this.discordMockClientUninitialized.activateReadyEvent();
    this.discordMockClient = this.discordMockClientUninitialized;
  }
  
  loginThrowsError(discordToken) {
    this.clientConstructorStub.callsFake(function() {
      return new FakeDiscordClientThrowsErrors(discordToken);
    }).onCall(this.loginCalls);
    this.loginCalls++;
  }
  
  addChannel(channelName, channelSendFunction) {
    this.discordMockClient.channels.push({name: channelName, send: channelSendFunction});
  }
  
  reset() {
    sandbox.resetBehavior();
    sandbox.restore();
    this.resetAllVariables();
  }
}

module.exports = new MockDiscordClient();