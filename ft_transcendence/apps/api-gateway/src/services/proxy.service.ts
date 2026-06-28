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
        // call internal service with fetch(), by default method is GET
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Response status: ${response.status}`);
        }
        // read response body, convert to json
        const result = response.json();
    } catch (error) {
        return {
            statusCode: 501,
            body: {
                error: "proxy service is currently unavailable."
            }
        };
    }

    // return 
    return {
        statusCode: 501,
        body: {
            error: "proxy service is currently unavailable."
        }
    };
}
