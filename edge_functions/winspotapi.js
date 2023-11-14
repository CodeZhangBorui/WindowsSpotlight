/**
 *
 * @param {Request} request
 * @param {*} context
 */
export default async function (request) {
    if (request.method === "GET") {
        try {
            const res = await fetch("https://arc.msn.com/v3/Delivery/Placement?pid=338387&fmt=json&cdm=1&pl=zh-CN&lc=zh-CN&ctry=CN", {
                method: "GET",
            });
            const resp = new Response(
                await res.text,
                {
                    status: 200,
                }
            );
            resp.headers.set("Access-Control-Allow-Origin", "*");
            resp.headers.set("Access-Control-Allow-Methods", "GET");
            return resp;
        } catch (e) {
            console.error(e);
            throw e;
        }
    }
    return new Response("Windows Spotlight API only supports GET requests now!");
}