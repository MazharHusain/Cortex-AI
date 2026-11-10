import proxy from "express-http-proxy"

export const proxyWithHeader = (serviceUrl) => {
    return proxy(serviceUrl, {
        proxyReqOptDecorator: (proxyReqOpts, srcReq) => {
            if (srcReq.user) {
                proxyReqOpts.headers["x-user-id"] = srcReq.user.userId
            } else if (srcReq.guestId) {
                proxyReqOpts.headers["x-user-id"] = `guest-${srcReq.guestId}`
            }
            return proxyReqOpts
        },
        userResHeaderDecorator: (headers, userReq) => {
            if (userReq.guestSetCookie) {
                const existing = headers["set-cookie"]
                if (!existing) {
                    headers["set-cookie"] = [userReq.guestSetCookie]
                } else if (Array.isArray(existing)) {
                    headers["set-cookie"] = existing.concat(userReq.guestSetCookie)
                } else {
                    headers["set-cookie"] = [existing, userReq.guestSetCookie]
                }
            }
            return headers
        }
    })
}