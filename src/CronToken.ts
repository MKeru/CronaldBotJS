// crontoken methods to check if user has enough tokens, add tokens, remove tokens, etc

import { Tokens } from "./database/database";

export async function CheckBalance(interaction: any, cost: number) {
    // check if user has enough tokens
    const userAccount = await Tokens.findOne({ where: { guildId: interaction.guild.id, userId: interaction.user.id } });
    if (userAccount.tokens < cost) {
        // the user does not have enough tokens
        return false;
    }
    // the user has enough tokens
    return true;
}

export async function AddTokens(interaction: any, amount: number) {
    // add tokens to user
    const userAccount = await Tokens.findOne({ where: { guildId: interaction.guild.id, userId: interaction.user.id } });
    await userAccount.increment('tokens', { by: amount });
}

// unused, use AddTokens with negative number instead
export async function RemoveTokens(interaction: any, amount: number) {
    // remove tokens from user
    const userAccount = await Tokens.findOne({ where: { guildId: interaction.guild.id, userId: interaction.user.id } });
    await userAccount.decrement('tokens', { by: amount });
}

export async function SetTokens(interaction: any, amount: number) {
    // set tokens to user
    const userAccount = await Tokens.findOne({ where: { guildId: interaction.guild.id, userId: interaction.user.id } });
    await userAccount.update({ tokens: amount });
}

export async function GetTokens(interaction: any) {
    // get tokens from user
    const userAccount = await Tokens.findOne({ where: { guildId: interaction.guild.id, userId: interaction.user.id } });
    return userAccount.tokens;
}

// drop from table where guildId = guild.id and userId = user.id
export async function DeleteUser(interaction: any) {
    await Tokens.destroy({ where: { guildId: interaction.guild.id, userId: interaction.user.id } });
}