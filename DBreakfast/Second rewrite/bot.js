//eslint-disable-next-line
const Discord = require('discord.js');
const bot = new Discord.Client();
const config = require('./config.json');
const prefix = config.prefix;
let cooldownUsers = [];
let data = {};
let usedIDs = [];
let help = [
  `Prefix is: \`${prefix}\``,
  '**help** - Sends this list.',
  '**ping** - Pong!',
  '**order [food]** - Sends your order to Discord Breakfast so it can be cooked for you.',
  '**myorder** - Sends the details on your order.',
  '**invite** - Sends the OAuth so you can invite me to your server!'
];
console.log('Requires and vars initialized.');

function makeID() {
  let id = '';
  let possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  for (let i = 0;i < 5;i++) id += possible.charAt(Math.floor(Math.random() * possible.length));
  if (usedIDs.includes(id)) {
    let id = '';
    let possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for (let i = 0;i < 5;i++) id += possible.charAt(Math.floor(Math.random() * possible.length));

    return id;
  }

  return id;

}

bot.on('ready', () => {
  console.log(`Discord Breakfast online!\nOn ${bot.guilds.size} guilds with ${bot.users.size} users.`);
  bot.user.setGame(`db.order | ${bot.guilds.size} servers!`);
  let oChan = bot.channels.get('299989992284094464');
  oChan.bulkDelete(99);
  oChan.send('This is the orders channel.');
  console.log('Orders purged.')
});

