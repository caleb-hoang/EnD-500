const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
    .setName('register')
    .setDescription('Set your Endfield UID and region!')
    .addStringOption((option) => option.setName('region').setDescription('The region your UID is assigned to').setRequired(true).addChoices({name: 'Asia', value: 'asia'}, {name:'NA/EU', value:'naeu'}))
    .addIntegerOption((option) => option.setName('uid').setDescription('Your UID!').setRequired(true).setMaxValue(999999999))
    ,
	async execute(interaction) {
        const region = interaction.options.getString('region');
        const uid = interaction.options.getInteger('uid');
		await interaction.reply('Registered!');
	},
};