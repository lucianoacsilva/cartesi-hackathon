import { Router } from "cartesi-router";
import { Error_out, Output, Report, Wallet } from "cartesi-wallet";
import { Address, hexToString } from "viem";
import { AdvanceRequestData, InspectRequestData, RequestHandlerResult } from "../genTypes/schemasTypes";

const wallet: Wallet = new Wallet(new Map());
const router: Router = new Router(wallet);

type InspectRequestHandler = (data: InspectRequestData) => Promise<Output | Set<Output> | void>;
type AdvanceRequestHandler = (
  data: AdvanceRequestData
) => Promise<Output | Set<Output>>;

const { 
    ETHER_PORTAL_ADDRESS, 
    DAPP_ADDRESS_RELAY_CONTRACT 
} = process.env;

const dappAddressRelayContract: string = DAPP_ADDRESS_RELAY_CONTRACT || "";

const handleAdvance: AdvanceRequestHandler = async (data) => {
    console.log("Received advance request data " + JSON.stringify(data));

    const msgSender: Address = data.metadata.msg_sender;

    if (msgSender.toLowerCase() === ETHER_PORTAL_ADDRESS?.toLowerCase()) 
        return router.process("ether_deposit", data.payload) as Output;

    // Withdraw contract
    if (msgSender.toLowerCase() === dappAddressRelayContract.toLowerCase()) {
        try {
            router.set_rollup_address(data.payload, "ether_withdraw");
        } catch (error) {
            return new Error_out(`Dapp address setup failed with error ${error}!`);
        }

        return new Report("Dapp address successfully set!");
    }
        
    // withdraw call
    const payloadParsed = JSON.parse(hexToString(data.payload));
    return router.process(payloadParsed.method, data);
};

const handleInspect: InspectRequestHandler = async (data) => {
    console.log("Received inspect request data " + JSON.stringify(data));

    const url: string[] = hexToString(data.payload).split('/');
    return router.process(url[0] || "", url[1]);
};

export {
    handleAdvance,
    handleInspect
}