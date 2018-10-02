"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const bitclave_base_1 = __importDefault(require("bitclave-base"));
const bitclave_base_2 = require("bitclave-base");
const TokenTransferImpl_1 = __importDefault(require("./rewards/transfer/TokenTransferImpl"));
const WorthValidator_1 = __importDefault(require("./rewards/WorthValidator"));
const ComparatorImpl_1 = __importDefault(require("./rewards/comparator/ComparatorImpl"));
const ConfigProxy_1 = __importDefault(require("./configuration/ConfigProxy"));
const RewardLoggerImpl_1 = __importDefault(require("./rewards/logger/RewardLoggerImpl"));
const NonceHelperImpl_1 = __importDefault(require("./rewards/transfer/NonceHelperImpl"));
const EthAddressUtils_1 = __importDefault(require("./utils/EthAddressUtils"));
const Web3 = require('web3');
class Business {
    constructor() {
        if (!process.env.ETH_PK || !process.env.BUSINESS_PHRASE) {
            throw new Error('Public Key and Phrase are undefined');
        }
        const privateKey = process.env.ETH_PK;
        const mnemonicPhrase = process.env.BUSINESS_PHRASE;
        const hostNode = process.env.NODE_HOST || 'https://base-node-staging.herokuapp.com/';
        const config = new ConfigProxy_1.default();
        const base = new bitclave_base_1.default(hostNode, '');
        const httpTransport = new bitclave_base_2.HttpTransportImpl(hostNode);
        const offerShareDataRepository = new bitclave_base_2.OfferShareDataRepositoryImpl(httpTransport, base.accountManager, base.profileManager);
        const offerSearchRepository = new bitclave_base_2.OfferSearchRepositoryImpl(httpTransport);
        const web3 = new Web3(new Web3.providers.HttpProvider(config.getEthereumNodeHost()));
        const comparator = new ComparatorImpl_1.default();
        const nonceHelper = new NonceHelperImpl_1.default(web3, EthAddressUtils_1.default.getAddressByPrivateKey(privateKey));
        const tokenTransfer = new TokenTransferImpl_1.default(web3, nonceHelper, privateKey, config.getContractAddress(), config.getGasLimit(), config.getGasPrice(), config.getNetworkId());
        const rewardLogger = new RewardLoggerImpl_1.default();
        console.log('starting base business...');
        base.accountManager
            .checkAccount(mnemonicPhrase, 'mnemonic phrase for authorization')
            .then(account => new WorthValidator_1.default(offerShareDataRepository, offerSearchRepository, base, comparator, tokenTransfer, rewardLogger))
            .catch(reason => console.log('Error:', reason));
    }
}
exports.default = Business;
//# sourceMappingURL=Business.js.map