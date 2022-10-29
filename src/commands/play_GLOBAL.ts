// command to play audio from a youtube link
// unable to be used in direct messages

import { createAudioResource, createAudioPlayer, AudioPlayerStatus } from '@discordjs/voice';
import { SlashCommandBuilder } from 'discord.js';
import { VoiceConnect } from './connect/VoiceConnect';
const fs = require('fs');
const ytdl = require('ytdl-core');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('play')
        .setDescription('Play audio from a youtube link!')
        .setDMPermission(false)
        .addStringOption(option =>
            option
                .setName('link')
                .setDescription('The youtube link to play')
                .setRequired(true)),
    async execute(interaction: any) {
        // join the voice channel the user is in
        const connection = await VoiceConnect(interaction);
        if (!connection) return;

        // get link
        const link = interaction.options.getString('link');

        // get video info
        const info = await ytdl.getInfo(link);
        const title = info.videoDetails.title;
        const duration = info.videoDetails.lengthSeconds;

        // create audio player
        const player = createAudioPlayer();

        // create audio stream
        const stream = ytdl(link, { filter: 'audioonly' });

        // create audio resource
        const resource = createAudioResource(stream);

        // play audio
        try{
            await player.play(resource);
            connection.subscribe(player);
        }
        catch (error) {
            // console.error(error);
        }

        await interaction.reply(`Now playing: ${title} (${duration} seconds)`);

        // disconnect on end
        player.on(AudioPlayerStatus.Idle, () => {
            connection.destroy();
        });
    },
};