import { ret404 } from './register'
import type { NextApiRequest, NextApiResponse } from 'next';
import type { LoginCredentials, UserInfo } from '@/typings/types';
import { validateEmail, validateName, validatePassword } from '@/utils/formValidation'
import stripLow from "validator/lib/stripLow"
import prisma from "../../db/prismaClient"
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {


    //verify request method
    if (req.method !== "POST") { ret404(res); return; };

    //check if body is in json form
    //next provides out of the box body parsing by content-type otherwise returns null so we need to ensure that recived body is in form of object
    if (typeof req.body !== "object" && req.body !== null) { res.status(400).end(); return; }


    try {

        const expectedTextFields = ["emailOrUser", "password", "credType"];

        const expectedBooleanFields = ["rememberChecked"];

        const recivedBody = req.body;

        const recivedCredentials: LoginCredentials = {} as LoginCredentials;

        let detectedNonStringField = false;

        for (let i = 0; i < expectedTextFields.length; i++) {
            const field = expectedTextFields[i];

            if (typeof field !== "string") { detectedNonStringField = true; break; }

            recivedCredentials[field] = stripLow(recivedBody?.[field]);

        }

        if (detectedNonStringField) { res.status(400).end(); return };


        let detectedNonBooleanField = false;

        for (let i = 0; i < expectedBooleanFields.length; i++) {
            const field = expectedBooleanFields[i];

            if (typeof recivedBody?.[field] !== "boolean") { detectedNonBooleanField = true; break };

            recivedCredentials[field] = recivedBody?.[field];

        }

        if (detectedNonBooleanField) { res.status(400).end(); return };


        if (recivedCredentials.credType === "email" || recivedCredentials.credType === "username") { }
        else { res.status(400).end(); return }


        if (recivedCredentials.credType === "email") {

            if (!validateEmail(recivedCredentials.emailOrUser)) {

                console.log(recivedCredentials);

                try {

                    const user = await prisma.user.findFirst({
                        where: {
                            email: recivedCredentials.emailOrUser.toLowerCase()
                        }
                    })

                    if (user) {

                        console.log(user);

                        if (bcrypt.compareSync(recivedCredentials.password, user.password)) {

                            //create jwt session token
                            const jwtToken = jwt.sign(
                                { username: user.username },
                                Buffer.from(process.env.JWT_PRIVATE_RSA as string, "base64").toString(),
                                { algorithm: "RS256", expiresIn: ((60 * 60) * 24) * 7 }
                            )

                            const responsePayload = JSON.stringify({ userName: user.username } as UserInfo);

                            res.setHeader("Set-Cookie", `JWTSESSION=${jwtToken}; HttpOnly; ${recivedCredentials.rememberChecked ? `Max-Age=${((60 * 60) * 24) * 7};` : ""} SameSite=Strict`);

                            res.setHeader("Content-Type", "application/json");

                            res.setHeader("Content-Length", `${responsePayload.length}`)

                            res.status(200).end(responsePayload);

                        } else { console.log("bad password"); res.status(400).end(); }






                    } else {

                        console.log("user not found");

                        res.status(404).end();

                    }

                } catch (err) {

                    console.log(err);

                    res.status(400).end();

                }



            } else { res.status(400).end(); return };

        } else {

            if (!validateName(recivedCredentials.emailOrUser)) {

                console.log(recivedCredentials);

                try {


                    const user = await prisma.user.findFirst({
                        where: {
                            username: recivedCredentials.emailOrUser
                        }
                    })


                    if (user) {

                        if (bcrypt.compareSync(recivedCredentials.password, user.password)) {

                            //create jwt session token
                            const jwtToken = jwt.sign(
                                { username: user.username },
                                Buffer.from(process.env.JWT_PRIVATE_RSA as string, "base64").toString(),
                                { algorithm: "RS256", expiresIn: ((60 * 60) * 24) * 7 }
                            )

                            const responsePayload = JSON.stringify({ userName: user.username } as UserInfo);

                            res.setHeader("Set-Cookie", `JWTSESSION=${jwtToken}; HttpOnly; ${recivedCredentials.rememberChecked ? `Max-Age=${((60 * 60) * 24) * 7};` : ""} SameSite=Strict`);

                            res.setHeader("Content-Type", "application/json");

                            res.setHeader("Content-Length", `${responsePayload.length}`)

                            res.status(200).end(responsePayload);

                        } else { console.log("bad password"); res.status(400).end(); }

                    } else {

                        console.log("user not found");

                        res.status(400).end();

                    }

                } catch (err) {

                    console.log(err);

                    res.status(400).end();

                }



            } else { res.status(400).end(); return };

        }



    } catch (err) {

        console.log(err);

        res.status(400).end();

    }


}
