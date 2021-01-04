const Discord = require('discord.js');
const clients = [];

class DiscordManager {
  initNewDiscordClient(discordToken) {
    return new Promise((resolve) => {
      const client = new Discord.Client();

      client.on('ready', () => {
        console.log(`Client ready, user.tag is: ${client.user.tag}`);
        clients.push({discordClient: client, tag: client.user.tag});
      });
      
      client.login(discordToken).then(function() {
        console.log(`Logged in as ${client.user.tag}`);
        resolve(client.user.tag);
      });
    });
  }
  
  sendDiscordMessage(botUserTag, channelName, redditComment) {
    const client = findClientByTagName(botUserTag);
    const channelToCommunicateWith = findChannelByName(client.channels, channelName);
    
    if (!channelToCommunicateWith) {
      throw 'ChannelToComminicateWith is null!!';
    } else if (!redditComment || !redditComment.body || !redditComment.permalink) {
      throw 'Comment not well formed!';
    } else {
      channelToCommunicateWith.send(`Comment: ${redditComment.body}\r\nlink: https://reddit.com${redditComment.permalink}`);
    }
  }

  logoutOfDiscord(usertag) {
    return findClientByTagName(usertag).destroy();
  }
}

function findClientByTagName(usertag) {
  const clientMatchingTag = clients.find(e => e.tag == usertag);
  if (!clientMatchingTag) {
    throw 'Cannot find client matching tag: ' + usertag;
  }
  
  return clientMatchingTag.discordClient;
}

function findChannelByName(listOfChannels, channelName) {
  return listOfChannels.find(channel => channel.name == channelName);
}

module.exports = new DiscordManager();