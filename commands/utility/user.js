const { SlashCommandBuilder } = require('discord.js');
const { MongoClient } = require('mongodb');
const { databaseConnect } = require('../../config.json');

module.exports = {
	data: new SlashCommandBuilder().setName('user').setDescription('Provides information about the user.'),
	async execute(interaction) {
		const client = new MongoClient(databaseConnect);
		const database = client.db('TA-TA');
        const collection = database.collection("Users")
        const query = {id: interaction.user.id};
		const user_data = await collection.findOne(query);
		if (user_data === null) {
			await interaction.reply('No user information found for user ' + interaction.user.username + "!");
		} else {
        let reply = "Discord Name: " + interaction.user.username;
        
        if ('uid_a' in user_data) {
            reply += "\nUID (Asia): " + user_data.uid_a;
        }

        if ('uid_n' in user_data) {
            reply += "\nUID (NA/EU): " + user_data.uid_n;
        }
        if ('uid_c' in user_data) {
            reply += "\nUID (China): " + user_data.uid_c;
        }
        await interaction.reply(reply);
		}
	},
};
