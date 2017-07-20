const commando = require('discord.js-commando');
const oneLine = require('common-tags').oneLine;
const Discord = require('discord.js');

module.exports = class OrderCommand extends commando.Command {
  constructor(client) {
    super(client, {
      name: 'order',
      group: 'general',
      memberName: 'order',
      description: 'Orders some breakfast.',
      details: oneLine `
        Order some breakfast with this command
			`,
      examples: ['order eggs and bacon'],
      args: [{
        key: 'order',
        label: 'order',
        prompt: 'What would you like to order?',
        type: 'string',
        infinite: false
      }],
      guildOnly: true,
      guarded: true
    })
  }

  async run(msg, args) {
    let oChan = this.client.channels.get('299989992284094464')
    this.client.settings.set(msg.author.id, 'order', 'test')
    oChan.send(`New order! ${this.client.settings.get(msg.author.id, 'order')}`)
  }
};
