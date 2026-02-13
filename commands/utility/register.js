const { SlashCommandBuilder } = require('discord.js');
const { MongoClient } = require('mongodb');
const { databaseConnect } = require('../../config.json');

module.exports = {
	data: new SlashCommandBuilder()
    .setName('register')
    .setDescription('Set your Endfield UID and region!')
    .addStringOption((option) => option.setName('region').setDescription('The region your UID is assigned to').setRequired(true).addChoices({name: 'Asia', value: 'asia'}, {name:'NA/EU', value:'naeu'}))
    .addIntegerOption((option) => option.setName('uid').setDescription('Your UID!').setRequired(true).setMaxValue(999999999))
    ,
	async execute(interaction) {
        const client = new MongoClient(databaseConnect);
        const region = interaction.options.getString('region');
        const uid = interaction.options.getInteger('uid');
        let reply = null;
        try {
            const database = client.db('TA-TA');
            const collection = database.collection("Users")
            const query = {id: interaction.user.id};
            let update;
            if (region === "asia") {
                update = {$set: {name: interaction.user.username, uid_a:uid}};
            } else {
                update = {$set: {name: interaction.user.username, uid_n:uid}};
            }
            const options = {upsert: true};
            await collection.updateOne(query, update, options)
        } catch (error) {
            console.log(error);
            reply = error;
        } finally {
            await client.close();
        }
        if (region === 'asia') {
		    await interaction.reply('Registered Asia UID as: ' + uid);
        } else {
            await interaction.reply('Registered NA/EU UID as: ' + uid);
        }
	},
};