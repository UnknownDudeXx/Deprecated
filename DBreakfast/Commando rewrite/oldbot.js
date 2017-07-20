const Discord = require('discord.js');
const client = new Discord.Client();
const config = require('./config.json');
let orders = [];
let unclaimed = [];
let claimed = [];
let cooking = [];
let cooked = [];
let delivering = [];
let activeUsers = [];
console.log('Requires and vars intialized.');

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag} (${client.user.id})`);
  let oChan = client.channels.get('299989992284094464');
  oChan.bulkDelete(99);
  oChan.bulkDelete(99);
  oChan.bulkDelete(99);
  oChan.bulkDelete(99);
  oChan.send('This is the orders channel.');
  console.log('Orders purged.');
  console.log('Ready.');
});

client.on('message', (msg) => {
  let args = msg.content.split(" ").slice(1);
  let argsresult = args.join(" ");
  const prefix = config.prefix;

  if (msg.content.startsWith(prefix + "order")) {
    if (!orders[msg.author.id]) orders[msg.author.id] = {
      orders: []
    };
    //if (orders[msg.author.id]) return msg.reply('You\'ve already ordered something!');
    orders[msg.author.id].orders.push({
      order: argsresult,
      id: 1234,
      user: `${msg.author.tag}`,
      status: 'Unclaimed',
      ready: false
    })
    activeUsers.push({
      id: msg.author.id
    })
    client.channels.get('299989992284094464').send(`New order! ${argsresult}`);
  } else if (msg.content.startsWith(prefix + "myorder")) {
    orders[msg.author.id].orders.forEach((order) => {
      let toSend = JSON.stringify(order.order)
      msg.reply(`Your order: ${toSend}`);
    })
  } else if (msg.content.startsWith(prefix + "olist")) {
    try {
      activeUsers.forEach((id) => {
        orders[id].forEach((order) => {
          let toSend = JSON.stringify(order)
          msg.reply(`${toSend}`)
        });
      });
    } catch (err) {
      console.error(err);
    }
  }
});

client.login(config.token);
