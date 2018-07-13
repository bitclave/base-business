"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const bitclave_base_1 = require("bitclave-base");
const CompareResult_1 = __importDefault(require("../models/CompareResult"));
const PayResult_1 = __importDefault(require("../models/PayResult"));
const TxState_1 = require("./transfer/TxState");
class WorthValidator {
    constructor(offerShareDataRepository, offerSearchRepository, base, comparator, tokenTransfer, rewardLogger) {
        this.REPEAT_TIME = 1000; //3600000;
        this.offerShareDataRepository = offerShareDataRepository;
        this.offerSearchRepository = offerSearchRepository;
        this.base = base;
        this.comparator = comparator;
        this.tokenTransfer = tokenTransfer;
        this.rewardLogger = rewardLogger;
        this.syncDataShareWithDelay(base.accountManager.getAccount().publicKey);
    }
    syncDataShareWithDelay(businessPublicKey) {
        console.log(`wait before sync. wait ${this.REPEAT_TIME} ms`);
        setTimeout(() => this.syncShareData(businessPublicKey), this.REPEAT_TIME);
    }
    syncShareData(businessPublicKey) {
        console.log('sync process...');
        this.getOfferShareData(businessPublicKey)
            .then((result) => result.map(this.compareData.bind(this)))
            .then(promise => Promise.all(promise))
            .then((result) => result.map(this.payReward.bind(this)))
            .then(promise => Promise.all(promise))
            .then(this.saveRewardLogs.bind(this))
            .then(() => {
            console.log('check shared data success');
            this.syncDataShareWithDelay(businessPublicKey);
        })
            .catch(reason => {
            console.log('get error:', reason);
            this.syncDataShareWithDelay(businessPublicKey);
        });
    }
    async getOfferShareData(businessPublicKey) {
        const exclude = await this.checkRewardLogs();
        const shareData = await this.offerShareDataRepository
            .getShareData(businessPublicKey, false);
        return shareData.filter(data => exclude.indexOf(data.offerSearchId) == -1);
    }
    async checkRewardLogs() {
        const payResults = await this.rewardLogger.getLogs();
        for (let item of payResults) {
            if (item.compareResult.state && item.transaction.nonce != 0) {
                const state = await this.tokenTransfer
                    .checkTransactionState(item.transaction.hash);
                if (!item.accepted) {
                    try {
                        await this.offerShareDataRepository.acceptShareData(item.compareResult.offerSearchId, item.compareResult.worth);
                        item.accepted = true;
                    }
                    catch (e) {
                        console.log('try accept offer share data fail!: ', e);
                    }
                }
                if (state == TxState_1.TxState.FAIL) {
                    const result = await this.payReward(item.compareResult);
                    payResults.splice(payResults.indexOf(item), 1, result);
                }
                else if (state == TxState_1.TxState.SUCCESS && item.accepted) {
                    payResults.splice(payResults.indexOf(item), 1);
                }
            }
        }
        await this.rewardLogger.saveLogs(payResults);
        return payResults.map(value => value.compareResult.offerSearchId);
    }
    async saveRewardLogs(items) {
        const mergeMap = new Map();
        const payResults = await this.rewardLogger.getLogs();
        payResults.forEach(value => mergeMap.set(value.compareResult.offerSearchId, value));
        items.filter(value => value.compareResult.state && value.transaction.nonce > 0)
            .forEach(value => mergeMap.set(value.compareResult.offerSearchId, value));
        await this.rewardLogger.saveLogs(Array.from(mergeMap.values()));
    }
    async compareData(offerShareData) {
        const result = new CompareResult_1.default(false, '', offerShareData.offerSearchId, offerShareData.worth);
        console.log('try compare data. offerSearchId: ', offerShareData.offerSearchId);
        try {
            const clientData = await this.base
                .profileManager
                .getAuthorizedData(offerShareData.clientId, offerShareData.clientResponse);
            const clearClientData = new Map();
            clientData.forEach((value, key) => {
                if (key != bitclave_base_1.WalletManagerImpl.DATA_KEY_ETH_WALLETS) {
                    clearClientData.set(key, value);
                }
            });
            try {
                result.ethWallet = this.getEthAddressForReward(clientData);
            }
            catch (e) {
                console.log(e);
            }
            const searchResult = await this.offerSearchRepository
                .getOfferSearchItem(offerShareData.clientId, offerShareData.offerSearchId);
            searchResult.offer
                .rules
                .delete(bitclave_base_1.WalletManagerImpl.DATA_KEY_ETH_WALLETS);
            searchResult.offer
                .compare
                .delete(bitclave_base_1.WalletManagerImpl.DATA_KEY_ETH_WALLETS);
            const compareResult = await this.comparator
                .compare(searchResult.offer, clearClientData);
            const compareKeys = Array.from(compareResult.values());
            const countOfValid = compareKeys
                .filter(value => value === true).length;
            result.state = compareKeys.length == countOfValid && result.ethWallet.length > 0;
        }
        catch (e) {
            console.log('compare data error: ', e);
        }
        return result;
    }
    async payReward(compareResult) {
        const result = new PayResult_1.default(compareResult);
        if (!compareResult.state) {
            return result;
        }
        try {
            console.log(`try pay to wallet address: ${compareResult.ethWallet}; 
                search request id: ${compareResult.offerSearchId};
                worth: ${compareResult.worth}`);
            console.log('call transfer');
            result.transaction = await this.tokenTransfer.transfer(compareResult.worth, compareResult.ethWallet);
            console.log('update share data status');
            await this.offerShareDataRepository.acceptShareData(compareResult.offerSearchId, compareResult.worth);
            result.accepted = true;
            console.log('pay success');
        }
        catch (e) {
            console.log('pay fail! cause:', e);
        }
        return result;
    }
    getEthAddressForReward(clientData) {
        const walletsValue = clientData.get(bitclave_base_1.WalletManagerImpl.DATA_KEY_ETH_WALLETS);
        if (walletsValue != null) {
            let walletRecords;
            try {
                walletRecords = Object.assign(new bitclave_base_1.WalletsRecords([], ''), JSON.parse(walletsValue));
            }
            catch (e) {
                throw 'invalid wallets records';
            }
            const validator = this.base.walletManager['baseSchema'];
            const validWallets = validator.validateWallets(walletRecords);
            if (!validWallets) {
                throw 'invalid wallets records';
            }
            const records = walletRecords.data;
            if (records.length <= 0) {
                throw 'Client does not have a wallet';
            }
            const pair = Object.assign(new bitclave_base_1.BaseAddrPair('', ''), JSON.parse(records[0].data));
            return pair.ethAddr;
        }
        else {
            throw 'Business does not have permission for a wallet data';
        }
    }
}
exports.default = WorthValidator;
//# sourceMappingURL=WorthValidator.js.map