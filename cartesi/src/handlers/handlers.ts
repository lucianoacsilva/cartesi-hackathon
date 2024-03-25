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

const dappAddressRelayContract: string = DAPP_ADDRESS_RELAY_CONTRACT || "0xF5DE34d6BbC0446E2a45719E718efEbaaE179daE";
const etherPortalAddress: string = ETHER_PORTAL_ADDRESS || "0xFfdbe43d4c855BF7e0f105c400A50857f53AB044";

const handleAdvance: AdvanceRequestHandler = async (data) => {
    console.log("Received advance request data " + JSON.stringify(data));

    const msgSender: Address = data.metadata.msg_sender;
    const payloadStr = hexToString(data.payload);

    if (msgSender.toLowerCase() === etherPortalAddress.toLowerCase()) {
        try {
            return router.process("ether_deposit", data.payload) as Output;

          } catch (error) {
            return new Error_out(`failed to process ether deposti ${data.payload} ${error}`);
          }
    }
    
        
    // // Withdraw contract
    // if (msgSender.toLowerCase() === dappAddressRelayContract.toLowerCase()) {
    //     try {
    //         router.set_rollup_address(data.payload, "ether_withdraw");
    //     } catch (error) {
    //         return new Error_out(`Dapp address setup failed with error ${error}!`);
    //     }

    //     return new Report("Dapp address successfully set!");
    // }
        
    try{
      const jsonpayload = JSON.parse(payloadStr);
      console.log("payload is");
      return router.process(jsonpayload.method, data);
    } catch (error) {
      console.log("error is")
      console.log(error);
      return new Error_out(`failed ot process ERC20Deposit ${data.payload} ${error}`);
    }
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