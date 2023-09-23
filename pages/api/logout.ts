import type { NextApiRequest, NextApiResponse } from 'next'
import jwt from "jsonwebtoken"
import { ret404 } from './register'
import { apiRequestCheck } from "../../utils/generalBackendUtils"



export default function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {


    apiRequestCheck(req, res,
        (req, res, decodedJWTPayload, prisma) => {

            res.setHeader("Set-Cookie", `JWTSESSION=0; HttpOnly; Max-Age=0; SameSite=Strict`);

            res.status(200).end();

        },
        (req, res, jwtError, prisma) => {

            res.status(400).end();

        },
    )

}
