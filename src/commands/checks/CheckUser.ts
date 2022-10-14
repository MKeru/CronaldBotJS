import { Tokens } from "../../database/database";

export async function CheckUser(interaction: any)
{
    // check if user is registered for CronToken usage
    const checkUser = await Tokens.findOne({ where: { guildId: interaction.guild.id, userId: interaction.user.id } });
    if (!checkUser) {
        interaction.reply({ content: 'You do not have a CronToken account with this server. Please register with `/token register` to register.', ephemeral: true });
        return;
    }
}