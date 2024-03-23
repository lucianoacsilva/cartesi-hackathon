import { Output } from "cartesi-wallet";

const sendRequest = async (input: Output, rollupServer: string) => {
    let endpoint: string = input.type;

    await fetch(rollupServer + endpoint, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ payload: input.payload })
    });
}

export default sendRequest;