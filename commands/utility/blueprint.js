const { SlashCommandBuilder } = require('discord.js');
const { MongoClient } = require('mongodb');
const { databaseConnect } = require('../../config.json');

// Simple input sanitizers to protect MongoDB interactions
function sanitizeString(s) {
  if (typeof s !== 'string') return '';
  return s.trim().replace(/\$/g, '').replace(/\0/g, '');
}

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
        .addChoices({ name: 'Asia', value: 'asia' }, { name: 'China', value: 'china' }, { name: 'NA/EU', value: 'naeu' })
    )
    .addStringOption((option) =>
      option.setName('code').setDescription('Alphanumeric blueprint code (20-25 chars)').setRequired(true)
    ),
  async execute(interaction) {
    const client = new MongoClient(databaseConnect);
    const regionRaw = interaction.options.getString('region');
    const codeRaw = interaction.options.getString('code');
    const nameRaw = interaction.options.getString('name');
    const region = sanitizeString(regionRaw);
    const code = (codeRaw || '').trim().replace(/\s+/g, '');
    const name = sanitizeString(nameRaw);

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
      // Check existence by code exclusively within the same region
      const existing = await collection.findOne({ code: code , region: region});
      if (existing) {
        exists = true;
      } else {
        const doc = {
          id: interaction.user.id,
          name: interaction.user.username,
          blueprint_name: name,
          code: code,
          region: region
        };
        await collection.insertOne(doc);
      }
    } catch (error) {
      console.log(error);
    } finally {
      await client.close();
    }

      const regionDisplay = region === 'asia' ? 'Asia' : region === 'china' ? 'China' : 'NA/EU';
    if (exists) {
      await interaction.reply(`Blueprint with code '${code}' already exists in region ${regionDisplay}.`);
    } else {
      await interaction.reply(`Blueprint '${name}' submitted for region ${regionDisplay} with code: ${code}`);
    }
  },
};
