// this function will connect the bot to the voice channel the user is in
// and return the connection

const { joinVoiceChannel, VoiceConnectionStatus } = require('@discordjs/voice');

export async function VoiceConnect(interaction: any) {
    
    // return nothing if the user is not in a voice channel
    if (!interaction.member.voice.channelId) {
        await interaction.reply({ content: 'You must be in a voice channel to use this command!', ephemeral: true });
        return;
    }

    const connection = joinVoiceChannel({
        channelId: interaction.member.voice.channel.id,
        guildId: interaction.guild.id,
        adapterCreator: interaction.guild.voiceAdapterCreator,
    });

    connection.on(VoiceConnectionStatus.Ready, () => {
        console.log(`Connected to channel ${interaction.member.voice.channel.name} in guild ${interaction.guild.name}`);
    });

    return connection;
}