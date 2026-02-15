const { SlashCommandBuilder } = require('discord.js');
const { MongoClient } = require('mongodb');
const { databaseConnect } = require('../../config.json');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('search')
    .setDescription('Search for a blueprint by name')
    .addStringOption((option) =>
      option.setName('name').setDescription('Blueprint name to search for').setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName('region')
        .setDescription('Region to search in')
        .setRequired(true)
        .addChoices({ name: 'Asia', value: 'asia' }, { name: 'China', value: 'china' }, { name: 'NA/EU', value: 'naeu' })
    ),
  async execute(interaction) {
    const client = new MongoClient(databaseConnect);
    const nameQuery = interaction.options.getString('name');
    const regionQuery = interaction.options.getString('region');
    // similarity helper
    function levenshtein(a, b) {
      const m = a.length;
      const n = b.length;
      const dp = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));
      for (let i = 0; i <= m; i++) dp[i][0] = i;
      for (let j = 0; j <= n; j++) dp[0][j] = j;
      for (let i = 1; i <= m; i++) {
        for (let j = 1; j <= n; j++) {
          const cost = a[i - 1] === b[j - 1] ? 0 : 1;
          dp[i][j] = Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1, dp[i - 1][j - 1] + cost);
        }
      }
      return dp[m][n];
    }
    try {
      const database = client.db('TA-TA');
      const collection = database.collection('Blueprints');
      const results = await collection.find({ blueprint_name: { $regex: nameQuery, $options: 'i' }, region: regionQuery }).toArray();
      if (!results || results.length === 0) {
        const regionDisplay = regionQuery === 'asia' ? 'Asia' : regionQuery === 'china' ? 'China' : 'NA/EU';
        await interaction.reply(`No blueprints found with name '${nameQuery}' in region ${regionDisplay}.`);
      } else {
        // choose the most similar by Levenshtein distance
        const scored = results.map((b) => ({ b, dist: levenshtein(nameQuery.toLowerCase(), (b.blueprint_name || '').toLowerCase()) }));
        scored.sort((a, b) => a.dist - b.dist);
        const best = scored[0].b;
        const regionDisplay = regionQuery === 'asia' ? 'Asia' : regionQuery === 'china' ? 'China' : 'NA/EU';
        const reply = `Blueprint: '${nameQuery}' (best match: '${best.blueprint_name}') - Region: ${regionDisplay} | Code: ${best.code} | User: ${best.name || best.id}`;
        await interaction.reply(reply);
      }
    } catch (err) {
      console.log(err);
      await interaction.reply('An error occurred while searching for blueprints.');
    } finally {
      await client.close();
    }
  },
};
