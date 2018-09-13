"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const OfferShareDataRepositoryImpl_1 = __importDefault(require("./repository/OfferShareDataRepositoryImpl"));
const bitclave_base_1 = __importDefault(require("bitclave-base"));
const OfferSearchRepositoryImpl_1 = __importDefault(require("./repository/OfferSearchRepositoryImpl"));
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
        const privateKey = process.env.ETH_PK || 'e642fa284f9445e76c85abaf83ed4cc30ef3ab8467b71606f6b33305b7c4f310';
        const mnemonicPhrase = process.env.BUSINESS_PHRASE || 'rookie wonder mistake nothing whip theme feed card disease identify cushion nephew';
        const hostNode = process.env.NODE_HOST || 'http://localhost:8080/';
        //   const hostNode = process.env.NODE_HOST || 'https://base-node-staging.herokuapp.com/';
        const config = new ConfigProxy_1.default();
        const base = new bitclave_base_1.default(hostNode, '');
        const offerShareDataRepository = new OfferShareDataRepositoryImpl_1.default(hostNode, base);
        const offerSearchRepository = new OfferSearchRepositoryImpl_1.default(hostNode);
        const web3 = new Web3(new Web3.providers.HttpProvider(config.getEthereumNodeHost()));
        const comparator = new ComparatorImpl_1.default();
        const nonceHelper = new NonceHelperImpl_1.default(web3, EthAddressUtils_1.default.getAddressByPrivateKey(privateKey));
        const tokenTransfer = new TokenTransferImpl_1.default(web3, nonceHelper, privateKey, config.getContractAddress(), config.getGasLimit(), config.getGasPrice(), config.getNetworkId());
        const rewardLogger = new RewardLoggerImpl_1.default();
        console.log('starting base business...');
        console.log('hostNode: ', hostNode);
        console.log('privateKey for Business\' ETH account for offers: ', privateKey);
        console.log('mnemonicPhrase for Business\' baseID: ', mnemonicPhrase);
        base.accountManager
            .checkAccount(mnemonicPhrase, 'mnemonic phrase for authorization')
            .then(account => new WorthValidator_1.default(offerShareDataRepository, offerSearchRepository, base, comparator, tokenTransfer, rewardLogger))
            .catch(reason => console.log('Error:', reason));
    }
}
exports.default = Business;
//# sourceMappingURL=Business.js.map