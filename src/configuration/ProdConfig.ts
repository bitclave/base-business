import { Config } from './Config';

export default class ProdConfig implements Config {

    getEthereumNodeHost(): string {
        return 'https://mainnet.infura.io/R4kTXAgVNzEAjjRP3gvK';
    }

    getContractAddress(): string {
        return '0x1234567461d3f8db7496581774bd869c83d51c93';
    }

    getGasLimit(): number {
        return 4000000;
    }

    getGasPrice(): number {
      return 10000000000;
    }

    getNetworkId(): number {
        return 1;
    }

}
