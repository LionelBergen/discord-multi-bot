const Discord = require('discord.js');
const assert = require('assert');
const sinon = require('sinon');

const sandbox = sinon.createSandbox();

class FakeDiscordClient {
  constructor(expectedDiscordToken) {
    this.expectedDiscordToken = expectedDiscordToken;
  }
  
  // tODO: keep reference of 'error' event, and make a function for checking the error is being handled.
  on(nameOfEvent, data) {
    if (nameOfEvent == 'error') {
      this.errorEventFunction = data;
    }
  }
  
  activateEventError() {
    this.errorEventFunction('Testing error');
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
    this.loginCalls = 0;
    this.clientConstructorStub = sandbox.stub(Discord, 'Client');
    this.discordMockClient;
  }
  
  login(discordToken) {
    const self = this;
    this.clientConstructorStub.callsFake(function() {
      self.discordMockClient = new FakeDiscordClient(discordToken);
      return self.discordMockClient;
    }).onCall(this.loginCalls);
    this.loginCalls++;
  }
  
  activateEventError() {
    this.discordMockClient.activateEventError();
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
    this.loginCalls = 0;
    this.clientConstructorStub = sandbox.stub(Discord, 'Client');
  }
}

module.exports = new MockDiscordClient();