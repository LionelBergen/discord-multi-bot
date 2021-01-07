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
    this.discordMockClients = [];
  }
  
  login(discordToken, clientTag, channelsList) {
    const self = this;
    this.clientConstructorStub.callsFake(function() {
      const mockDiscordClient = new FakeDiscordClient(discordToken, clientTag, channelsList);
      self.discordMockClients.push(mockDiscordClient);
      return mockDiscordClient;
    }).onCall(this.loginCalls);
    this.loginCalls++;
  }
  
  activateEventError(clientTag) {
    const discordMockClient = this.discordMockClients.find(e => e.user.tag === clientTag);
    discordMockClient.activateEventError();
  }
  
  activateReadyEvent(clientTag) {
    const discordMockClient = this.discordMockClients.find(e => e.user.tag === clientTag);
    discordMockClient.activateReadyEvent();
  }
  
  loginThrowsError(discordToken) {
    this.clientConstructorStub.callsFake(function() {
      return new FakeDiscordClientThrowsErrors(discordToken);
    }).onCall(this.loginCalls);
    this.loginCalls++;
  }
  
  reset() {
    sandbox.resetBehavior();
    sandbox.restore();
    this.resetAllVariables();
  }
}

module.exports = new MockDiscordClient();