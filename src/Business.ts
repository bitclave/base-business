import {OfferShareDataRepository} from "./repository/OfferShareDataRepository";
import OfferShareDataRepositoryImpl from "./repository/OfferShareDataRepositoryImpl";
import Base from "bitclave-base";
import {OfferSearchRepository} from "./repository/OfferSearchRepository";
import OfferSearchRepositoryImpl from "./repository/OfferSearchRepositoryImpl";
import {TokenTransfer} from "./rewards/transfer/TokenTransfer";
import TokenTransferImpl from "./rewards/transfer/TokenTransferImpl";
import WorthValidator from "./rewards/WorthValidator";
import ComparatorImpl from "./rewards/comparator/ComparatorImpl";
import {Comparator} from "./rewards/comparator/Comparator";
import {Config} from "./configuration/Config";
import ConfigProxy from "./configuration/ConfigProxy";
import {RewardLogger} from "./rewards/logger/RewardLogger";
import RewardLoggerImpl from "./rewards/logger/RewardLoggerImpl";
import {NonceHelper} from "./rewards/transfer/NonceHelper";
import NonceHelperImpl from "./rewards/transfer/NonceHelperImpl";
import EthAddressUtils from "./utils/EthAddressUtils";

const Web3 = require('web3');
const program = require('commander');

export default class Business {

    constructor() {
        const config: Config = new ConfigProxy();

        program
            .version('0.1.0')
            .option('-n, --node <host>', 'host of Base-node')
            .option('-m, --mnemonic <phrase>', 'mnemonic phrase for authorization')
            .option('-k, --privateKey <privateKey>', 'Private key of Ethereum wallet for pay reward')
            .parse(process.argv);

        const base: Base = new Base(program.node, '');
        const offerShareDataRepository: OfferShareDataRepository =
            new OfferShareDataRepositoryImpl(program.node, base);
        const offerSearchRepository: OfferSearchRepository =
            new OfferSearchRepositoryImpl(program.node);
        const web3: any = new Web3(new Web3.providers.HttpProvider(config.getEthereumNodeHost()));

        const comparator: Comparator = new ComparatorImpl();
        const nonceHelper: NonceHelper = new NonceHelperImpl(
            web3, EthAddressUtils.getAddressByPrivateKey(program.privateKey)
        );

        const tokenTransfer: TokenTransfer = new TokenTransferImpl(
            web3,
            nonceHelper,
            program.privateKey,
            config.getContractAddress(),
            config.getGasLimit(),
            config.getGasPrice(),
            config.getNetworkId()
        );

        const rewardLogger: RewardLogger = new RewardLoggerImpl();

        base.accountManager
            .checkAccount(program.mnemonic, 'mnemonic phrase for authorization')
            .then(account => new WorthValidator(
                offerShareDataRepository,
                offerSearchRepository,
                base,
                comparator,
                tokenTransfer,
                rewardLogger
            ))
            .catch(reason => console.log('Error:', reason));
    }

}

new Business();
