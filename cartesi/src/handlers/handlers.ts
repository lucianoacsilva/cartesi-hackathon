import { Router } from "cartesi-router";
import { Wallet } from "cartesi-wallet";
import { hexToString } from "viem";
import { AdvanceRequestData, InspectRequestData, RequestHandlerResult } from "../genTypes/schemasTypes";

const wallet: Wallet = new Wallet(new Map());
const router: Router = new Router(wallet);

type InspectRequestHandler = (data: InspectRequestData) => Promise<void>;
type AdvanceRequestHandler = (
  data: AdvanceRequestData
) => Promise<RequestHandlerResult>;

const { ETHER_PORTAL_ADDRESS } = process.env;

const handleAdvance: AdvanceRequestHandler = async (data) => {
    console.log("Received advance request data " + JSON.stringify(data));

    if (data.metadata.msg_sender.toLowerCase() === ETHER_PORTAL_ADDRESS?.toLowerCase()) {
        router.process("ether_deposit", data.payload);

        return "accept";
    }

    return "accept";
};

const handleInspect: InspectRequestHandler = async (data) => {
    console.log("Received inspect request data " + JSON.stringify(data));

    const url: string[] = hexToString(data.payload).split('/');
    router.process(url[0] || "", url[1]);

};

export {
    handleAdvance,
    handleInspect
}