bot.on('message', msg => {
  if (!msg.content.startsWith(prefix)) return;
  if (msg.author.bot) return;
  let message = msg;
  //eslint-disable-next-line no-unused-vars
  let client = bot;

  if (msg.content.startsWith(prefix + 'ping')) {
    msg.channel.send('Pong!');
  } else if (msg.content.startsWith(prefix + 'help')) {
    msg.reply('Check your DM\'s!');
    msg.author.send(help.join('\n'));
  } else if (msg.content.startsWith(prefix + 'invite')) {
    msg.channel.send(`You can invite me with this: ${config.oauth}`);
  } else if (msg.content.startsWith(prefix + 'order')) {
    if (cooldownUsers.includes(msg.author.id)) {
      msg.channel.send(`:no_entry_sign: **${msg.author.username}**, you"ve already sent an order!\nType, \`${prefix}myorder\` to view the details of it.`);
    } else {
      let args = msg.content.replace(prefix + 'order ', '');
      //eslint-disable-next-line no-undefined
      if (args === '' || args === undefined) return msg.channel.send(`You must put a food to order after \`${prefix}order\``);
      let orderID = makeID();
      if (!data[orderID]) data[orderID] = {
        orders: []
      };
      usedIDs.push(orderID);
      cooldownUsers.push(msg.author.id);
      data[orderID].orders.push({
        order: args,
        id: orderID,
        user: msg.author.tag,
        userid: msg.author.id,
        status: 'Awaiting a chef.',
        ready: false
      });
      let channel = msg.channel;
      let user = msg.author.id;
      let tosend = [];
      data[orderID].orders.forEach((order) => {
        tosend.push(`Food: **${order.order}**\nOrder ID: \`${order.id}\`\nUser: **${order.user}**\nStatus: **${order.status}**`);
      });
      msg.reply(`I"ve sent your order to Discord Breakfast!\nOrder ID: \`${orderID}\``);
      bot.channels.get('299989992284094464').send(`**Order:**\n${tosend}`)
    }
  } else if (msg.content.startsWith(prefix + 'cook')) {
    if (config.chefs.includes(msg.author.id)) {
      let args = msg.content.replace(prefix + 'cook ', '');
      //eslint-disable-next-line no-undefined
      if (args === '' || args === undefined) return msg.reply('You must specify an order ID to cook.');
      if (usedIDs.includes(args)) {
        let filteredOrders = data[args].orders.filter(function(order) {
          return order.id === args;
        });
        filteredOrders.forEach((order) => {
          order.status = 'Cooking. Done in 5 minutes.';
        });
        msg.reply('Cooking will take 5 minutes.');
        setTimeout(() => {
          let tosend2 = [];
          filteredOrders.forEach((order) => {
            tosend2.push(`Food: **${order.order}**\nOrder ID: \`${order.id}\`\nUser: **${order.user}**\nStatus: **${order.status}**`)
            bot.channels.get('299989992284094464').fetchMessages({
                limit: 100
              })
              .then(function(msgs) {
                //eslint-disable-next-line no-undef
                let rawToEdit = msgs.filter(function(oldMsg) {
                  return oldMsg.content.includes(order.id)
                })
                //eslint-disable-next-line no-undef
                rawToEdit.first().edit(`**Order:**\n${tosend2}`);
              });
          }, 2000);
          setTimeout(() => {
            let tosend3min = [];
            filteredOrders.forEach((order) => {
              order.status = 'Cooking. Done in 3 minutes.';
              tosend3min.push(`Food: **${order.order}**\nOrder ID: \`${order.id}\`\nUser: **${order.user}**\nStatus: **${order.status}**`);
            })
            rawToEdit.first().edit(`**Order:**\n${tosend3min}`);
          }, 120000);
          setTimeout(() => {
            let tosend1min = [];
            filteredOrders.forEach((order) => {
              order.status = 'Cooking. Done in 1 minute.';
              tosend1min.push(`Food: **${order.order}**\nOrder ID: \`${order.id}\`\nUser: **${order.user}**\nStatus: **${order.status}**`);
            });
            rawToEdit.first().edit(`**Order:**\n${tosend1min}`);
          }, 240000);
          setTimeout(() => {
            let tosend4 = [];
            filteredOrders.forEach((order) => {
              order.status = 'Cooked. Ready for delivery.';
              order.ready = true;
              tosend4.push(`Food: **${order.order}**\nOrder ID: \`${order.id}\`\nUser: **${order.user}**\nStatus: **${order.status}**`);
              bot.channels.get('299992229651415040').send(`Order ${order.id}  is ready to deliver`);
            });
            bot.channels.get('299989992284094464').send(`**Order:**\n${tosend4}`);
          }, 300000)
        })
      } else {
        msg.reply('That isn\'t an active order ID.');
      }
      //eslint-disable-next-line no-useless-return
    } else return
  } else if (msg.content.startsWith(prefix + 'deliver')) {
    if (config.deliverers.includes(msg.author.id)) {
      let args = msg.content.replace(prefix + 'deliver ', '');
      //eslint-disable-next-line no-undefined
      if (args === '' || args === undefined) return msg.reply('You must specify an order ID to deliver.');
      if (usedIDs.includes(args)) {
        setTimeout(() => {
          msg.delete();
        }, 2000);
        msg.reply('I\'ve DMed you info on this order.');
        channel.createInvite().then(x => msg.author.send(`Go to ${x.url} to deliver!`));
        let userIndex = cooldownUsers.indexOf(user);
        let idIndex = usedIDs.indexOf(orderID);
        cooldownUsers.splice(userIndex, 1);
        usedIDs.splice(idIndex, 1);
        data[user] = '';
      } else {
        msg.reply('That isn\'t an active order ID.');
      }
      //eslint-disable-next-line no-useless-return
    } else return
  } else if (msg.content.startsWith(prefix + 'myorder')) {
    if (!data[msg.author.id]) data[msg.author.id] = {
      orders: []
    };
    //eslint-disable-next-line no-undefined
    if (!data[msg.author.id] === undefined) return msg.channel.send(`**${msg.author.username}**, you haven"t ordered anything yet.`);
    let tosend = [];
    data[msg.author.id].orders.forEach((order) => {
      tosend.push(`**${order.order}**\nOrder ID: \`${order.id}\`\nStatus: **${order.status}**`);
    });
    msg.channel.send(`**${msg.author.username}**, you"ve ordered:\n${tosend}`);
  }
});

bot.login(config.token);

process.on('unhandledRejection', err => {
  console.error('Uncaught Promise Error: \n' + err.stack);
});
