const Discord = require('discord.js');
const assert = require('assert');
const sinon = require('sinon');

const sandbox = sinon.createSandbox();

class FakeDiscordClient {
  constructor(expectedDiscordToken) {
    this.expectedDiscordToken = expectedDiscordToken;
  }
  
  on() {}
  
  login(discordToken) {
    assert.equal(this.expectedDiscordToken, discordToken);
    this.user = {tag: 'user#' + discordToken };
    return Promise.resolve('yolo');
  }
}

class MockDiscordClient {
  constructor() {
    this.loginCalls = 0;
    this.clientConstructorStub = sandbox.stub(Discord, 'Client');
  }
  login(discordToken) {
    this.clientConstructorStub.callsFake(function() {
      return new FakeDiscordClient(discordToken);
    }).onCall(this.loginCalls);
    this.loginCalls++;
  }
}

module.exports = new MockDiscordClient();