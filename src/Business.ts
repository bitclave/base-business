import Base from 'bitclave-base';
import { OfferSearchRepository, OfferShareDataRepositoryImpl, OfferSearchRepositoryImpl, HttpTransportImpl, OfferShareDataRepository, HttpTransport } from 'bitclave-base';
import { TokenTransfer } from './rewards/transfer/TokenTransfer';
import TokenTransferImpl from './rewards/transfer/TokenTransferImpl';
import WorthValidator from './rewards/WorthValidator';
import ComparatorImpl from './rewards/comparator/ComparatorImpl';
import { Comparator } from './rewards/comparator/Comparator';
import { Config } from './configuration/Config';
import ConfigProxy from './configuration/ConfigProxy';
import { RewardLogger } from './rewards/logger/RewardLogger';
import RewardLoggerImpl from './rewards/logger/RewardLoggerImpl';
import { NonceHelper } from './rewards/transfer/NonceHelper';
import NonceHelperImpl from './rewards/transfer/NonceHelperImpl';
import EthAddressUtils from './utils/EthAddressUtils';

const Web3 = require('web3');

export default class Business {

    constructor() {
      if (!process.env.ETH_PK || !process.env.BUSINESS_PHRASE) {
        throw new Error('Public Key and Phrase are undefined');
      }
      const privateKey = process.env.ETH_PK;
      const mnemonicPhrase = process.env.BUSINESS_PHRASE;
      const hostNode = process.env.NODE_HOST || 'https://base-node-staging.herokuapp.com/';
      const config: Config = new ConfigProxy();

      const base: Base = new Base(hostNode, '');
      const httpTransport: HttpTransport = new HttpTransportImpl(hostNode);
      const offerShareDataRepository: OfferShareDataRepository = new OfferShareDataRepositoryImpl(httpTransport, base.accountManager, base.profileManager);
      const offerSearchRepository: OfferSearchRepository = new OfferSearchRepositoryImpl(httpTransport);
      const web3 = new Web3(new Web3.providers.HttpProvider(config.getEthereumNodeHost()));

      const comparator: Comparator = new ComparatorImpl();
      const nonceHelper: NonceHelper = new NonceHelperImpl(
          web3, EthAddressUtils.getAddressByPrivateKey(privateKey)
      );

      const tokenTransfer: TokenTransfer = new TokenTransferImpl(
          web3,
          nonceHelper,
          privateKey,
          config.getContractAddress(),
          config.getGasLimit(),
          config.getGasPrice(),
          config.getNetworkId()
      );

      const rewardLogger: RewardLogger = new RewardLoggerImpl();

      console.log('starting base business...');

      base.accountManager
          .checkAccount(mnemonicPhrase, 'mnemonic phrase for authorization')
          .then(account => new WorthValidator(
              offerShareDataRepository,
              offerSearchRepository,
              base,
              comparator,
              tokenTransfer,
              rewardLogger
          ))
          .catch(reason =>
            console.log('Error:', reason)
          );
    }

}
