import createClient from "openapi-fetch";
import { paths } from "./genTypes/schema";
import { handleAdvance, handleInspect } from "./handlers/handlers";
import { AdvanceRequestData, InspectRequestData, RequestHandlerResult, RollupsRequest } from "./genTypes/schemasTypes";
import sendRequest from "./handlers/sendRequest";
import { Output } from "cartesi-wallet";

const { ROLLUP_HTTP_SERVER_URL } = process.env;
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
