import type { NextApiRequest, NextApiResponse } from 'next';
import { apiRequestCheck, EXPECTED_USER_CREDENTIALS_FIELDS } from "../../utils/generalBackendUtils"
import { validateName } from "../../utils/formValidation"
import stripLow from 'validator/lib/stripLow';
import jwt from "jsonwebtoken"
import type { UserInfo } from '@/typings/types';

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {


    await apiRequestCheck(req, res,
        async (req, res, decodedJWTPayload, prisma) => {

            if (typeof req.body !== "object" && req.body !== null) { res.status(400).end(); return; }

            //body should contain only one expected field
            if (Object.keys(req.body).length > 1) { res.status(400).end(); return; };

            for (let i = 0; i < EXPECTED_USER_CREDENTIALS_FIELDS.length; i++) {
                const field = EXPECTED_USER_CREDENTIALS_FIELDS[i];


                if (field === "username") {

                    //handle username change
                    if (Object.hasOwn(req.body, field)) {

                        if (typeof req.body[field] !== "string") { res.status(400).end(); break; }

                        const newUsername = stripLow(req.body[field]);

                        const validationResult = validateName(newUsername);

                        if (!validationResult) {

                            //check if someone doesn't have already this new username
                            const someUser = await prisma.user.findFirst({
                                where: {
                                    username: newUsername
                                }
                            })

                            if (someUser) { res.status(400).end(); break; }
                            else {

                                await prisma.user.update({
                                    data: { username: newUsername },
                                    where: {
                                        username: decodedJWTPayload.username
                                    }
                                }).then(() => {

                                    //update also creator name in all user orders
                                    prisma.order.updateMany({
                                        data: {
                                            orderCreatorName: newUsername
                                        }
                                    }).then(() => {

                                        //create new jwt session token with updated username
                                        const jwtToken = jwt.sign(
                                            { username: newUsername },
                                            Buffer.from(process.env.JWT_PRIVATE_RSA as string, "base64").toString(),
                                            { algorithm: "RS256", expiresIn: ((60 * 60) * 24) * 7 }
                                        )

                                        const responsePayload = JSON.stringify({ userName: newUsername } as UserInfo);

                                        res.setHeader("Set-Cookie", `JWTSESSION=${jwtToken}; HttpOnly; ${`Max-Age=${((60 * 60) * 24) * 7};`} SameSite=Strict`);

                                        res.setHeader("Content-Type", "application/json");

                                        res.setHeader("Content-Length", `${responsePayload.length}`)

                                        res.status(200).end(responsePayload);

                                    }).catch(err => {

                                        res.status(400).end();

                                    })

                                }).catch((err) => {

                                    res.status(400).end();

                                })

                                break;

                            }

                        } else { res.status(400).end(); break; }

                        console.log(req.body[field]);

                    } else { res.status(400).end(); break; }

                }


                if (field === "email") {/**TODO handle email change */ };


                if (field === "password") { /**TODO handle password change */ };


            }


        },
        (req, res, jwtVerificationError, prisma) => {

            res.setHeader("Set-Cookie", `JWTSESSION=0; HttpOnly; Max-Age=0; SameSite=Strict`); res.status(400).end();

        }
    )



}
