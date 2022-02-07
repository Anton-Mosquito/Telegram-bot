const TelegramApi = require('node-telegram-bot-api');
const token = `5115419506:AAFTx6uSexAgUk_E9crUeSNspXVM9G_ZD3g`;
const {gameOption, againOption} = require('./options');

const bot = new TelegramApi(token, {polling: true});

const chats = {}

const startGame = async (chatId) => {
  await bot.sendMessage(chatId, `Now I will think of a number from 0 to 9, and you have to guess it`);
  
  const randomNumber = Math.floor(Math.random() * 10);
  chats[chatId] = randomNumber;
  
  await bot.sendMessage(chatId, 'Guess!', gameOption);
}

const start = () => {
  bot.setMyCommands([
    { command: '/start', description: 'Initial greeting'},
    { command: '/info', description: 'Full information'},
    { command: '/game', description: 'Guess the number game'}
  ])
  
  bot.on('message', async (msg) => {
    const text = msg.text;
    const chatId = msg.chat.id;
  
    if (text === '/start') {
      await bot.sendSticker(chatId, `https://tlgrm.ru/_/stickers/ccd/a8d/ccda8d5d-d492-4393-8bb7-e33f77c24907/22.webp`);

      return bot.sendMessage(chatId, `Welcome to telegram bot author Nobody`);
    }

    if (text === '/info') {
      return bot.sendMessage(chatId, `Your name ${msg.from.first_name} ${msg.from.last_name}`);
    }

    if (text === '/game') {
      startGame(chatId);
    }

    return bot.sendMessage(chatId, `I do not understand you, try again`);
  })

  bot.on('callback_query', (msg) => {
    const data = msg.data;
    const chatId = msg.chat.id;
    if (data === `/again`) {
      return startGame(chatId);
    }
    if (data === chats[chatId]) {
      return await bot.sendMessage(chatId, `Congratulation you win! Guess digit is ${chats[chatId]}`, againOption)
    } else {
      return await bot.sendMessage(chatId, `Unfortunately you did not guess the digit, bot saved digit is ${chats[chatId]}`, againOption)
    }   
  })
}

start();