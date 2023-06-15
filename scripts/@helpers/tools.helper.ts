import { BigNumber, Contract, Wallet } from 'ethers';
import { ethers } from 'hardhat';
import { ERC20__factory, ERC20, ERC721__factory, ERC721 } from '../../typechain';
import { configEnv } from '../@config';
import { writeFileSync } from "fs";
import { pipeError } from './block-chain.helper';
import { formatEther } from 'ethers/lib/utils';

const { utils, constants, provider } = ethers;
const { TOKEN_ADDRESS, NETWORK_PROVIDER } = configEnv();
const { URL_SCAN } = NETWORK_PROVIDER;
// const { BUSD, BNB } = TOKEN_ADDRESS;

const connectWallet = (privateKey: string) => {
    const hexPrivateKey = privateKey.startsWith("0x") ? privateKey : `0x${privateKey}`;
    const account = new Wallet(hexPrivateKey).connect(provider);
    return account;
}

const makeERC20 = (tokenAddress: string) => {
    return new Contract(
        tokenAddress,
        ERC20__factory.abi,
        provider
    ) as ERC20;
}

const makeERC721 = (tokenAddress: string) => {
    return new Contract(
        tokenAddress,
        ERC721__factory.abi,
        provider
    ) as ERC721;
}


// const checkBalance = async (body: {
//     wallets: { privateKey: string, [key: string]: any }[],
//     tokenAddress: string;
//     tokenSymbol: string;
// }) => {
//     const { tokenAddress, tokenSymbol, wallets } = body;
//     const getBalance = async (sender: Wallet) => {
//         const tokenCt = makeERC20(tokenAddress);
//         const busdCt = makeERC20(BUSD);

//         const [bnb, busd, token] = await Promise.all([
//             sender.getBalance(),
//             busdCt.balanceOf(sender.address),
//             tokenCt.balanceOf(sender.address),
//         ])

//         return {
//             bnb, busd, token,
//         }

//     }

//     const promises = [];
//     for (const { privateKey } of wallets) {
//         const sender = connectWallet(privateKey);
//         promises.push(getBalance(sender))
//     }

//     const data = await Promise.all(promises);

//     const { bnb, busd, token } = data.reduce((result, item) => {
//         result["bnb"] = (result["bnb"] as BigNumber).add(item["bnb"]);
//         result["busd"] = (result["busd"] as BigNumber).add(item["busd"]);
//         result["token"] = (result["token"] as BigNumber).add(item["token"]);
//         return result;
//     }, {
//         bnb: BigNumber.from(0), busd: BigNumber.from(0), token: BigNumber.from(0)
//     })

//     const output = {
//         totalBNB: formatEther(bnb),
//         totalBUSD: formatEther(busd),
//         [`total${tokenSymbol.toUpperCase()}`]: formatEther(token),
//     }

//     console.log('-------------------');
//     console.log(output);
//     console.log('-------------------');
//     return output;
// }


const sendNft = async (body: {
    sender: Wallet;
    nftAddress: string,
    tokenId: number,
    receiptAddress: string
}) => {
    const { nftAddress, tokenId, receiptAddress, sender } = body;
    if (!utils.isAddress(receiptAddress)) {
        throw new Error(`${receiptAddress} invalid address`)
    }
    const nftCt = new Contract(
        nftAddress,
        ERC721__factory.abi,
        provider
    ) as ERC721;
    try {
        const tx = await nftCt.connect(sender).transferFrom(sender.address, receiptAddress, tokenId);
        const receipt = await tx.wait();
        const txHash = `${URL_SCAN}/tx/${receipt.transactionHash}`.trim();
        console.log('-------------------');
        console.log(txHash);
        console.log('-------------------');
        return {
            status: "SUCCESS",
            senderAddress: sender.address,
            txHash,
            receiptAddress,
            nftAddress,
            tokenId
        }
    } catch (error) {
        return {
            status: "ERROR",
            senderAddress: sender.address,
            txHash: "",
            receiptAddress,
            nftAddress,
            tokenId
        }
    }
}

const sendBNB = async (body: {
    sender: Wallet;
    receiptAddress: string;
    amount: BigNumber
}) => {
    const { sender, receiptAddress, amount } = body;
    try {
        const tx = await sender.sendTransaction({
            to: receiptAddress,
            value: amount,
        })
        const receipt = await tx.wait();
        const txHash = `${URL_SCAN}/tx/${receipt.transactionHash}`.trim();
        console.log('-------------------');
        console.log(txHash);
        console.log('-------------------');
        return {
            status: "SUCCESS",
            senderAddress: sender.address,
            txHash,
            receiptAddress,
            amount: formatEther(amount)
        }
    } catch (error) {
        console.log('-------------------');
        console.log(pipeError(error));
        console.log('-------------------');
        return {
            status: "ERROR",
            senderAddress: sender.address,
            txHash: "",
            receiptAddress,
            amount: formatEther(amount),
            error: pipeError(error)
        }
    }
}


