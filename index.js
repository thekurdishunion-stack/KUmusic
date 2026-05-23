const { Client, GatewayIntentBits } = require('discord.js');
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
});

client.once('ready', () => {
  console.log(`Logged in as ${client.user.tag}`);
});

distube
  .on('playSong', (queue, song) => {
    queue.textChannel.send(`🎵 Now playing: **${song.name}**`);
  })
  .on('error', (channel, error) => {
    channel.send('Something went wrong!');
    console.error(error);
  });

client.on('messageCreate', async (message) => {
  if (message.author.bot) return;
  const args = message.content.split(' ');
  const command = args[0].toLowerCase();

  if (command === '!play') {
    const query = args.slice(1).join(' ');
    if (!query) return message.reply('Please provide a song!');
    const voiceChannel = message.member.voice.channel;
    if (!voiceChannel) return message.reply('Join a voice channel first!');
    distube.play(voiceChannel, query, { textChannel: message.channel });
  }

  if (command === '!stop') distube.stop(message.guild);
  if (command === '!pause') distube.pause(message.guild);
  if (command === '!resume') distube.resume(message.guild);
  if (command === '!skip') distube.skip(message.guild);
});

client.login(process.env.TOKEN);
