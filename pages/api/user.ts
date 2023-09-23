import { apiRequestCheck } from "../../utils/generalBackendUtils"
import type { NextApiRequest, NextApiResponse } from 'next';




export default function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {


    apiRequestCheck(req, res,
        (req, res, decodedJWTPayload, prisma) => {

            console.log(decodedJWTPayload);

            const responsePayload = JSON.stringify({ username: decodedJWTPayload.username });

            res.setHeader("Content-Type", "application/json");

            res.setHeader("Content-Length", `${responsePayload.length}`)

            res.status(200).end(responsePayload);

        },
        (req, res, jwtVerificationEorror, prisma) => {

            res.setHeader("Set-Cookie", `JWTSESSION=0; HttpOnly; Max-Age=0; SameSite=Strict`); res.status(400).end();

        }
    )


}