const sendToken = async (body: {
    sender: Wallet;
    tokenAddress: string;
    amount: BigNumber,
    receiptAddress: string
}) => {
    const { tokenAddress, amount, receiptAddress, sender } = body;
    const tokenCt = makeERC20(tokenAddress);
    try {
        if (!utils.isAddress(receiptAddress)) {
            throw new Error(`${receiptAddress} invalid address`)
        }
        const tx = await tokenCt.connect(sender).transfer(receiptAddress, amount);
        const receipt = await tx.wait();
        const txHash = `${URL_SCAN}/tx/${receipt.transactionHash}`.trim();
        console.log('-------------------');
        console.log(txHash);
        console.log('-------------------');
        return {
            status: "SUCCESS",
            senderAddress: sender.address,
            txHash,
            receiptAddress,
            tokenAddress,
        }
    } catch (error) {
        console.log('-------------------');
        console.log(pipeError(error));
        console.log('-------------------');
        return {
            status: "ERROR",
            senderAddress: sender.address,
            txHash: "",
            receiptAddress,
            tokenAddress,
            error: pipeError(error)
        }
    }
}
const sendTokenFullBalance = async (body: {
    sender: Wallet;
    tokenAddress: string;
    receiptAddress: string
}) => {
    const { tokenAddress, receiptAddress, sender } = body;
    if (!utils.isAddress(receiptAddress)) {
        throw new Error(`${receiptAddress} invalid address`)
    }
    const tokenCt = new Contract(
        tokenAddress,
        ERC20__factory.abi,
        provider
    ) as ERC20;
    try {
        const amount: BigNumber = await tokenCt.balanceOf(sender.address);
        if (amount.lte(0)) {
            throw "Empty balance";
        }
        const tx = await tokenCt.connect(sender).transfer(receiptAddress, amount);
        const receipt = await tx.wait();
        const txHash = `${URL_SCAN}/tx/${receipt.transactionHash}`.trim();
        console.log('-------------------');
        console.log(txHash);
        console.log('-------------------');
        return {
            status: "SUCCESS",
            senderAddress: sender.address,
            txHash,
            receiptAddress,
            tokenAddress,
        }
    } catch (error) {
        console.log('-------------------');
        console.log(error);
        console.log('-------------------');
        return {
            status: "ERROR",
            senderAddress: sender.address,
            txHash: "",
            receiptAddress,
            tokenAddress,
            error: pipeError(error)
        }
    }
}

const sendMultipleBnb = async (body: {
    sender: Wallet;
    prefixFileName: string;
    wallets: { address: string; amount: BigNumber;[key: string]: any }[]
}) => {

    const { sender, prefixFileName, wallets = [] } = body;
    const dataLogs = [];
    for await (const { address: receiptAddress, amount } of wallets) {
        const output = await sendBNB({
            sender,
            receiptAddress,
            amount
        });
        dataLogs.push(output);
    }
    const totalSuccess = dataLogs.filter(v => v.status === "SUCCESS").length;
    const totalError = dataLogs.filter(v => v.status !== "SUCCESS").length;
    console.log('=====SEND BNB MULTIPLE FINISH=====');

    console.log('-------------------');
    console.log({
        totalSuccess,
        totalError
    });
    console.log('-------------------');


    try {
        const fileName = `./${prefixFileName}-send-bnb-wallet${new Date().getTime()}.json`;
        writeFileSync(fileName, JSON.stringify(dataLogs));
    } catch (error) {
        console.log('-------------------');
        console.log(error);
        console.log('-------------------');
    }
}


const sendMultipleToken = async (body: {
    sender: Wallet;
    tokenAddress: string;
    tokenSymbol: string;
    listReceiptWallet: { address: string; amount: BigNumber;[key: string]: any }[],
    prefixFileName: string;
}) => {
    const { sender, tokenAddress, tokenSymbol, prefixFileName, listReceiptWallet = [] } = body;
    const dataLogs = [];
    for await (const { address: receiptAddress, amount } of listReceiptWallet) {
        const output = await sendToken({
            sender,
            receiptAddress,
            amount,
            tokenAddress,
        });
        dataLogs.push(output);
    }
    const totalSuccess = dataLogs.filter(v => v.status === "SUCCESS").length;
    const totalError = dataLogs.filter(v => v.status !== "SUCCESS").length;
    console.log(`=====SEND ${tokenSymbol} MULTIPLE FINISH=====`);

    console.log('-------------------');
    console.log({
        totalSuccess,
        totalError
    });
    console.log('-------------------');
    console.log(`=====SEND ${tokenSymbol} MULTIPLE FINISH=====`);
    try {
        const fileName = `./${prefixFileName}-send-${tokenSymbol}-wallet${new Date().getTime()}.json`;
        writeFileSync(fileName, JSON.stringify(dataLogs));
    } catch (error) {
        console.log('-------------------');
        console.log(error);
        console.log('-------------------');
    }
}


