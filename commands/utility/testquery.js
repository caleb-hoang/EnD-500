const { SlashCommandBuilder } = require('discord.js');
const { MongoClient } = require('mongodb');
const { databaseConnect } = require('../../config.json');

module.exports = {
	data: new SlashCommandBuilder().setName('testquery').setDescription('Tests a MongoDB query!'),
	async execute(interaction) {
        const client = new MongoClient(databaseConnect);
        let reply = null;
        try {
            const database = client.db('sample_mflix');
            const movies = database.collection('movies');

            // Queries for a movie that has a title value of 'Back to the Future'
            const query = { title: 'Back to the Future' };
            const movie = await movies.findOne(query);
            reply = movie.plot;
        } catch (error) {
            console.log(error);
            reply = error;
        } finally {
            await client.close();
        }
		await interaction.reply(reply);
	},
};