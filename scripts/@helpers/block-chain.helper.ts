import { BigNumber, BigNumberish, Wallet } from 'ethers';
import { ethers } from 'hardhat';
import { configEnv } from '../@config';

import { createReadStream, writeFileSync } from "fs";
import readline from "readline";

const { utils, constants, provider } = ethers;

// await provider.send("evm_increaseTime", [10]) // add 10 seconds
// await provider.send("evm_mine", []) // force mine the next block


export async function advanceBlock() {
    return provider.send('evm_mine', [])
}

export async function advanceBlockTo(blockNumber: number) {
    for (let i = await provider.getBlockNumber(); i < blockNumber; i++) {
        await advanceBlock()
    }
}

export async function increaseTime(second: number = 0) {
    await provider.send("evm_increaseTime", [second]);
}

// time unit to  seconds
export async function increaseTimeTo(targetTime: number = 0) {
    const { timestamp: timeNow } = await getNowBlock();
    if (targetTime > timeNow) {
        await provider.send("evm_increaseTime", [targetTime - timeNow]);
        await provider.send('evm_mine', [])
    }

}




export function stringDateToUTCDate(dateStr: string) {
    const inputDate = new Date(dateStr);
    return new Date(inputDate.getTime() - inputDate.getTimezoneOffset() * 60000);
}

export async function getNowBlock() {
    const curentBlock = await provider.getBlockNumber();
    const block = await provider.getBlock(curentBlock);
    return block;
}

export async function getNowTimestamp() {
    const block = await getNowBlock();
    return block.timestamp;

}

export async function getBlockNumberByTime(targetDate: Date, nowBlock: any): Promise<number> {
    const nowBlockSeconds = nowBlock.timestamp;
    const targetSeconds = Math.floor(targetDate.getTime() / 1000);
    const incBlockNumber = Math.floor((targetSeconds - nowBlockSeconds) / 3);
    return nowBlock.number + incBlockNumber;
}


export const parseAmountToken = (amount: string | number, decimal: number = 18) => {
    return utils.parseUnits(amount.toString(), decimal)
}
export const formatAmountToken = (amount: BigNumberish, decimal: number = 18) => {
    return utils.formatUnits(amount, decimal)
}

export const dateStrToSeconds = (dateStr: string) => {
    return Math.floor(stringDateToUTCDate(dateStr).getTime() / 1000);
}

export const delayTime = (ms: number = 3000) => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve("Ok")
        }, ms);
    })
}

export const pipeError = (ex: any) => {
    const { NETWORK_PROVIDER } = configEnv();
    const transactionHash = ex.transactionHash || "";
    return {
        reason: ex.reason || ex.message || "Lỗi không xác định",
        code: ex.code || 'UNKNOWN',
        link: `${NETWORK_PROVIDER.URL_SCAN}/tx/${transactionHash}`
    }
}



export const readTextToJson = async (body: { pathFile: string, keyIndexObj: string[] }) => {
    const { pathFile, keyIndexObj = [] } = body;
    const readInterface = readline.createInterface({
        input: createReadStream(pathFile),
    });

    const outputs = [];
    for await (const line of readInterface) {
        const parts = line.split(/\s/g);


        const item = {};
        for (let index = 0; index < keyIndexObj.length; index++) {

            const key = keyIndexObj[index].trim();
            const value = parts[index].trim();
            Object.assign(item, {
                [key]: value
            })
        }
        outputs.push(item);
    }
    return outputs;
}

