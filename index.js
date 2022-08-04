// The Oppressor
import config from './data/config.json' assert {type: 'json'}
import Bot from './util/Bot.js'
import { MessageEmbed } from 'discord.js'

let oppressor = new Bot()

oppressor.addOnJoinRole(config.roles.normalBoy)

oppressor.addCommand('gamble', async (message) => {
    try {
        let random = Math.floor(Math.random() * 100)

        if (random == 0) {
            let victim = await message.guild.members.fetch(message.author.id)
            victim.roles.add(config.roles.badBoy)
            victim.roles.remove(config.roles.normalBoy)
            message.channel.send(`<@${message.author.id}> has won the gamble (Rolled a ${random})`)
        } else {
            message.channel.send(`<@${message.author.id}> has lost the gamble (Rolled a ${random})`)
        }
    } 
    
    catch (error) {
        let bugLogsChannel = await oppressor.getBugLogsChannel()
        bugLogsChannel.send(`\`\`\`${error}\`\`\``)
    }
})

oppressor.addCommand('postrulesembed', async (message) => {
    if (!oppressor.isMemberAdmin(message)) {
        oppressor.sendUnauthorizedUseWarning(message)
        return
    }

    let embed = new MessageEmbed()
    let oppressorRole = await message.guild.roles.botRoleFor(oppressor.client.user)

    embed.setColor(oppressorRole.color)
    embed.setTitle('Unreasonable Server Rules')
    embed.setDescription(config.rules.join('\n\n'))

    message.channel.send({embeds: [embed]})
})

oppressor.addCommand('purge', async (message, args) => {
    try {
        if (!oppressor.isMemberAdmin(message)) {
            oppressor.sendUnauthorizedUseWarning(message)
            return
        }

        await message.channel.messages.fetch({limit: args[0]})
            .then(async messages => {
                for (let m of messages) {
                    await sleep(1000)
                    m[1].delete()
                }

                message.channel.send(`Purged \`${messages.size}\` messages.`)
            })
            .catch(console.error)
    } 
    
    catch (error) {
        let bugLogsChannel = await oppressor.getBugLogsChannel()
        bugLogsChannel.send(`\`\`\`${error}\`\`\``)
    }
})

oppressor.client.on('guildMemberAdd', async (member) => {
    for (let snowflake of oppressor.onJoinRoles) {
        member.roles.add(snowflake, 'Default role on user join.')
    }

    let userEventChannel = await oppressor.getUserEventsChannel()
    userEventChannel.send(`User ${member.user.tag} has joined.`)
})

oppressor.client.on('guildMemberRemove', async (member) => {
    let userEventChannel = await oppressor.getUserEventsChannel()
    userEventChannel.send(`User ${member.user.tag} has left.`)
})

oppressor.client.on('messageDelete', async (message) => {
    let adminLogsChannel = await oppressor.getAdminLogsChannel()

    let messageDate = message.createdAt
    let currentDate = new Date()

    let embed = new MessageEmbed()
    let oppressorRole = await message.guild.roles.botRoleFor(oppressor.client.user)
    embed.setColor(oppressorRole.color)
    embed.setTitle('Message Deletion')
    embed.addField('Author', message.author.tag, true)
    embed.addField('Creation date (UTC)', `${messageDate.getUTCMonth()}/${messageDate.getUTCDate()}/${messageDate.getUTCFullYear()} @ ${messageDate.getUTCHours()}:${messageDate.getUTCMinutes()}:${messageDate.getUTCSeconds()}`, true)
    embed.addField('Deletion date (UTC)', `${currentDate.getUTCMonth()}/${currentDate.getUTCDate()}/${currentDate.getUTCFullYear()} @ ${currentDate.getUTCHours()}:${currentDate.getUTCMinutes()}:${currentDate.getUTCSeconds()}`, true)
    embed.addField('Message channel', `<#${message.channelId}>`)

    if (message.content.length != 0) {
        embed.addField('Message content', message.content)
    }

    if (message.embeds.length != 0) {
        embed.addField('Message embeds', 'Embedded message(s) will follow.')
    }

    adminLogsChannel.send({ embeds: [embed] })

    if (message.embeds.length != 0) {
        for (let e of message.embeds) {
            adminLogsChannel.send({ embeds: [e] })
        }
    }
}) 

oppressor.client.on('messageUpdate', async (oldMessage, newMessage) => {
    try {
        let adminLogsChannel = await oppressor.getAdminLogsChannel()

        let messageDate = oldMessage.createdAt
        let currentDate = new Date()

        let embed = new MessageEmbed()
        let oppressorRole = await oldMessage.guild.roles.botRoleFor(oppressor.client.user)
        embed.setColor(oppressorRole.color)
        embed.setTitle('Message Edit')
        embed.addField('Author', oldMessage.author.tag, true)
        embed.addField('Creation date (UTC)', `${messageDate.getUTCMonth()}/${messageDate.getUTCDate()}/${messageDate.getUTCFullYear()} @ ${messageDate.getUTCHours()}:${messageDate.getUTCMinutes()}:${messageDate.getUTCSeconds()}`, true)
        embed.addField('Edit date (UTC)', `${currentDate.getUTCMonth()}/${currentDate.getUTCDate()}/${currentDate.getUTCFullYear()} @ ${currentDate.getUTCHours()}:${currentDate.getUTCMinutes()}:${currentDate.getUTCSeconds()}`, true)
        embed.addField('Message channel', `<#${oldMessage.channelId}>`)
        embed.addField('Message content', oldMessage.content)
        embed.addField('Message content after edit', newMessage.content)

        adminLogsChannel.send({embeds: [embed]})
    } 
    
    catch (error) {
        let bugLogsChannel = await oppressor.getBugLogsChannel()
        bugLogsChannel.send(`\`\`\`${error}\`\`\``)
    }
})

oppressor.login()

function sleep(ms) {
    return new Promise(r => setTimeout(r, ms));
}