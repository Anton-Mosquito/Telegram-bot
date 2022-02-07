const TelegramApi = require('node-telegram-bot-api');
const token = `5115419506:AAFTx6uSexAgUk_E9crUeSNspXVM9G_ZD3g`;
const {gameOption, againOption} = require('./options');
const sequelize = require('./db');
const UserModel = require('./models')

const bot = new TelegramApi(token, {polling: true});

const chats = {}

const startGame = async (chatId) => {
  await bot.sendMessage(chatId, `Now I will think of a number from 0 to 9, and you have to guess it`);
  
  const randomNumber = Math.floor(Math.random() * 10);
  chats[chatId] = randomNumber;
  
  await bot.sendMessage(chatId, 'Guess!', gameOption);
}

const start = async () => {
  
  try {
    await sequelize.authenticate();
    await sequelize.sync();
  } catch (error) {
    console.log(error);
  }


  bot.setMyCommands([
    { command: '/start', description: 'Initial greeting'},
    { command: '/info', description: 'Full information'},
    { command: '/game', description: 'Guess the number game'}
  ])
  
  bot.on('message', async (msg) => {
    const text = msg.text;
    const chatId = msg.chat.id;

    try {
      if (text === '/start') {
        await UserModel.create({chatId})
        await bot.sendSticker(chatId, `https://tlgrm.ru/_/stickers/ccd/a8d/ccda8d5d-d492-4393-8bb7-e33f77c24907/22.webp`);
  
        return bot.sendMessage(chatId, `Welcome to telegram bot author Nobody`);
      }
  
      if (text === '/info') {
        const user = await UserModel.findOne({chatId})

        return bot.sendMessage(chatId, `Your name ${msg.from.first_name} ${msg.from.last_name}, you have right ${user.right} answer and wrong ${user.wrong} answer`);
      }
  
      if (text === '/game') {
        return startGame(chatId);
      }
  
      return bot.sendMessage(chatId, `I do not understand you, try again`);
    } catch (error) {
      return await bot.sendMessage(chatId, 'Error was occurred');
    }
  })

  bot.on('callback_query',  async (msg) => {
    const data = msg.data;
    const chatId = msg.message.chat.id;

    if (data === `/again`) {
      return startGame(chatId);
    }

    const user = await UserModel.findOne({chatId});

    if (data == chats[chatId]) {
      user.right += 1;
      await bot.sendMessage(chatId, `Congratulation you win! Guess digit is ${chats[chatId]}`, againOption)
    } else {
      user.wrong += 1;
      await bot.sendMessage(chatId, `Unfortunately you did not guess the digit, bot saved digit is ${chats[chatId]}`, againOption)
    }
    
    await user.save();
  })
}

start();