const Discord = require('discord.js');
const assert = require('assert');
const sinon = require('sinon');

const sandbox = sinon.createSandbox();

/**
 * Mock Discord.js Client
*/
class FakeDiscordClient {
  constructor(expectedDiscordToken, tag, channels) {
    this.expectedDiscordToken = expectedDiscordToken;
    this.channels = channels || [];
    this.loginCalled = false;
    this.destroyCalled = false;
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
  
  // This method should not be called in a test, rather we expect it to be called from in the program
  login(discordToken) {
    assert.equal(this.expectedDiscordToken, discordToken);
    // This is normally set by Discord.js sometime before the ready.
    // It needs to be set for the 'login' function to pass
    this.user = {tag: 'user#' + discordToken };
    this.loginCalled = true;
    return Promise.resolve('Mock Client Logged In');
  }
  
  destroy() {
    this.destroyCalled = true;
    return Promise.resolve();
  }
}

/**
 * A Mock Discord Client that will throw an error on the 'login' method
*/
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
  
  // Think of this as a private method. Helps the 'reset' method
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
  }
  
  /**
   * Mocks out Discord.Client(), making it return a MockClient that will throw an error on login
   *
   * @param discordToken - DiscordToken of the mock client
  */
  expectDiscordNewClientCallThatThrowsErrorOnLogin(discordToken) {
    // Mock out Discord.Client() method
    this.clientConstructorStub.callsFake(function() {
      return new FakeDiscordClientThrowsErrors(discordToken);
    });
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
   * Returns true if the login method was called, false otherwise
   *
   * @param clientTag - ClientTag of the DiscordClient
  */
  wasLoginMethodCalled(clientTag) {
    const discordMockClient = this.discordMockClients.find(e => e.user.tag === clientTag);
    return discordMockClient.loginCalled;
  }
  
  /**
   * Returns true if the 'destroy' method was called, false otherwise
   *
   * @param clientTag - ClientTag of the DiscordClient
  */
  wasDestroyMethodCalled(clientTag) {
    const discordMockClient = this.discordMockClients.find(e => e.user.tag === clientTag);
    return discordMockClient.destroyCalled;
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