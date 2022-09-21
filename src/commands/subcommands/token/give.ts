import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from "discord.js";
import { Tokens } from "../../../database/database";

// subcommand for token
// this function is called when the user uses the /token give subcommand
// it will give a specified target user a specified number of tokens and subtract that number from the user's tokens
export async function Give(interaction: any) {
    // end interaction if user is not registered
    const checkUser = await Tokens.findOne({ where: { guildId: interaction.guild.id, userId: interaction.user.id } });
    if (!checkUser) {
        await interaction.reply({ content: 'You are not registered with this server. Please register with `/token register`.', ephemeral: true });
        return;
    }

    // get target user and number of tokens to give
    const targetUser = interaction.options.getUser('user');
    const number = interaction.options.getInteger('number');

    // end interaction if user does not have enough tokens
    if (checkUser.tokens < number) {
        await interaction.reply({ content: 'You do not have enough CronTokens to give.', ephemeral: true });
        return;
    }

    // end interaction if target user is not registered
    const checkTargetUser = await Tokens.findOne({ where: { guildId: interaction.guild.id, userId: targetUser.id } });
    if (!checkTargetUser) {
        await interaction.reply({ content: 'Target user does not have a CronToken account with this server. Please have them register with `/token register` to register.', ephemeral: true });
        return;
    }

    // warn user if they are giving all of their tokens and ask for confirmation with a button
    if (checkUser.tokens === number) {
        const row = new ActionRowBuilder<ButtonBuilder>();
        row.addComponents(
            new ButtonBuilder()
                .setCustomId('confirm')
                .setLabel('Confirm')
                .setStyle(ButtonStyle.Success),
            new ButtonBuilder()
                .setCustomId('cancel')
                .setLabel('Cancel')
                .setStyle(ButtonStyle.Secondary),
        );
        await interaction.reply({ content: 'Are you sure you want to give all of your CronTokens?', components: [row], ephemeral: true });

        const filter = (i: any) => (i.customId === 'confirm' || i.customId === 'cancel') && i.user.id === interaction.user.id;
        const collector = interaction.channel.createMessageComponentCollector({ filter, time: 15000 });
        collector.on('collect', async (i: any) => {
            if (i.customId === 'confirm') {
                // close collector
                collector.stop();
                // give tokens to target user
                await Tokens.increment('tokens', { by: number, where: { guildId: interaction.guild.id, userId: targetUser.id } });
                // remove tokens from user
                await Tokens.decrement('tokens', { by: number, where: { guildId: interaction.guild.id, userId: interaction.user.id } });
                // reply with success message
                await interaction.editReply({ content: `Successfully gave ${number} CronTokens to ${targetUser.username}#${targetUser.discriminator}.`, components: [] });

                return;
            }
            else if (i.customId === 'cancel') {
                // close collector
                collector.stop();
                // end interaction
                await interaction.editReply({ content: 'Cancelled.', components: [], ephemeral: true });
                return;
            }
        });
        collector.on('end', async (collected: any, reason: any) => {
            if (reason === 'time') {
                // close collector
                collector.stop();
                // end interaction
                await interaction.editReply({ content: 'Timed out.', components: [], ephemeral: true });

                return;
            }
        });
    }
    else {
        // give tokens to target user
        await Tokens.increment('tokens', { by: number, where: { guildId: interaction.guild.id, userId: targetUser.id } });
        // remove tokens from user
        await Tokens.decrement('tokens', { by: number, where: { guildId: interaction.guild.id, userId: interaction.user.id } });
        // reply with success message
        await interaction.reply({ content: `Successfully gave ${number} CronTokens to ${targetUser.username}#${targetUser.discriminator}.`, ephemeral: true });
        return;
    }
}