/**
 * this serves as a small proxy helper in front to help forwarding
 * logic flow: api-gateway -> proxy -> event/user service
 * @param: method, url, body, headers
 * @return: status code + body
 */

// NOTE: for now, use 'unknow' for body type. maybe later will a data-schema for the returned body
type ProxyResult = {
    statusCode: number,
    body: unknown,
}

/** headers: {
 * "content-type": "application/json",
 * "x-user": request.header["x-user"]
 * }
 */
export async function proxyToService(
    method: string,
    url: string,
    body?: unknown,
    headers?: Record<string, string>
): Promise<ProxyResult> {
    // put in try catch block, maybe remove later(?)
    try {
        // this avoid pass body empty case (undefined) to fecth() which will cause ts error
        const requestInit: RequestInit = {
            method: method,
            headers: {
                "content-type": "application/json",
                ...headers,
            }
        }
        if (body !== undefined) {
            requestInit.body = JSON.stringify(body);
        }

        // call internal service with fetch(), by default method is GET
        const response = await fetch(url, requestInit);
        // read response body, convert to json
        const result = await response.json();

        // even any error occurs, such as !response.ok, simply return '!ok status'
        return {
            statusCode: response.status,
            body: result
        }
    } catch (error) {
        return {
            statusCode: 502,
            body: {
                error: "proxy service is currently unavailable."
            }
        };
    }
}
