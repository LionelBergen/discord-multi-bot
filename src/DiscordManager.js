const Discord = require('discord.js');
const clients = [];

class DiscordManager {
  initNewDiscordClient(discordToken) {
    return new Promise((resolve, reject) => {
      const client = new Discord.Client();

      client.on('ready', () => {
        console.log(`Client ready, user.tag is: ${client.user.tag}`);
        clients.push({discordClient: client, tag: client.user.tag});
      });
      
      client.login(discordToken).then(function() {
        console.log(`Logged in as ${client.user.tag}`);
        resolve(client.user.tag);
      }).catch(reject);
      
      client.on('error', function(error) {
        console.error('ERRROR from Discord Client: ' + error);
        reject(error);
      });
    });
  }
  
  sendDiscordMessage(botUserTag, channelName, message) {
    const client = findClientByTagName(botUserTag);
    const channelToCommunicateWith = findChannelByName(client.channels, channelName);
    
    if (!channelToCommunicateWith) {
      throw 'Cannot find a channel with name: ' + channelName;
    } else if (!message) {
      throw 'Comment needs to have a value!';
    } else {
      channelToCommunicateWith.send(message);
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