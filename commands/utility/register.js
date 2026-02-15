const { SlashCommandBuilder } = require('discord.js');
const { MongoClient } = require('mongodb');
const { databaseConnect } = require('../../config.json');

// Basic sanitizers to neutralize potentially unsafe inputs before hitting MongoDB
function sanitizeString(s) {
  if (typeof s !== 'string') return '';
  return s.trim().replace(/\$/g, '').replace(/\0/g, '');
}
function sanitizeUid(n) {
  let v = Number(n);
  if (!Number.isFinite(v)) v = 0;
  v = Math.max(0, Math.min(999999999, Math.floor(v)));
  return v;
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('register')
    .setDescription('Set your Endfield UID and region!')
    .addStringOption((option) => option.setName('region').setDescription('The region your UID is assigned to').setRequired(true).addChoices({name: 'Asia', value: 'asia'}, {name:'China', value:'china'}, {name:'NA/EU', value:'naeu'}))
    .addIntegerOption((option) => option.setName('uid').setDescription('Your UID!').setRequired(true).setMaxValue(999999999))
    ,
async execute(interaction) {
        const client = new MongoClient(databaseConnect);
        const regionRaw = interaction.options.getString('region');
        const uidRaw = interaction.options.getInteger('uid');
        const region = sanitizeString(regionRaw);
        const uid = sanitizeUid(uidRaw);
        let reply = null;
        try {
            const database = client.db('TA-TA');
            const collection = database.collection("Users")
            const query = {id: interaction.user.id};
            let update;
            if (region === "asia") {
                update = {$set: {name: sanitizeString(interaction.user.username), uid_a:uid}};
            } else if (region === "china") {
                update = {$set: {name: sanitizeString(interaction.user.username), uid_c:uid}};
            } else {
                update = {$set: {name: sanitizeString(interaction.user.username), uid_n:uid}};
            }
            const options = {upsert: true};
            await collection.updateOne(query, update, options)
        } catch (error) {
            console.log(error);
            reply = error;
        } finally {
            await client.close();
        }
        const regionName = region === 'asia' ? 'Asia' : region === 'china' ? 'China' : 'NA/EU';
        await interaction.reply('Registered ' + regionName + ' UID as: ' + uid);
	},
};
