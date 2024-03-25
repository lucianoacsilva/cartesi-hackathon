import createClient from "openapi-fetch";
import { paths } from "./genTypes/schema";
import { handleAdvance, handleInspect } from "./handlers/handlers";
import { AdvanceRequestData, InspectRequestData, RequestHandlerResult, RollupsRequest } from "./genTypes/schemasTypes";
import sendRequest from "./handlers/sendRequest";
import { Output, Wallet } from "cartesi-wallet";
import { getAddress } from "viem";
import { Router } from "cartesi-router";
import { MintERC20route } from "./routes/MintERC20route";

import commonCurrencyAbi from "./abis/common_currency_abi.json";
import currencyAabi from "./abis/currency_a_abi.json";
import currencyBabi from "./abis/common_currency_abi.json";

const {
  COMMON_CURRENCY_ADDRESS,
  CURRENCY_COUNTRY_A,
  CURRENCY_COUNTRY_B,
  ROLLUP_HTTP_SERVER_URL
} = process.env;

const commonCurrencyContract = getAddress(COMMON_CURRENCY_ADDRESS || "0xc6e7DF5E7b4f2A278906862b61205850344D4e7d");
const currencyAcontract = getAddress(CURRENCY_COUNTRY_A || "0x8464135c8F25Da09e49BC8782676a84730C318bC");
const currencyBcontract = getAddress(CURRENCY_COUNTRY_B || "0x663F3ad617193148711d28f5334eE4Ed07016602");

const wallet = new Wallet(new Map());
const router = new Router(wallet);

router.addRoute("mint_commmon", new MintERC20route(commonCurrencyContract, commonCurrencyAbi));
router.addRoute("mint_a", new MintERC20route(currencyAcontract, currencyAabi));
router.addRoute("mint_b", new MintERC20route(currencyBcontract, currencyBabi));

const rollupServer: string = ROLLUP_HTTP_SERVER_URL || "http://127.0.0.1:5004";
console.log("HTTP rollup_server url is " + rollupServer);

const main = async () => {
  const { POST } = createClient<paths>({ baseUrl: rollupServer });
  let status: RequestHandlerResult = "accept";
  let output: Output;
  
  while (true) {
    const { response } = await POST("/finish", {
      body: { status },
      parseAs: "text",
    });

    if (response.status === 200) {
      const data = (await response.json()) as RollupsRequest;
      switch (data.request_type) {
        case "advance_state":
          output = await handleAdvance(data.data as AdvanceRequestData) as Output;
          await sendRequest(output, rollupServer);
          status = "accept";
          break;
        case "inspect_state":
          output = await handleInspect(data.data as InspectRequestData) as Output;
          await sendRequest(output, rollupServer);
          status = "accept";
          break;
      }
    } else {
      console.log(await response.text());
    }
  }
};

main().catch((e) => {
  console.log(e);
  process.exit(1);
});
