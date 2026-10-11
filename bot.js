const express = require("express");
const axios = require("axios");
const { search } = require("duck-duck-scrape");

const app = express();
app.use(express.json());

const TOKEN =
"CGFHHF0JYNTOFTRVQSHXDYUIFKDPKFUEMHBZLRWICGBEYYLEUDNVKNDPDUNLDHZF";

async function sendMessage(chatId, text) {
    await axios.post(
        `https://h-qzcq.onrender.com/${TOKEN}/sendMessage`,
        {
            chat_id: chatId,
            text
        }
    );
}

function calculate(expression) {

    try {

        if (!/^[0-9+\-*/(). ]+$/.test(expression))
            return null;

        return String(eval(expression));

    } catch {

        return "خطا در محاسبه";
    }
}

async function getMeaning(word) {

    const result =
        await search(`meaning of ${word}`);

    if (!result.results.length)
        return "معنی پیدا نشد.";

    return result.results[0].description;
}

async function searchWeb(query) {

    const result = await search(query);

    if (!result.results.length)
        return "چیزی پیدا نکردم.";

    return result.results[0].description;
}

// endpoint روبیکا
app.post("/webhook", async (req, res) => {

    res.sendStatus(200);

    try {

        const update = req.body.update;

        if (!update?.new_message)
            return;

        const chatId = update.chat_id;

        const text =
            update.new_message.text || "";

        if (text === "/start") {

            await sendMessage(
                chatId,
                `✅ بات فعال است

دستورات:

ربات سلام
ربات معنی football
ربات رونالدو
ربات 10+20`
            );

            return;
        }

        if (!text.startsWith("ربات"))
            return;

        const question =
            text.replace(/^ربات\s*/, "")
            .trim();

        if (question === "سلام") {

            await sendMessage(
                chatId,
                "سلام 👋"
            );

            return;
        }

        const math =
            calculate(question);

        if (math !== null) {

            await sendMessage(
                chatId,
                `✅ جواب: ${math}`
            );

            return;
        }

        if (question.startsWith("معنی ")) {

            const word =
                question.replace("معنی ", "");

            const answer =
                await getMeaning(word);

            await sendMessage(
                chatId,
                answer
            );

            return;
        }

        const result =
            await searchWeb(question);

        await sendMessage(
            chatId,
            result
        );

    } catch (err) {

        console.log(err.message);
    }
});

const PORT =
    process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Running on ${PORT}`);
});
