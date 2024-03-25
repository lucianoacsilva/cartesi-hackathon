import { AdvanceRoute } from "cartesi-router";
import { Output, Voucher } from "cartesi-wallet";
import { Address, encodeFunctionData, hexToBytes } from "viem";

export class MintERC20route extends AdvanceRoute {

    constructor(
        private erc20ContractAdrress: Address,
        private abi: any
    ) {
        super();
    }

    execute = (request: any): Output | Set<Output> => {
        this.parse_request(request);
        console.log("Minting ERC20 tokens ...");

        const { to, amount } = this.request_args;
        const payload = encodeFunctionData({
            abi: this.abi,
            functionName: "mint",
            args: [to, amount]
        });

        return new Voucher(this.erc20ContractAdrress, hexToBytes(payload));
    };
}