import createClient from "openapi-fetch";
import { components, paths } from "./genTypes/schema";
import { handleAdvance, handleInspect } from "./handlers/handlers";
import { AdvanceRequestData, InspectRequestData, RequestHandlerResult, RollupsRequest } from "./genTypes/schemasTypes";

const { ROLLUP_HTTP_SERVER_URL } = process.env;
const rollupServer: string = ROLLUP_HTTP_SERVER_URL || "http://127.0.0.1:5004";
console.log("HTTP rollup_server url is " + rollupServer);

const main = async () => {
  const { POST } = createClient<paths>({ baseUrl: rollupServer });
  let status: RequestHandlerResult = "accept";
  while (true) {
    const { response } = await POST("/finish", {
      body: { status },
      parseAs: "text",
    });

    if (response.status === 200) {
      const data = (await response.json()) as RollupsRequest;
      switch (data.request_type) {
        case "advance_state":
          status = await handleAdvance(data.data as AdvanceRequestData);
          break;
        case "inspect_state":
          await handleInspect(data.data as InspectRequestData);
          break;
      }
    } else if (response.status === 202) {
      console.log(await response.text());
    }
  }
};

main().catch((e) => {
  console.log(e);
  process.exit(1);
});
