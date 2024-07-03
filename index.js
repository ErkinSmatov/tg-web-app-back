const TelegramBot = require('node-telegram-bot-api');
const express = require('express');
const cors = require('cors');
const token = "6877036574:AAH09MxxWf4Lzesz_6EXnhUdsFM1dDim9XE";
const webAppUrl = "https://tg-web-app-bot.netlify.app"
// Create a bot that uses 'polling' to fetch new updates
const bot = new TelegramBot(token, { polling: true });

const app = express();
app.use(express.json());
app.use(cors());

bot.on('message', async (msg) => {
    const chatId = msg.chat.id;
    const text = msg.text;

    if (text === "/start") {
        await bot.sendMessage(chatId, 'Добро пожаловать!', {
            reply_markup: {
                keyboard: [
                    [{ text: 'Открыть форму', web_app: {url: webAppUrl + '/form'} }]
                ]
            }
        })
    }

    // await bot.sendMessage(chatId, 'Inline button', {
    //     reply_markup: {
    //         inline_keyboard: [
    //             [{ text: 'Сделать заказ' }]
    //         ]
    //     }
    // })

    if (msg?.web_app_data?.data) {
        try {
            const data = JSON.parse(msg?.web_app_data?.data)
            console.log(data);
            await bot.sendMessage(chatId, 'Спасибо за обратную связь');
            await bot.sendMessage(chatId, 'Ваша страна: ' + data.country);
        } catch (error) {
            console.log(error);
        }
    }

    //   bot.sendMessage(chatId, 'Received your message');
});

app.post('web-data', async (req, res) => {
    const {queryId, products, totalPrice} = req;

    try {
        await bot.answerWebAppQuery(queryId, {
            type: 'article',
            id: queryId,
            title: 'Успешная покупка',
            input_message_content: {message_text: 'Поздравляю с покупкой, вы приобрели товар на сумму ' + totalPrice}
        })

        return res.status(200).json({});
    } catch (error) {
        await bot.answerWebAppQuery(queryId, {
            type: 'article',
            id: queryId,
            title: 'Ошибка покупки',
            input_message_content: {message_text: 'Не удалось приобрести товар'}
        })
        return res.status(500).json({});
    }
})

const PORT = 8000;
app.listen(PORT, () => console.log('Server started on PORT: ' + PORT));