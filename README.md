# E&D-500
A Discord bot that allows players to submit their UID, AIC blueprints, and personal Elastic Goods prices to optimize Stock Distribution in the game "Arknights: Endfield." Currently includes funcionality for UID registration.

## TO RUN:

Create a Discord Developer profile at the [Discord Developer Portal](https://discord.com/developers), and create a new application.

Invite and add the application to a Discord server of choice.

Create a file named "config.json" in the main directory with three entries: token (obtained from the "bot" section of the developer portal), clientId (from the generational information section of the portal), guildId (a Discord server's unique identifier, obtained by activating developer mode), and databaseConnect (A MongoDB Atlas' connection string, including a user password.) 

Run `npm install`.

To activate the bot, run `node index.js`

The bot is now active, and users can now run commands via the chat box.

## CHAT COMMANDS

### User
- Returns the user's name and registered UIDs in all regions they have registered.

### Register
- Requires user to submit the region of choice (NA/EU, Asia, China) and their corresponding UID.
- Attaches the user's UID to their Discord account for ease of access using /user

### Blueprint
- Requires user to submit the region of choice (NA/EU, Asia, China), the name of the blueprint, and the corresponding blueprint code.
- Posts the blueprint, and makes it searchable by all users.

### Search
- Requires user to submit the region of choice (NA/EU, Asia, China), and the name of the blueprint.
- Returns a single blueprint with the closest name to the search query.