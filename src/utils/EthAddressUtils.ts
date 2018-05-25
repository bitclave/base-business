const EC = require('elliptic').ec;
const CryptoJS = require('crypto-js');

export default class EthAddressUtils {

    public static getAddressByPrivateKey(privateKey: string) {
        const ec = new EC('secp256k1');
        const keyPair = ec.genKeyPair();
        keyPair._importPrivate(privateKey, 'hex');
        const pubKey = keyPair.getPublic(false, 'hex').slice(2);

        const pubKeyWordArray = CryptoJS.enc.Hex.parse(pubKey);
        const hash = CryptoJS.SHA3(pubKeyWordArray, {outputLength: 256});

        return '0x' + hash.toString(CryptoJS.enc.Hex).slice(24);
    }

}
