import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from "discord.js";
import { Tokens } from "../../../database/database";

// export a function called register that takes in interaction
export async function Register(interaction: any) {
    // check if user is already registered
    const checkUser = await Tokens.findOne({ where: { guildId: interaction.guild.id, userId: interaction.user.id } });
    if (checkUser) {
        await interaction.reply({ content: 'You are already registered with this server.', ephemeral: true });
        return;
    }
    else {
        // send message to user with button to confirm registration
        const row = new ActionRowBuilder<ButtonBuilder>()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('accept')
                    .setLabel('Accept')
                    .setStyle(ButtonStyle.Primary),
                new ButtonBuilder()
                    .setCustomId('decline')
                    .setLabel('Decline')
                    .setStyle(ButtonStyle.Secondary),
            );
        await interaction.reply({
            content: 'This will register you for CronToken usage in this server. Your user ID will be stored in a database.' +
                '\n\nYou may remove your data at any time with `/token unregister` which will also remove all tokens from your account.\n\nPlease click the accept button below to register!', components: [row], ephemeral: true
        });

        // create collector for button interaction
        const filter = (i: any) => (i.customId === 'accept' || i.customId === 'decline') && i.user.id === interaction.user.id;
        const collector = interaction.channel.createMessageComponentCollector({ filter, time: 15000 });

        // if user accepts registration add user to Tokens table
        collector.on('collect', async (i: any) => {
            if (i.customId === 'accept') {
                // close collector
                collector.stop();
                await Tokens.create({ guildId: interaction.guild.id, userId: interaction.user.id });
                await interaction.editReply({ content: 'You have been registered for CronToken usage in this server.', components: [] });

                return;
            }
            else if (i.customId === 'decline') {
                // close collector
                collector.stop();
                await interaction.editReply({ content: 'You have not been registered for CronToken usage in this server. If you would like to register, try again with `/token register`.', components: [] });

                return;
            }
        });
        // end interaction on timeout
        collector.on('end', async (collected: any, reason: any) => {
            if (reason === 'time') {
                // close collector
                collector.stop();
                // end interaction
                await interaction.editReply({ content: 'Timed out.', components: [] });

                return;
            }
        });
    }
}