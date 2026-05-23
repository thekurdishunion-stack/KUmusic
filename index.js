const { Client, GatewayIntentBits } = require('discord.js');
const { joinVoiceChannel, createAudioPlayer, createAudioResource, entersState, VoiceConnectionStatus } = require('@discordjs/voice');
const { DisTube } = require('distube');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildVoiceStates,
  ]
});

const distube = new DisTube(client, {
  emitNewSongOnly: true,
  joinNewVoiceChannel: true,
  nsfw: false,
});

client.once('ready', () => {
  console.log(`Logged in as ${client.user.tag}`);
});

distube
  .on('playSong', (queue, song) => {
    queue.textChannel.send(`🎵 Now playing: **${song.name}** - \`${song.formattedDuration}\``);
  })
  .on('addSong', (queue, song) => {
    queue.textChannel.send(`✅ Added: **${song.name}**`);
  })
  .on('error', (channel, error) => {
    console.error(error);
    if (channel) channel.send(`❌ Error: ${error.message}`);
  })
  .on('disconnect', (queue) => {
    queue.textChannel.send('Disconnected from voice channel!');
  });

client.on('messageCreate', async (message) => {
  if (message.author.bot) return;
  const args = message.content.split(' ');
  const command = args[0].toLowerCase();

  if (command === '!play') {
    const query = args.slice(1).join(' ');
    if (!query) return message.reply('Please provide a song! e.g. `!play Shape of You`');
    const voiceChannel = message.member.voice.channel;
    if (!voiceChannel) return message.reply('❌ Join a voice channel first!');
    try {
      await distube.play(voiceChannel, query, {
        textChannel: message.channel,
        member: message.member,
      });
    } catch (e) {
      console.error(e);
      message.reply(`❌ Error: ${e.message}`);
    }
  }

  if (command === '!stop') {
    try { distube.stop(message.guild); message.reply('⏹️ Stopped!'); }
    catch (e) { message.reply('Nothing is playing!'); }
  }

  if (command === '!pause') {
    try { distube.pause(message.guild); message.reply('⏸️ Paused!'); }
    catch (e) { message.reply('Nothing is playing!'); }
  }

  if (command === '!resume') {
    try { distube.resume(message.guild); message.reply('▶️ Resumed!'); }
    catch (e) { message.reply('Nothing is playing!'); }
  }

  if (command === '!skip') {
    try { distube.skip(message.guild); message.reply('⏭️ Skipped!'); }
    catch (e) { message.reply('Nothing is playing!'); }
  }

  if (command === '!queue') {
    const queue = distube.getQueue(message.guild);
    if (!queue) return message.reply('Nothing is playing!');
    const songs = queue.songs.map((s, i) => `${i + 1}. **${s.name}**`).join('\n');
    message.reply(`📋 Queue:\n${songs}`);
  }
});

client.login(process.env.TOKEN);
