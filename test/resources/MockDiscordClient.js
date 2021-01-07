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

// TODO: change name to 'handler'. This handles Discord.js clientS.
// TODO: Maybe change names to 'expectLogic', etc.
/**
 * Handles mock calls to Discord.js
*/
class MockDiscordClientHandler {
  constructor() {
    this.resetAllVariables();
  }
  
  /**
   * This will most likely need to be called in between tests
  */
  resetAllVariables() {
    this.loginCalls = 0;
    this.clientConstructorStub = sandbox.stub(Discord, 'Client');
    this.discordMockClients = [];
  }
  
  /**
   * Mocks out Discord.Client(), making it return a MockClient
   *
   * @param discordToken - DiscordToken of the mock client
   * @param clientTag - User.tag of the mock client
   * @param channelsList - List of channels for the mock client
  */
  expectDiscordNewClientCall(discordToken, clientTag, channelsList) {
    const self = this;
    // Mock out Discord.Client() method
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

module.exports = new MockDiscordClientHandler();