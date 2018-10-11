import { Config } from './Config';
import ProdConfig from './ProdConfig';
import DevConfig from './DevConfig';

export default class ConfigProxy implements Config {

    private config: Config;

    constructor() {
        this.config = (process.env.NODE_ENV === 'production') ? new ProdConfig() : new DevConfig();
    }

    getEthereumNodeHost(): string {
        return this.config.getEthereumNodeHost();
    }

    getContractAddress(): string {
        return this.config.getContractAddress();
    }

    getGasLimit(): number {
        return this.config.getGasLimit();
    }

    getGasPrice(): number {
        return this.config.getGasPrice();
    }

    getNetworkId(): number {
        return this.config.getNetworkId();
    }

}