const groupMultipleBnb = async (body: {
    prefixFileName: string;
    receiptAddress: string;
    wallets: { privateKey: string; amount: BigNumber;[key: string]: any }[],
}) => {

    const { prefixFileName, wallets = [], receiptAddress } = body;
    if (!utils.isAddress(receiptAddress)) {
        throw new Error("Invalid receiptAddress")
    }

    const promises = [];
    for await (const { privateKey, amount } of wallets) {
        const sender = connectWallet(privateKey);
        promises.push(sendBNB({
            sender,
            amount,
            receiptAddress
        }))

    }
    const dataLogs = await Promise.all(promises);
    const totalSuccess = dataLogs.filter(v => v.status === "SUCCESS").length;
    const totalError = dataLogs.filter(v => v.status !== "SUCCESS").length;
    console.log('=====SEND BNB MULTIPLE FINISH=====');

    console.log('-------------------');
    console.log({
        totalSuccess,
        totalError
    });
    console.log('-------------------');

    try {
        const fileName = `./${prefixFileName}-group-bnb-wallet${new Date().getTime()}.json`;
        writeFileSync(fileName, JSON.stringify(dataLogs));
    } catch (error) {
        console.log('-------------------');
        console.log(error);
        console.log('-------------------');
    }
}




const groupMultipleToken = async (body: {
    prefixFileName: string;
    receiptAddress: string;
    tokenAddress: string;
    tokenSymbol: string;
    wallets: { privateKey: string; amount: BigNumber;[key: string]: any }[],
}) => {

    const { prefixFileName, wallets = [], receiptAddress, tokenAddress, tokenSymbol } = body;
    if (!utils.isAddress(receiptAddress)) {
        throw new Error("Invalid receiptAddress")
    }

    const promises = [];
    for await (const { privateKey, amount } of wallets) {
        const sender = connectWallet(privateKey);
        promises.push(sendToken({
            sender,
            amount,
            tokenAddress,
            receiptAddress,
        }));
    }
    const dataLogs = await Promise.all(promises);
    const totalSuccess = dataLogs.filter(v => v.status === "SUCCESS").length;
    const totalError = dataLogs.filter(v => v.status !== "SUCCESS").length;
    console.log(`=====SEND ${tokenSymbol} MULTIPLE FINISH=====`);

    console.log('-------------------');
    console.log({
        totalSuccess,
        totalError
    });
    console.log('-------------------');

    try {
        const fileName = `./${prefixFileName}-group-${tokenSymbol}-wallet${new Date().getTime()}.json`;
        writeFileSync(fileName, JSON.stringify(dataLogs));
    } catch (error) {
        console.log('-------------------');
        console.log(error);
        console.log('-------------------');
    }
}

const groupMultipleTokenFullBalance = async (body: {
    prefixFileName: string;
    receiptAddress: string;
    tokenAddress: string;
    tokenSymbol: string;
    wallets: { privateKey: string;[key: string]: any }[],
}) => {
    const { prefixFileName, wallets = [], receiptAddress, tokenAddress, tokenSymbol } = body;
    if (!utils.isAddress(receiptAddress)) {
        throw new Error("Invalid receiptAddress")
    }

    const promises = [];
    for await (const { privateKey } of wallets) {
        const sender = connectWallet(privateKey);
        promises.push(sendTokenFullBalance({
            sender,
            tokenAddress,
            receiptAddress,
        }));
    }
    const dataLogs = await Promise.all(promises);
    const totalSuccess = dataLogs.filter(v => v.status === "SUCCESS").length;
    const totalError = dataLogs.filter(v => v.status !== "SUCCESS").length;
    console.log(`=====SEND FULL BALANCE ${tokenSymbol} MULTIPLE FINISH=====`);

    console.log('-------------------');
    console.log({
        totalSuccess,
        totalError
    });
    console.log('-------------------');

    try {
        const fileName = `./${prefixFileName}-group-full-balance-${tokenSymbol}-wallet${new Date().getTime()}.json`;
        writeFileSync(fileName, JSON.stringify(dataLogs));
    } catch (error) {
        console.log('-------------------');
        console.log(error);
        console.log('-------------------');
    }
}

export {
    provider,
    connectWallet,
    makeERC20,
    makeERC721,
    // checkBalance,
    sendNft,
    sendBNB,
    sendToken,
    sendTokenFullBalance,
    sendMultipleBnb,
    sendMultipleToken,
    groupMultipleToken,
    groupMultipleBnb,
    groupMultipleTokenFullBalance,
}
