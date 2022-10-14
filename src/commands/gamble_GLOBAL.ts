// this is a command that users can use to stake their CronTokens for a chance at gaining back more

import { SlashCommandBuilder } from "discord.js";
import { CheckGuild } from "./checks/CheckGuild";
import { CheckUser } from "./checks/CheckUser";
import { Coinflip } from "./subcommands/gamble/coinflip";

module.exports = {
    data: new SlashCommandBuilder()
        .setName('gamble')
        .setDescription('Gamble your CronTokens for a chance at gaining more!')
        .setDMPermission(false)
        // types of gambles
        .addSubcommand(subcommand =>
            subcommand
                .setName('coinflip')
                .setDescription('Flip a coin for a chance at winning!')
                .addIntegerOption(option =>
                    option
                        .setName('flips')
                        .setDescription('10 tokens per flip.')
                        .setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('dice')
                .setDescription('Roll a dice for a chance at winning!')
                .addIntegerOption(option =>
                    option
                        .setName('bet')
                        .setDescription('The number of tokens to bet.')
                        .setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('roulette')
                .setDescription('Spin the roulette wheel for a chance at winning!')
                .addIntegerOption(option =>
                    option
                        .setName('bet')
                        .setDescription('The number of tokens to bet.')
                        .setRequired(true))),

    async execute(interaction: any) {
        // check user and guild
        CheckUser(interaction);
        CheckGuild(interaction);

        // if subcommand is coinflip
        if (interaction.options.getSubcommand() === 'coinflip') {
            // call coinflip.ts
            await Coinflip(interaction);
            return;
        }

        // if subcommand is dice
        if (interaction.options.getSubcommand() === 'dice') {
            // call dice.ts
            // await Dice(interaction);
            // unimplemented
            interaction.reply({ content: 'This command is not yet implemented.', ephemeral: true });
            return;
        }

        // if subcommand is roulette
        if (interaction.options.getSubcommand() === 'roulette') {
            // call roulette.ts
            // await Roulette(interaction);
            // unimplemented
            interaction.reply({ content: 'This command is not yet implemented.', ephemeral: true });
            return;
        }
    }
}