const { SlashCommandBuilder } = require('discord.js');
const { MongoClient } = require('mongodb');
const { databaseConnect } = require('../../config.json');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('blueprint')
    .setDescription('Submit a blueprint code for a region')
    .addStringOption((option) =>
      option.setName('name').setDescription('Name of the blueprint').setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName('region')
        .setDescription('The region your blueprint is valid for')
        .setRequired(true)
        .addChoices({ name: 'Asia', value: 'asia' }, { name: 'NA/EU', value: 'naeu' })
    )
    .addStringOption((option) =>
      option.setName('code').setDescription('Alphanumeric blueprint code (20-25 chars)').setRequired(true)
    ),
  async execute(interaction) {
    const client = new MongoClient(databaseConnect);
    const region = interaction.options.getString('region');
    const code = interaction.options.getString('code');
    const name = interaction.options.getString('name');

    // Validate code: 20-25 alphanumeric
    const alnumRegex = /^[A-Za-z0-9]{20,25}$/;
    if (!alnumRegex.test(code)) {
      await interaction.reply('Blueprint code must be 20-25 alphanumeric characters.');
      await client.close();
      return;
    }

    let exists = false;
    try {
      const database = client.db('TA-TA');
      const collection = database.collection('Blueprints');
      const query = { id: interaction.user.id, blueprint_name: name };
      const existing = await collection.findOne(query);
      if (existing) {
        exists = true;
      } else {
        const doc = {
          id: interaction.user.id,
          name: interaction.user.username,
          blueprint_name: name,
          code: code,
          region: region,
          score: 0
        };
        await collection.insertOne(doc);
      }
    } catch (error) {
      console.log(error);
    } finally {
      await client.close();
    }

    const regionDisplay = region === 'asia' ? 'Asia' : 'NA/EU';
    if (exists) {
      await interaction.reply(`Blueprint '${name}' already exists for region ${regionDisplay}.`);
    } else {
      await interaction.reply(`Blueprint '${name}' submitted for region ${regionDisplay} with code: ${code}`);
    }
  },
};
