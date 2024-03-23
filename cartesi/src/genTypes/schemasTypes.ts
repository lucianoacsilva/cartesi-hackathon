import { components } from "./schema";

type AdvanceRequestData = components["schemas"]["Advance"];
type InspectRequestData = components["schemas"]["Inspect"];
type RequestHandlerResult = components["schemas"]["Finish"]["status"];
type RollupsRequest = components["schemas"]["RollupRequest"];

export type {
    AdvanceRequestData,
    InspectRequestData,
    RequestHandlerResult,
    RollupsRequest,
}