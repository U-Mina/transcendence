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

function internalServiceHeaders(headers?: Record<string, string>): Record<string, string> {
    const token = process.env.INTERNAL_SERVICE_TOKEN;
    return {
        ...headers,
        ...(token ? { "x-internal-token": token } : {}),
    };
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
    // put in try catch block
    try {
        const forwardedHeaders = internalServiceHeaders(headers);
        // this avoid pass body empty case (undefined) to fecth() which will cause ts error
        const requestInit: RequestInit = {
            method: method,
            headers: {
                ...forwardedHeaders,
            }
        }
        // ONLY when body is NOT empty, we define header
        if (body !== undefined) {
            requestInit.headers = {
                "content-type": "application/json",
                ...forwardedHeaders,
            };
            requestInit.body = JSON.stringify(body);
        }

        // call internal service with fetch(), by default method is GET
        const response = await fetch(url, requestInit);
        // robust parse for result body
        const text = await response.text();
        let responseBody: unknown = {};
        if (text.length > 0) {
            try {
                responseBody = JSON.parse(text);

            } catch {
                responseBody = { message: text };
            }
        }

        // even any error occurs, such as !response.ok, simply return '!ok status'
        return {
            statusCode: response.status,
            body: responseBody
        }
    } catch {
        return {
            statusCode: 502,
            body: {
                error: "proxy service is currently unavailable."
            }
        };
    }
}
