const DiscordManager = require('../src/DiscordManager.js');
const assert = require('assert');

describe('Init Discord Client', () => {
  it('Should init new client', () => {
    const newTag = DiscordManager.initNewDiscordClient('######');
  });
});