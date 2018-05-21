import {OfferShareDataRepository} from "./repository/OfferShareDataRepository";
import OfferShareDataRepositoryImpl from "./repository/OfferShareDataRepositoryImpl";
import Base from "bitclave-base";
import WorthValidator from "./WorthValidator";
import {OfferSearchRepository} from "./repository/OfferSearchRepository";
import OfferSearchRepositoryImpl from "./repository/OfferSearchRepositoryImpl";
import {Comparator} from "./comparator/Comparator";
import ComparatorImpl from "./comparator/ComparatorImpl";

const program = require('commander');

export default class Business {

    constructor() {
        program
            .version('0.1.0')
            .option('-n, --node <host>', 'host of Base-node')
            .option('-m, --mnemonic <phrase>', 'mnemonic phrase for authorization')
            .parse(process.argv);

        let worthValidator: WorthValidator;
        const base: Base = new Base(program.node, '');
        const offerShareDataRepository: OfferShareDataRepository =
            new OfferShareDataRepositoryImpl(program.node);
        const offerSearchRepository: OfferSearchRepository =
            new OfferSearchRepositoryImpl(program.node);

        const comparator: Comparator = new ComparatorImpl();

        base.accountManager
            .checkAccount(program.mnemonic, 'mnemonic phrase for authorization')
            .then(account => worthValidator = new WorthValidator(
                offerShareDataRepository,
                offerSearchRepository,
                base,
                account,
                comparator
            ))
            .catch(reason => console.log('Error:', reason));
    }

}

new Business();
