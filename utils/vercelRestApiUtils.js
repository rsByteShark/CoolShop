const https = require("https");
/**
 * adds enviroment variables to vercel project through vercel rest api
 * 
 * @param {string} restToken 
 * @param {string} projectName 
 * @param {import("../typings/types").EnvEntry[]} arrayOfEnvs 
 * @returns {Promise<number>}
 */
module.exports.addEnvVarsToVercelProject = (restToken, projectName, arrayOfEnvs) => {


    return new Promise((resolve, reject) => {

        const validArrayOfEnvObjects = [];

        arrayOfEnvs.forEach(envVar => {

            const entry = {

                "key": "",

                "value": "",

                "type": "plain",

                "target": [

                    "production",

                    "preview"

                ]
            };


            entry.key = envVar.key;

            entry.value = envVar.value;

            validArrayOfEnvObjects.push(entry);

        })

        const createProjectRequestBody = JSON.stringify(validArrayOfEnvObjects);



        /**@type {https.RequestOptions} */
        const createProjectRequestOptions = {

            host: "api.vercel.com",

            hostname: "api.vercel.com",

            headers: {
                "Authorization": `Bearer ${restToken}`,
                "Content-Type": "application/json",
                "Content-Length": createProjectRequestBody.length
            },

            method: "POST",


            path: `/v9/projects/${projectName}/env`


        }



        const createProjectRequest = https.request(createProjectRequestOptions, res => {

            console.log(`Status: ${res.statusCode}`);

            console.log(res.headers);

            let gatheredData = Buffer.from([]);

            res.on("data", (chunk) => {

                const newGatheredData = Buffer.concat([gatheredData, chunk]);

                gatheredData = null;

                gatheredData = newGatheredData;

            });

            res.on("end", () => {

                if (res.headers["content-type"].includes("application/json")) {

                    console.log(JSON.parse(gatheredData.toString()));


                } else {

                    console.log(gatheredData.toString());

                }

                resolve(res.statusCode);

            })

        });


        createProjectRequest.end(createProjectRequestBody);

    })


}

/**
 * Recives array of vercel project env variables through vercel rest api
 * 
 * @param {string} restToken 
 * @param {string} projectName 
 * @returns {Promise<import("../typings/types").EnvEntry[]>}
 */
module.exports.getVercelProjectEnvs = (restToken, projectName) => {


    return new Promise((resolve, reject) => {

        /**@type {https.RequestOptions} */
        const getProjectEnvsRequestOptions = {

            host: "api.vercel.com",

            hostname: "api.vercel.com",

            headers: {
                "Authorization": `Bearer ${restToken}`,
            },

            method: "GET",


            path: `/v9/projects/${projectName}/env`


        }



        const getProjectEnvsRequest = https.request(getProjectEnvsRequestOptions, res => {

            console.log(`Status: ${res.statusCode}`);

            console.log(res.headers);

            let gatheredData = Buffer.from([]);

            res.on("data", (chunk) => {

                const newGatheredData = Buffer.concat([gatheredData, chunk]);

                gatheredData = null;

                gatheredData = newGatheredData;

            });

            res.on("end", () => {

                if (res.headers["content-type"].includes("application/json")) {

                    const projectEnv = JSON.parse(gatheredData.toString()).envs

                    resolve(projectEnv);

                    console.log(JSON.parse(gatheredData.toString()));


                } else {

                    console.log(gatheredData.toString());

                }

                resolve([]);

            })

        });


        getProjectEnvsRequest.end();

    })


}
