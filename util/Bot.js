import { Client, Intents, Message, Permissions, Channel } from 'discord.js'
import config from '../data/config.json' assert {type: 'json'}

class Bot {
    client = undefined
    commands = {}
    onJoinRoles = []

    constructor() {
        this.client = new Client({
            intents: [
                Intents.FLAGS.GUILDS,
                Intents.FLAGS.GUILD_BANS,
                Intents.FLAGS.GUILD_EMOJIS_AND_STICKERS,
                Intents.FLAGS.GUILD_INTEGRATIONS,
                Intents.FLAGS.GUILD_INVITES,
                Intents.FLAGS.GUILD_MEMBERS,
                Intents.FLAGS.GUILD_MESSAGES,
                Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
                Intents.FLAGS.GUILD_MESSAGE_TYPING,
                Intents.FLAGS.GUILD_PRESENCES,
                Intents.FLAGS.GUILD_SCHEDULED_EVENTS,
                Intents.FLAGS.GUILD_VOICE_STATES,
                Intents.FLAGS.GUILD_WEBHOOKS
            ]
        })

        this.client.once('ready', () => {
            console.log('The Oppressor is ready.')
            this.client.on('messageCreate', (message) => {
                this.parseMessage(message)
            })
        })
    }

    login() {
        this.client.login(config.token)
    }

    /**
     * Parse message
     * @param {Message} message 
     */
    parseMessage(message) {
        if (message.content.substring(0, 1) != config.prefix || message.content.length == 1) {
            return
        }

        let commandString = message.content.substring(1).toLowerCase().split(" ")[0]
        let commandArguments = message.content.substring(1).toLowerCase().split(" ")
        commandArguments.splice(0, 1)
        this.executeCommand(commandString, message, commandArguments)
    }

    /**
     * Add Command
     * @param {String} commandString 
     * @param {function} callback 
     */
    addCommand(commandString, callback) {
        this.commands[commandString.toLowerCase()] = callback
    }

    /**
     * 
     * @param {String} commandString
     * @param {Message} message 
     */
    executeCommand(commandString, message, args) {
        try {
            if (this.commands[commandString]) {
                this.commands[commandString](message, args)
                return
            } 

            message.channel.send('Invalid command.')
        } catch (e) {

        }
    }

    /**
     * 
     * @param {Message} message 
     */
    sendUnauthorizedUseWarning(message) {
        message.channel.send(`<@${message.author.id}>, You do not have permission to use this command.`)
    }

    /**
     * 
     * @param {Message} message 
     * @returns {Boolean}
     */
    isMemberAdmin(message) {
        return message.member.permissions.has(Permissions.FLAGS.ADMINISTRATOR)
    }

    /**
     * 
     * @param {String} roleSnowflake 
     */
    addOnJoinRole(roleSnowflake) {
        this.onJoinRoles.push(roleSnowflake)
    }

    /**
     * 
     * @returns {Channel} admin channel
     */
    async getAdminLogsChannel() {
        return await this.client.channels.fetch(config.channels.adminLogs)
    }

    /**
     * 
     * @returns {Channel} user events channel
     */
    async getUserEventsChannel() {
        return await this.client.channels.fetch(config.channels.userEvents)
    }

    /**
     * 
     * @returns {Channel} bug logs channel
     */
    async getBugLogsChannel() {
        return await this.client.channels.fetch(config.channels.bugLogs)
    }
}

export default Bot