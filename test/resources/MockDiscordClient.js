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
  }
  
  login(discordToken) {
    this.clientConstructorStub.callsFake(function() {
      // TODO: keep reference, eg this.loggedInClient = ...
      return new FakeDiscordClient(discordToken);
    }).onCall(this.loginCalls);
    this.loginCalls++;
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