const { spawn } = require('child_process');
const fs = require("fs");
const { checkIfEnvFileExists, generateAsymmetricPemEncodedRSAKeysForJWT, populateDBwithFakestoreapiData, modifyEnvFile } = require("../utils/generalBackendUtils");
console.log('Initializing Enviroment...\n\n');
const dotenv = require('dotenv');
const envFilePath = `${process.cwd()}\\.env.local`;
const fakeapiproductsimagespath = `${__dirname}/../public/fakeapiproductsimages`;

/**This is value in seconds that indicates how often fakestoreapi products data will be fetched from source and be updated in local database */
const fakestoreapidataRefreshInterval = (1000 * 60) * 60 * 24;

(async () => {


    //check if env file exists
    const err = await checkIfEnvFileExists();

    //if not create env file
    if (err) {

        console.log("env file don't exist creating env file...\n\n");


        //generate JWT secrets

        console.log("Generating rsa key pair for jwt...\n\n");
        const keys = await generateAsymmetricPemEncodedRSAKeysForJWT();

        const privateKey = Buffer.from(keys.privateKey).toString("base64");

        const publicKey = Buffer.from(keys.publicKey).toString("base64");

        fs.writeFileSync(envFilePath, `JWT_PRIVATE_RSA=${privateKey}\r\nJWT_PUBLIC_RSA=${publicKey}\r\nPORT=3000\r\n`);

    }

    //parse env file and check if all vars are filled
    const envVars = dotenv.parse(fs.readFileSync(envFilePath));
    let missingFieldsDetected = false;

    //check jwt key pair
    if (!envVars?.["JWT_PRIVATE_RSA"] || !envVars?.["JWT_PUBLIC_RSA"]) {

        missingFieldsDetected = true;

        console.log("Generating rsa key pair for jwt...\n\n");
        const keys = await generateAsymmetricPemEncodedRSAKeysForJWT();

        const privateKey = Buffer.from(keys.privateKey).toString("base64");

        const publicKey = Buffer.from(keys.publicKey).toString("base64");

        envVars["JWT_PRIVATE_RSA"] = privateKey;

        envVars["JWT_PUBLIC_RSA"] = publicKey;

    }

    if (!envVars?.["INCLUDE_FAKESTORE_API"]) {

        missingFieldsDetected = true;

        let properAnserw = false

        // while (!properAnserw) {

        //     await new Promise((resolve, reject) => {

        //         const readline = require('readline').createInterface({
        //             input: process.stdin,
        //             output: process.stdout
        //         });

        //         readline.question('Do you want to include fakestore api data? y/n', answer => {

        //             let yesOrNo = null;

        //             if (answer === "y") yesOrNo = true;

        //             if (answer === "n") yesOrNo = false;

        //             if (yesOrNo !== null) {

        //                 envVars["INCLUDE_FAKESTORE_API"] = yesOrNo;

        //                 if (yesOrNo) envVars["NEXT_FAKESTORE_API_REFRESH"] = (new Date().getTime() + (1000 * 60) * 60 * 24);

        //                 readline.close();

        //                 properAnserw = true;

        //             } else { console.log('Pleas answer y or n'); readline.close(); }

        //             resolve();

        //         });

        //     })

        // };

        envVars["INCLUDE_FAKESTORE_API"] = true;

    }

    if (!envVars?.["NEXT_FAKESTORE_API_REFRESH"]) {

        missingFieldsDetected = true;

        envVars["NEXT_FAKESTORE_API_REFRESH"] = 0

    }

    if (missingFieldsDetected) {

        console.log('Populating env file with missing variables...\n\n');


        await modifyEnvFile(envFilePath, envVars);

    }


    const excludeEnvFileString = `# local env files\n.env*.local`;

    if (!fs.readFileSync("./.gitignore").toString().includes(excludeEnvFileString)) {

        console.log('Warning!From now your ".env.local" file contains crucial private data of this application\n\nAdding env file to .gitignore...\n\n');

        fs.appendFileSync("./.gitignore", `\n${excludeEnvFileString}`);

    }


    dotenv.config({ path: envFilePath });


    console.log("initializing database...\n\n");


    const prismaDBPushProcess = spawn("npx", ["prisma", "db", "push"], {
        stdio: "inherit",
        cwd: process.cwd(),
        env: process.env,
        shell: true
    });


    prismaDBPushProcess.on("exit", async () => {

        console.log('Database initialized...\n\n');


        if (process.env.INCLUDE_FAKESTORE_API && process.env.NEXT_FAKESTORE_API_REFRESH < new Date().getTime()) {

            console.log('Populating database with fakestore api data...\n\n');

            try {


                await populateDBwithFakestoreapiData(fakeapiproductsimagespath);


                const timeOfNextDataRefresh = (new Date().getTime() + fakestoreapidataRefreshInterval)

                /**@type {import("../typings/types").CoolShopEnvVariables} */
                const updatedEnvVars = dotenv.parse(fs.readFileSync(envFilePath));

                updatedEnvVars.NEXT_FAKESTORE_API_REFRESH = String(timeOfNextDataRefresh);

                await modifyEnvFile(envFilePath, updatedEnvVars);

                setTimeout(async () => {

                    await populateDBwithFakestoreapiData(fakeapiproductsimagespath);

                    /**@type {import("../typings/types").CoolShopEnvVariables} */
                    const updatedEnvVars = dotenv.parse(fs.readFileSync(envFilePath));

                    updatedEnvVars.NEXT_FAKESTORE_API_REFRESH = (new Date().getTime() + fakestoreapidataRefreshInterval);

                    await modifyEnvFile(envFilePath, updatedEnvVars);

                }, (Number(process.env.NEXT_FAKESTORE_API_REFRESH) - new Date().getTime()));


                console.log(`next fetch of fakestoreapi data will occure ${new Date(timeOfNextDataRefresh).toString()}\n\n`);

                console.log(`This will occur in ${parseInt((process.env.NEXT_FAKESTORE_API_REFRESH - new Date().getTime()) / 1000)} seconds\n\n`);

            } catch (err) {

                console.log('populating database with fakestore api data failed...\n\n');


            }


        } else if (process.env.INCLUDE_FAKESTORE_API) {


            console.log(`next fetch of fakestoreapi data is planned on ${new Date(Number(process.env.NEXT_FAKESTORE_API_REFRESH)).toString()}\n\nsetting timeout...\n\n`);

            console.log(`This will occur in ${parseInt((process.env.NEXT_FAKESTORE_API_REFRESH - new Date().getTime()) / 1000)} seconds\n\n`);


            setTimeout(async () => {

                await populateDBwithFakestoreapiData(fakeapiproductsimagespath);

                /**@type {import("../typings/types").CoolShopEnvVariables} */
                const updatedEnvVars = dotenv.parse(fs.readFileSync(envFilePath));

                updatedEnvVars.NEXT_FAKESTORE_API_REFRESH = (new Date().getTime() + fakestoreapidataRefreshInterval);

                await modifyEnvFile(envFilePath, updatedEnvVars);

            }, (Number(process.env.NEXT_FAKESTORE_API_REFRESH) - new Date().getTime()));


        }






        console.log('executing "next dev" command...\n\n');




        spawn("next", ["dev"], {
            stdio: "inherit",
            cwd: process.cwd(),
            env: process.env,
            shell: true
        });

    })





})()








