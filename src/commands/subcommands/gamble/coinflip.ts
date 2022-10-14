// handler for the coinflip subcommand of the gamble command
// this is a command that users can use to stake their CronTokens for a chance at gaining back more
// if the user wins, the house gives the user 9 tokens
// if the house wins, the user gives the house 10 tokens
// 50% chance of winning, 50% chance of losing
// house expected return = (.5 * 10) + (.5 * -9) = 0.5 CronTokens per flip
// house edge = (0.5 / 10) * 100 = 5%
// user can choose how many times to flip the coin

import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from "discord.js";
import { CheckBalance, GetTokens, AddTokens } from "../../../CronToken";

export async function Coinflip(interaction: any) {
    const flips = interaction.options.getInteger('flips');
    const cost = flips * 10;
    const hasTokens = await CheckBalance(interaction, cost);

    // if hasTokens is false, return
    if (!hasTokens) {
        interaction.reply({ content: `You do not have enough tokens to flip ${flips} time(s). That would cost ${cost} CronTokens and you only have ${await GetTokens(interaction)}.`, ephemeral: true });
        return;
    }

    // if more than 1 flip, show message with total cost and ask for confirmation
    if (flips > 1) {
        const totalCost = flips * 10;
        const userTokens = GetTokens(interaction);
        const row = new ActionRowBuilder<ButtonBuilder>()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('accept')
                    .setLabel('Accept')
                    .setStyle(ButtonStyle.Success),
            )
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('decline')
                    .setLabel('Decline')
                    .setStyle(ButtonStyle.Secondary),
            );

        await interaction.reply(
            {
                content: `You are about to flip a coin ${flips} times for a total cost of ${totalCost} tokens. You currently have ${await GetTokens(interaction)} tokens.\n\nAre you sure you want to continue?`,
                components: [row],
                ephemeral: true
            });

        const filter = (i: any) => (i.customId === 'accept' || i.customId === 'decline') && i.user.id === interaction.user.id;
        const collector = interaction.channel.createMessageComponentCollector({ filter, time: 15000 });
        collector.on('collect', async (i: any) => {
            if (i.customId === 'accept') {
                try {
                    // stop collector
                    collector.stop();
                    // flip coin
                    const result = Flip(flips);
                    await AddTokens(interaction, result);
                    const status = result > 0 ? 'won' : 'lost';
                    const amount = Math.abs(result);
                    // send message
                    await i.update(
                        {
                            content: `You flipped a coin ${flips} times and ${status} ${amount} tokens! You now have ${await GetTokens(interaction)} tokens.`,
                            components: [],
                            ephemeral: true
                        });
                }
                catch (error) {
                    console.error(error);
                }
            }
            else if (i.customId === 'decline') {
                // stop collector
                collector.stop();
                // send message
                await i.update({ content: 'Cancelled.', components: [], ephemeral: true });
            }
        });
        collector.on('end', async (collected: any, reason: any) => {
            if (reason === 'time') {
                await interaction.editReply({ content: 'Timed out.', components: [] });
            }
        });
    }
    // if only 1 flip, just flip the coin and send message
    else {
        const result = Flip(1);
        await AddTokens(interaction, result);
        const status = result > 0 ? 'won' : 'lost';
        const amount = Math.abs(result);
        await interaction.reply({ content: `You flipped a coin and ${status} ${amount} tokens! You now have ${await GetTokens(interaction)} tokens.`, ephemeral: true });
    }
}

// coinflip function that returns the number of tokens the user won
// positive number represents number of tokens to give user
// negative number represents number of tokens to take from user
// takes integer for number of flips as argument
function Flip(flips: number): number {
    let total = 0;
    for (let i = 0; i < flips; i++) {
        const result = Math.floor(Math.random() * 2);
        if (result === 0) {
            total += 9;
        }
        else {
            total -= 10;
        }
    }
    return total;
}