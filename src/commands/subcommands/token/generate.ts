import { Tokens } from "../../../database/database";

// function that generates tokens for a registered target user
// command user does not need to be registered with the server, 
//      but they must either be a server admin or have the CronToken admin role
export async function Generate(interaction: any) {
    // end interaction if user does not have admin permissions or does not have the CronToken Admin role
    if (!interaction.member.permissions.has('ADMINISTRATOR') && !interaction.member.roles.cache.has('CronToken Admin')) {
        await interaction.reply({ content: 'You do not have permission to use this command.', ephemeral: true });
        return;
    }
    else {
        // get target user and number of tokens to give
        const targetUser = interaction.options.getUser('user');
        const number = interaction.options.getInteger('number');

        // end interaction if target user is not registered
        const checkTargetUser = await Tokens.findOne({ where: { guildId: interaction.guild.id, userId: targetUser.id } });
        if (!checkTargetUser) {
            await interaction.reply({ content: 'Target user does not have a CronToken account with this server. Please have them register with `/token register` to register.', ephemeral: true });
            return;
        }

        // update target user's tokens
        await Tokens.increment('tokens', { by: number, where: { guildId: interaction.guild.id, userId: targetUser.id } });

        // reply with success message
        await interaction.reply({ content: `Successfully generated ${number} CronTokens for ${targetUser.username}#${targetUser.discriminator}.`, ephemeral: true });
        return;
    }
}