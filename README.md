discord-multi-bot
-----------------
Discord.js wrapper - Makes sending messages to single/multiple Discord bots easy  

### Quick start:  
```
const DiscordManager = require('discord-multi-bot');

async function main() {
	const discordTagName = await DiscordManager.initNewDiscordClient(yourSecretDiscordTokenHere);
	DiscordManager.sendDiscordMessage(discordTagName, nameOfDiscordChannelToSendTo, messageYouWantToSendToTheChannel);
}

main();
```

## Documentation ⭐  
<b>userTag</b> - Discord Assigns this. We use it to differentiate between different discord bots, as this package allows you to manage multiple. You can get it from the return value of `initNewDiscordClient()`   

<b>logoutOfDiscord(userTag)</b>                             - Logs the bot out  

<b>sendDiscordMessage(botUserTag, channelName, message)</b> - Sends a Message to the channel specified  

<b>initNewDiscordClient(discordToken)</b>                   - Initialize and login, a discord bot. Returns the `userTag`