/**.env.local file must be created in init script for production 
 * this init script will handle generation of evry secrets such as:
 * JWT key pair (used for user authorization and authentication)
 * secret for vercel cron job that will be executed evry 24 hours (as there is a limit two 24-hour cron jobs for hobby vercel plan)
 */
/** */
const { getVercelProjectEnvs, addEnvVarsToVercelProject } = require("./utils/vercelRestApiUtils")

const projectName = "CoolShop";

(async () => {


    console.log('Init script started');


    if (!process.env.API_KEY) throw "Error VERCEL_API_KEY don't exist "

    //check if JWT secrets don't already exists in vercel config
    const vercelProjectEnv = await getVercelProjectEnvs(process.env.API_KEY, projectName);
    const expectedEnvKeys = ["JWT_PRIVATE_RSA", "JWT_PUBLIC_RSA"];
    const hits = 0;

    vercelProjectEnv.forEach(envEntry => {

        if (expectedEnvKeys.includes(envEntry.key)) hits += 1;

    })

    if (hits !== expectedEnvKeys.length) {

        //generate JWT secrets
        console.log("Generating rsa key pair for jwt...\n\n");
        const keys = await generateAsymmetricPemEncodedRSAKeysForJWT();

        const privateKey = Buffer.from(keys.privateKey).toString("base64");

        const publicKey = Buffer.from(keys.publicKey).toString("base64");

        const resStatus = await addEnvVarsToVercelProject(process.env.VERCEL_API_KEY, projectName, [{ key: JWT_PRIVATE_RSA, value: privateKey }, { key: JWT_PUBLIC_RSA, value: publicKey }]);

        if (resStatus !== 200) throw "Error while adding env vars through vercel api"

    }


    const prismaDBPushProcess = spawn("npx", ["prisma", "db", "push", "--schema=./prisma/prodSchema.prisma"], {
        stdio: "inherit",
        cwd: process.cwd(),
        env: process.env,
        shell: true
    });

    prismaDBPushProcess.on("exit", () => {

        console.log('Generating prisma client code in local env...\n\n');
        const prismaDBclientCreationProcess = spawn("npx", ["prisma", "generate", "--schema=./prisma/prodSchema.prisma"], {
            stdio: "inherit",
            cwd: process.cwd(),
            env: process.env,
            shell: true
        });


        prismaDBclientCreationProcess.on("exit", () => {


            console.log('Starting next build...\n\n');


            spawn("next", ["build"], {
                stdio: "inherit",
                cwd: process.cwd(),
                env: process.env,
                shell: true
            });

        })


    });


})()