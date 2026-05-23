const { Client, GatewayIntentBits } = require('discord.js');
const { Player } = require('discord-player');
const { YoutubeiExtractor } = require('@discord-player/extractor');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildVoiceStates,
  ]
});

const player = new Player(client);
player.extractors.register(YoutubeiExtractor, {});

client.once('ready', () => {
  console.log(`Logged in as ${client.user.tag}`);
});

client.on('messageCreate', async (message) => {
  if (message.author.bot) return;

  const args = message.content.split(' ');
  const command = args[0].toLowerCase();

  // !play command
  if (command === '!play') {
    const query = args.slice(1).join(' ');
    if (!query) return message.reply('Please provide a song name! e.g. `!play Shape of You`');

    const voiceChannel = message.member.voice.channel;
    if (!voiceChannel) return message.reply('You need to be in a voice channel first!');

    try {
      const { track } = await player.play(voiceChannel, query, {
        nodeOptions: { metadata: message }
      });
      message.reply(`🎵 Now playing: **${track.title}**`);
    } catch (e) {
      message.reply('Something went wrong! Could not play that song.');
      console.error(e);
    }
  }

  // !skip command
  if (command === '!skip') {
    const queue = player.nodes.get(message.guild);
    if (!queue) return message.reply('No music is playing!');
    queue.node.skip();
    message.reply('⏭️ Skipped!');
  }

  // !stop command
  if (command === '!stop') {
    const queue = player.nodes.get(message.guild);
    if (!queue) return message.reply('No music is playing!');
    queue.delete();
    message.reply('⏹️ Stopped and left the channel!');
  }

  // !pause command
  if (command === '!pause') {
    const queue = player.nodes.get(message.guild);
    if (!queue) return message.reply('No music is playing!');
    queue.node.pause();
    message.reply('⏸️ Paused!');
  }

  // !resume command
  if (command === '!resume') {
    const queue = player.nodes.get(message.guild);
    if (!queue) return message.reply('No music is playing!');
    queue.node.resume();
    message.reply('▶️ Resumed!');
  }

  // !queue command
  if (command === '!queue') {
    const queue = player.nodes.get(message.guild);
    if (!queue || !queue.tracks.size) return message.reply('The queue is empty!');
    const tracks = queue.tracks.map((t, i) => `${i + 1}. ${t.title}`).join('\n');
    message.reply(`📋 **Queue:**\n${tracks}`);
  }
});

client.login(process.env.TOKEN);
