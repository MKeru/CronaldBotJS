import { Guilds } from "../../database/database";

export async function CheckGuild(interaction: any)
{
    // end any interaction if guild is not registered
    const checkGuild = await Guilds.findOne({ where: { guildId: interaction.guild.id } });
    if (!checkGuild) {
        interaction.reply({ content: 'This server is not registered for CronToken usage. Please register it with `/register` or ask a server administrator.', ephemeral: true });
        return;
    }
}