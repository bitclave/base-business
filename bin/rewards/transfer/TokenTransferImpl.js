"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const TxState_1 = require("./TxState");
const Transaction_1 = __importDefault(require("./Transaction"));
const EthAddressUtils_1 = __importDefault(require("../../utils/EthAddressUtils"));
const BigNumber = require('bignumber.js');
const Abi = require('ethereumjs-abi');
const Tx = require('ethereumjs-tx');
class TokenTransferImpl {
    constructor(web3, nonceHelper, walletPrivateKey, contractAddress, gasLimit, gasPrice, networkId) {
        this.TOKEN_INCREASE = new BigNumber(10).pow(18);
        this.web3 = web3;
        this.nonceHelper = nonceHelper;
        this.walletPrivateKey = Buffer.from(walletPrivateKey, 'hex');
        this.walletAddress = EthAddressUtils_1.default.getAddressByPrivateKey(walletPrivateKey);
        this.contractAddress = contractAddress;
        this.gasLimit = gasLimit;
        this.gasPrice = gasPrice;
        this.networkId = networkId;
    }
    async transfer(value, address) {
        if (!this.web3.utils.isAddress(address)) {
            throw 'incorrect wallet address';
        }
        const bnValue = new BigNumber(value);
        if (bnValue.isLessThanOrEqualTo(0)) {
            throw 'value for reward too small';
        }
        const amount = bnValue.multipliedBy(this.TOKEN_INCREASE);
        await this.validateTokensAmount(amount, this.walletAddress, this.contractAddress);
        await this.validateEth(this.walletAddress);
        const data = Abi.simpleEncode('transfer(address,uint256)', address, this.toHex(amount));
        while (true) {
            const result = await this.sendRawTransaction(data, this.walletPrivateKey, this.walletAddress, this.contractAddress, await this.nonceHelper.getNonce(), this.gasPrice, this.gasLimit, this.networkId).catch((reason) => {
                const isTooLow = reason.message.toLowerCase().indexOf('nonce too low') > 0;
                if (!isTooLow) {
                    throw reason;
                }
                else {
                }
            });
            await this.nonceHelper.increaseNonce();
            if (result != null) {
                return result;
            }
        }
    }
    async checkTransactionState(hash) {
        try {
            const receipt = await this.web3.eth.getTransactionReceipt(hash);
            if (receipt == null) {
                return TxState_1.TxState.PROGRESS;
            }
            return receipt.blockNumber > 0 && (receipt.status.toString() == 'true')
                ? TxState_1.TxState.SUCCESS
                : TxState_1.TxState.FAIL;
        }
        catch (e) {
            //ignore
        }
        return TxState_1.TxState.FAIL;
    }
    async validateTokensAmount(amount, address, contractAddress) {
        const data = Abi.simpleEncode('balanceOf(address):(uint256)', address);
        const hexBalance = await this.web3.eth.call({
            to: contractAddress,
            data: '0x' + data.toString('hex')
        });
        const bnBalance = new BigNumber(hexBalance, 16);
        if (bnBalance.isLessThan(amount)) {
            throw 'CAT balance is low';
        }
    }
    async validateEth(address) {
        const balance = await this.web3.eth.getBalance(address);
        const eth = new BigNumber(this.web3.utils.fromWei(balance, 'ether'));
        if (eth.isLessThan(0.0001)) {
            throw 'Eth balance is low';
        }
    }
    sendRawTransaction(data, privateKey, walletAddress, contractAddress, nonce, gasPrice, gasLimit, networkId) {
        return new Promise((resolve, reject) => {
            const rawTx = {
                nonce: this.toHex(nonce),
                from: walletAddress,
                to: contractAddress,
                value: '0x0',
                data: data,
                gasPrice: this.toHex(gasPrice),
                gasLimit: this.toHex(gasLimit),
                chainId: this.toHex(networkId)
            };
            const tx = new Tx(rawTx);
            tx.sign(privateKey);
            const serializedTx = tx.serialize();
            const event = this.web3.eth.sendSignedTransaction('0x' + serializedTx.toString('hex'));
            event.on('transactionHash', (hash) => {
                console.log('hash', hash);
                resolve(new Transaction_1.default(hash, nonce));
            });
            event.on('error', (error) => {
                console.log(error);
                reject(error);
            });
        });
    }
    toHex(value) {
        return this.web3.utils.toHex(value);
    }
}
exports.default = TokenTransferImpl;
//# sourceMappingURL=TokenTransferImpl.js.map