// Options
const serverIP = "";
const version = "1.8";
const amount = 10;

/// Bot information
const CLIENT_ID = "CLIENT_ID_HERE";
const TOKEN = "TOKEN_HERE";

// discord.js imports
const { Client, GatewayIntentBits, REST, Routes } = require("discord.js");
const client = new Client({ intents: [GatewayIntentBits.Guilds] });

// Mineflayer imports
const mineflayer = require("mineflayer");
const lll = [];

// Bot commands
const commands = [
  {
    name: "lobbylock",
    description: "Lobbylocks a person",
    options: [
      {
        name: "username",
        type: 3,
        description: "Username of the person you want to lobbylock",
        required: true,
      },
    ],
  },
  {
    name: "unlobbylock",
    description: "unlobbylocks a person",
    options: [
      {
        name: "username",
        type: 3,
        description: "Username of the person you want to lobbylock",
        required: true,
      },
    ],
  },
  {
    name: "lobbylocklist",
    description: "List of people who are currently lobbylocked",
  },
];

// Register commands to discord's API
const rest = new REST({ version: "10" }).setToken(TOKEN);

try {
  rest.put(Routes.applicationCommands(CLIENT_ID), { body: commands });
} catch (error) {
  console.error(error);
}

// Logs when bot is online
client.on("ready", () => {
  console.log(`[KILLSWITCH] Now online.`);
});

// Commands function
client.on("interactionCreate", async (interaction) => {
  // slash commands are so gay
  if (!interaction.isChatInputCommand()) return;

  // Make life a bit easier
  const { commandName, options } = interaction;

  // Lobbylock function
  if (commandName === "lobbylock") {
    var user = options.getString("username");
    if (lll.length > amount - 1) {
      await interaction.reply(
        `You have exceeded the limit of ${amount} people.`
      );
    } else {
      if (lll.indexOf(user) !== -1) {
        await interaction.reply(`${user} already exists!`);
      } else {
        lll.push(user);
        initBot(user);
        await interaction.reply(`Now lobby locking ${user}.`);
      }
    }
  }

  // Unlobbylock function
  if (commandName === "unlobbylock") {
    var user = options.getString("username");
    if (lll.indexOf(user) !== -1) {
      lll.splice(lll.indexOf(user), 1);
      await interaction.reply(`I have stopped lobby locking ${user}.`);
    } else {
      await interaction.reply(`${user} doesnt exist!`);
    }
  }

  // Lobbylock list function
  if (commandName === "lobbylocklist") {
    await interaction.reply(`List [${lll.length}/${amount}]: ${lll}`);
  }
});

// the funni begins
function initBot(user) {
  // Check if user is in the list
  if (lll.indexOf(user) !== -1) {
    var bot = mineflayer.createBot({
      host: serverIP,
      username: user,
      version: version,
    });

    // Alert console that username has logged on
    bot.on("login", function () {
      console.log(`[KILLSWITCH] ${user} has logged in.`);
      // This is apart of the bypass, if you want to use this and change the time it waits before disconnecting, change "110" to whatever you like (it converts to ms by * 1000)
      // If you don't want the bypass then comment out the setTimeout or remove it entirely
      setTimeout(() => {
        bot.quit();
      }, 110 * 1000);
    });

    // Attempt to reconnect username when disconnection happens
    bot.on("end", function (reason) {
      console.log(`[KILLSWITCH] ${user} has disconnected. Reconnecting...`);
      initBot(user);
    });
  } else {
    // Alert console that username is no longer being lobby locked
    console.log(`[KILLSWITCH] ${user} is no longer being lobby locked.`);
  }
}

client.login(TOKEN);
