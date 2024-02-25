const Discord = require("discord.js");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const dotenv = require("dotenv"); 
dotenv.config(); 

const Token = process.env.TOKEN; 
const geminiAPIKey = process.env.API_TOKEN; 
const channelID = "1211289013198135296"; 
const logChannelID = "1211292780974841876";

const genAI = new GoogleGenerativeAI(geminiAPIKey);

const client = new Discord.Client({
    intents: [
        Discord.IntentsBitField.Flags.Guilds,
        Discord.IntentsBitField.Flags.GuildMessages,
        Discord.IntentsBitField.Flags.MessageContent,
        Discord.IntentsBitField.Flags.DirectMessages
    ],
});

client.on("ready", () => {
    console.log(`Logged in as ${client.user.tag}!`); 
});

client.on("messageCreate", async (message) => {
    if (message.author.bot || message.channel.id !== channelID) return; 

    if (!message.content.startsWith(".rat")) return;

    try {  
        await message.channel.sendTyping(); 

        const model = genAI.getGenerativeModel({ model: "gemini-pro"});
        const prompt = message.content.slice(".rat".length).trim(); 

        const generationConfig = { temperature: 0.6, top_p: 0.8, maxTokens: 200 }; 
        const result = await model.generateContent(prompt, generationConfig); 
        const response = await result.response; 
        let text = response.text();

        // Rattify!
        text = text.replace(/I /g, "Squeak, I, "); 
        // text += " *Scampers off to eat cheese*"; 

        // Embed for richer response
        const embed = new Discord.EmbedBuilder()
            .setColor(0xf1c40f) // Cheesy yellow
            .setTitle("The Rat Squeals:")
            .setDescription(text)
            .setFooter({ text: "Scampers off to eat cheese" });

        // Reply to the user
        await message.reply({ embeds: [embed] });

        // Send log message
        const logChannel = client.channels.cache.get(logChannelID);
        if (logChannel) {
            logChannel.send(`**User:** ${message.author.tag}\n**Prompt:** ${prompt}\n**Response:** ${text}`);
        }

    } catch (error) {
        console.error("Error generating response:", error); 
        console.error(error.message); 
        message.channel.send("Oops, my rat brain malfunctioned. Try again later!"); 
    } 
});

client.login(Token); 
