discord-multi-bot
-----------------
Discord.js wrapper - Makes sending messages to single/multiple Discord bots easy  

### Quick start:  
```
const DiscordManager = require('discord-multi-bot');  

const discordTagName = await DiscordSender.initNewDiscordClient(yourSecretDiscordTokenHere);  
DiscordSender.sendDiscordMessage(discordTagName, nameOfDiscordChannelToSendTo, messageYouWantToSendToTheChannel);
```

### Documentation ⭐  