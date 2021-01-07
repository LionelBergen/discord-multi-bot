const Discord = require('discord.js');
const assert = require('assert');
const sinon = require('sinon');

const sandbox = sinon.createSandbox();

class FakeDiscordClient {
  constructor(expectedDiscordToken, tag, channels) {
    this.expectedDiscordToken = expectedDiscordToken;
    this.channels = channels || [];
    this.errorEventFunction;
    this.readyEvent;
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
    // This is normally set by Discord.js sometime before the ready.
    // It needs to be set for the 'login' function to pass
    this.user = {tag: 'user#' + discordToken };
    return Promise.resolve('Mock Client Logged In');
  }
  
  destroy() {
    return Promise.resolve();
  }
}

class FakeDiscordClientThrowsErrors extends FakeDiscordClient {
  login() {
    return Promise.reject('ERROR!');
  }
}

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
   * Mock client will have a Login method that asserts the DiscordToken
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
    });
    this.loginCalls++;
  }
  
  /**
   * Mocks out Discord.Client(), making it return a MockClient that will throw an error on login
   *
   * @param discordToken - DiscordToken of the mock client
  */
  expectDiscordNewClientCallThatThrowsErrorOnLogin(discordToken) {
    this.clientConstructorStub.callsFake(function() {
      return new FakeDiscordClientThrowsErrors(discordToken);
    });
    this.loginCalls++;
  }
  
  /**
   * Invokes the 'eventError' of the mock client.
   * Used to ensure the class being tested is handling the event error
   *
   * @param clientTag - ClientTag of the DiscordClient to activate eventError on
  */
  activateEventError(clientTag) {
    const discordMockClient = this.discordMockClients.find(e => e.user.tag === clientTag);
    discordMockClient.activateEventError();
  }
  
  /**
   * Invokes the 'eventError' of the mock client.
   * Used to ensure the class being tested is handling the event error
   *
   * @param clientTag - ClientTag of the DiscordClient to activate eventError on
  */
  activateReadyEvent(clientTag) {
    const discordMockClient = this.discordMockClients.find(e => e.user.tag === clientTag);
    discordMockClient.activateReadyEvent();
  }
  
  /**
   * Should be called between tests.
   * Resets Sinon objects and this class's variables
  */
  reset() {
    sandbox.resetBehavior();
    sandbox.restore();
    this.resetAllVariables();
  }
}

module.exports = new MockDiscordClientHandler();