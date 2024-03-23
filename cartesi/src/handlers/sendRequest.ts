import { Output } from "cartesi-wallet";

const sendRequest = async (receivedOutput: Output, rollupServer: string) => {
    let endpoint: string = `/${receivedOutput.type || "report"}`;

    await fetch(rollupServer + endpoint, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ payload: receivedOutput.payload })
    });
}

export default sendRequest;