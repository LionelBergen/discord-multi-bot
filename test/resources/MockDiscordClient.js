const Discord = require('discord.js');
const assert = require('assert');
const sinon = require('sinon');

const sandbox = sinon.createSandbox();

class FakeDiscordClient {
  constructor(expectedDiscordToken, tag, channels) {
    this.expectedDiscordToken = expectedDiscordToken;
    this.channels = channels || [];
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
  
  resetAllVariables() {
    this.loginCalls = 0;
    this.clientConstructorStub = sandbox.stub(Discord, 'Client');
    this.discordMockClient;
    this.channelsOfDiscordClient = [];
  }
  
  login(discordToken, clientTag) {
    const self = this;
    this.clientConstructorStub.callsFake(function() {
      self.discordMockClient = new FakeDiscordClient(discordToken, clientTag, self.channelsOfDiscordClient);
      return self.discordMockClient;
    }).onCall(this.loginCalls);
    this.loginCalls++;
  }
  
  activateEventError() {
    this.discordMockClient.activateEventError();
  }
  
  activateReadyEvent() {
    this.discordMockClient.activateReadyEvent();
    this.discordMockClient = this.discordMockClient;
  }
  
  loginThrowsError(discordToken) {
    this.clientConstructorStub.callsFake(function() {
      return new FakeDiscordClientThrowsErrors(discordToken);
    }).onCall(this.loginCalls);
    this.loginCalls++;
  }
  
  addChannel(channelName, channelSendFunction) {
    this.channelsOfDiscordClient.push({name: channelName, send: channelSendFunction});
  }
  
  reset() {
    sandbox.resetBehavior();
    sandbox.restore();
    this.resetAllVariables();
  }
}

module.exports = new MockDiscordClient();