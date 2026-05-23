const { Client, GatewayIntentBits } = require('discord.js');
const { joinVoiceChannel, createAudioPlayer, createAudioResource, AudioPlayerStatus } = require('@discordjs/voice');
const play = require('play-dl');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildVoiceStates,
  ]
});

const queue = new Map();

client.once('ready', () => {
  console.log(`Logged in as ${client.user.tag}`);
});

client.on('messageCreate', async (message) => {
  if (message.author.bot) return;
  const args = message.content.split(' ');
  const command = args[0].toLowerCase();

  if (command === '!play') {
    const query = args.slice(1).join(' ');
    if (!query) return message.reply('Please provide a song! e.g. `!play Shape of You`');
    const voiceChannel = message.member.voice.channel;
    if (!voiceChannel) return message.reply('Join a voice channel first!');

    try {
      const searched = await play.search(query, { limit: 1 });
      if (!searched.length) return message.reply('No results found!');
      const song = searched[0];
      const stream = await play.stream(song.url);
      const resource = createAudioResource(stream.stream, { inputType: stream.type });
      const player = createAudioPlayer();
      const connection = joinVoiceChannel({
        channelId: voiceChannel.id,
        guildId: message.guild.id,
        adapterCreator: message.guild.voiceAdapterCreator,
      });
      connection.subscribe(player);
      player.play(resource);
      queue.set(message.guild.id, { connection, player });
      message.reply(`🎵 Now playing: **${song.title}**`);
    } catch (e) {
      console.error(e);
      message.reply('Something went wrong!');
    }
  }

  if (command === '!stop') {
    const server = queue.get(message.guild.id);
    if (!server) return message.reply('Nothing is playing!');
    server.player.stop();
    server.connection.destroy();
    queue.delete(message.guild.id);
    message.reply('⏹️ Stopped!');
  }

  if (command === '!pause') {
    const server = queue.get(message.guild.id);
    if (!server) return message.reply('Nothing is playing!');
    server.player.pause();
    message.reply('⏸️ Paused!');
  }

  if (command === '!resume') {
    const server = queue.get(message.guild.id);
    if (!server) return message.reply('Nothing is playing!');
    server.player.unpause();
    message.reply('▶️ Resumed!');
  }
});

client.login(process.env.TOKEN);
