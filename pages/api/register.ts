// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
import { validateEmail, validateName, validatePassword } from '@/utils/formValidation'
import stripLow from "validator/lib/stripLow"
import prisma from "../../db/prismaClient"
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import type { UserInfo } from '@/typings/types'


type ExpectedRequestData = {

    username: string

    email: string

    password: string

}


//fetch 404 page response for any invalid api call in order to hinder detection of api endpoints
export const ret404 = async (res: NextApiResponse) => {

    console.log("fetching from:", process.env.PORT);

    const fetchRes = await fetch(`http://localhost:${process.env.PORT}/404`);
    const notFoundPage = await fetchRes.text()

    res.status(404);

    return res.end(notFoundPage);

}

export default function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {


    //verify request method
    if (req.method !== "POST") { ret404(res); return; };

    //check if body is in json form
    //next provides out of the box body parsing by content-type otherwise returns null so we need to ensure that recived body is in form of object
    if (typeof req.body !== "object" && req.body !== null) { res.status(400).end(); return; }

    //if anything goes wrong return 400
    try {

        //strip recived data from blank chars        
        const recivedCredentials: ExpectedRequestData = req.body;

        const username = stripLow(recivedCredentials?.username);

        const email = stripLow(recivedCredentials?.email);

        const password = stripLow(recivedCredentials?.password);

        //validate recived credentials
        if (!validateName(username) && !validateEmail(email) && !validatePassword(password)) {


            //create user password hash
            bcrypt.hash(password, 10).then(passwordHash => {

                //create jwt session token
                const jwtToken = jwt.sign(
                    { username },
                    Buffer.from(process.env.JWT_PRIVATE_RSA as string, "base64").toString(),
                    { algorithm: "RS256", expiresIn: ((60 * 60) * 24) * 7 }
                )

                //create new user in database
                prisma.user.create({
                    data: {
                        username,
                        email: email.toLowerCase(),
                        password: passwordHash,
                    }
                }).then(({ username, email }) => {

                    console.log("account created")

                    console.log(username, email);

                    //setcookie with jwt token for user

                    const responsePayload = JSON.stringify({ userName: username } as UserInfo);

                    res.setHeader("Set-Cookie", `JWTSESSION=${jwtToken}; HttpOnly; Max-Age=${((60 * 60) * 24) * 7}; SameSite=Strict`);

                    res.setHeader("Content-Type", "application/json");

                    res.setHeader("Content-Length", `${responsePayload.length}`)

                    res.status(200).end(responsePayload);

                }).catch(err => {

                    let creationFailedReason: string;

                    console.log(err?.meta?.target[0]);

                    if (err?.meta?.target[0] === "username" || err?.meta?.target[0] === "email") {

                        creationFailedReason = JSON.stringify({ reason: err?.meta?.target[0] });

                        res.setHeader("Content-Type", "application/json");

                        res.setHeader("Content-Length", `${creationFailedReason.length}`);

                        res.status(400).end(creationFailedReason);

                    } else {

                        creationFailedReason = JSON.stringify({ reason: "unxepectedError" });

                        res.setHeader("Content-Type", "application/json");

                        res.setHeader("Content-Length", `${creationFailedReason.length}`);

                        res.status(400).end(creationFailedReason);

                    }


                })

            }).catch(err => {

                ret404(res);

            })


        } else ret404(res);



    } catch (err) {

        console.log(err)

        res.status(400).end();

    }


}
