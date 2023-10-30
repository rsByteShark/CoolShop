const fs = require("fs");
const forge = require('node-forge');
const { get } = require("https");
const sharp = require("sharp");
const rsa = forge.pki.rsa;
const jwt = require("jsonwebtoken");


module.exports.EXPECTED_PRODUCT_FIELDS = ["id", "title", "price", "category", "description", "productQuantity", "productImageExternalURL"];

module.exports.EXPECTED_USER_CREDENTIALS_FIELDS = ["username", "email", "password"];

module.exports.checkIfEnvFileExists = () => {

    return new Promise((resolve, reject) => {

        fs.access("./.env.local", fs.constants.F_OK, (err) => resolve(err));

    })

}


/**
 * @typedef {object} JWTRSASecrets
 * @property {string} publicKey
 * @property {string} privateKey  
 * 
*/

/**
 * Generates rsa key pair for JWT secret RS256 verification and signing
 * @returns {Promise<JWTRSASecrets>}
 */
module.exports.generateAsymmetricPemEncodedRSAKeysForJWT = () => {

    return new Promise((resolve, reject) => {

        rsa.generateKeyPair({ bits: 2048, workers: -1 }, function (err, keypair) {
            // keypair.privateKey, keypair.publicKey

            if (err) reject(err);

            resolve({
                publicKey: forge.pki.publicKeyToPem(keypair.publicKey),
                privateKey: forge.pki.privateKeyToPem(keypair.privateKey),
            })

        });

    })

}


/**
 * This function calls fakestore api `/products` route and populate local database with it's content
 * 
 * Then it fetches evry product image converts it to webp format and saves into `fakeapiproductsimagespath` directory
 * 
 * @param {string} fakeapiproductsimagespath path where fakestoreapi images will be stored 
 * @returns {Promise}
 */
module.exports.populateDBwithFakestoreapiData = (fakeapiproductsimagespath) => {

    return new Promise((resolvePopulatingDBwithFakestoreapi) => {

        const prisma = require("../db/prismaClient");

        get({
            host: "fakestoreapi.com",
            hostname: "fakestoreapi.com",
            path: "/products"
        }).on("response", (res) => {

            let recivedData = Buffer.from("");

            res.on("data", (chunk) => {

                let newBuffer = Buffer.concat([recivedData, chunk])

                recivedData = null;

                recivedData = newBuffer;

                newBuffer = null;

            })

            res.on("end", async () => {

                /**@type {import("../typings/types").FakeStoreApiProduct[]} */
                const products = JSON.parse(recivedData.toString());

                let successCount = 1;

                for (let id = 0; id < products.length; id++) {

                    console.log(`processing fakestoreapidata (${successCount}/${products.length}) ...`);

                    const product = products[id];

                    //check if product exists in local database

                    const productInDb = await prisma.fakeapidatalocalstorage.findFirst({

                        where: {
                            id: product.id,
                        }

                    })

                    //if product already exists check wich fields are the same and replace old values with new
                    if (productInDb) {


                        /**@type {import("../typings/types").Product} */
                        const newProductData = {};
                        let productImageChanged = false;

                        //check wich product fields has changed
                        module.exports.EXPECTED_PRODUCT_FIELDS.forEach(field => {

                            if (field === "productQuantity") { if (productInDb[field] !== product.rating.count) newProductData[field] = product.rating.count; return }
                            if (field === "productImageExternalURL") {

                                if (productInDb[field] !== product.image) {

                                    newProductData[field] = product.image;

                                    productImageChanged = true

                                    return
                                }

                            }

                            if (productInDb[field] !== product[field]) newProductData[field] = product[field];

                        })

                        //update product in db
                        if (Object.keys(newProductData).length) {

                            await prisma.fakeapidatalocalstorage.update({
                                where: {
                                    id: product.id
                                },
                                data: newProductData,

                            }).catch(err => {

                                successCount -= 1;

                            })

                        }

                        //if image url changed fetch new image
                        if (productImageChanged) await module.exports.fetchFakestoreapiProductImage(product, fakeapiproductsimagespath);

                    } else {

                        //create entry in db for new product
                        await prisma.fakeapidatalocalstorage.create({
                            data: {
                                id: product.id,

                                title: product.title,

                                price: product.price,

                                category: product.category,

                                description: product.description,

                                productQuantity: product.rating.count,

                                productImageExternalURL: product.image,
                            }
                        }).catch(err => {

                            console.log(err);


                            successCount -= 1;

                        })



                        //fetch image from fakestoreapi and save it in public directory as webp
                        await module.exports.fetchFakestoreapiProductImage(product, fakeapiproductsimagespath);

                    }


                    successCount += 1;


                }

                console.log(`populating database with fakestore api data succed (${successCount} from ${products.length} fetched items was added to database)...\n\n`);

                resolvePopulatingDBwithFakestoreapi();

            })

        })

    })

}


/**
 * This function fetches fakestoreapi product image converts it to webp and saves in /public/fakeapiproductsimages/[productid].webp
 * 
 * @param {import("../typings/types").FakeStoreApiProduct} product info about fakestoreapiproduct 
 * @param {string} fakeapiproductsimagespath path where fakestoreapi images will be stored 
 * @returns {Promise}
 */
module.exports.fetchFakestoreapiProductImage = (product, fakeapiproductsimagespath) => {

    return new Promise((resolveProductImageFetch, rejectImageFetch) => {
        const prisma = require("../db/prismaClient");
        try {

            get(product.image, (res) => {


                let recivedImageData = Buffer.from("");

                res.on("data", (chunk) => {

                    let newBuffer = Buffer.concat([recivedImageData, chunk])

                    recivedImageData = null;

                    recivedImageData = newBuffer;

                    newBuffer = null;

                })

                res.on("end", () => {

                    const sharpBuffer = sharp(recivedImageData);

                    sharpBuffer.metadata().then(metadata => {
                        if (metadata.format === 'jpeg') {

                            sharpBuffer.webp().toFile(`${fakeapiproductsimagespath}/${product.id}.webp`,
                                (err, info) => {

                                    if (err) {

                                        rejectImageFetch(err);

                                    } else {

                                        resolveProductImageFetch();

                                    }

                                });

                        } else {

                            rejectImageFetch("wrong image format")

                        }
                    }).catch(err => {

                        rejectImageFetch(`error while processing fetched image ${err}`)

                    });

                })


            })

        } catch (err) {

            rejectImageFetch(err)

        }



    });

}

/**
 * Populate local env file with new values
 * 
 * @param {string} envFilePath path of env file  
 * @param {import("../typings/types").CoolShopEnvVariables} newEnvFileContent 
 * @returns {Promise}
 */
module.exports.modifyEnvFile = (envFilePath, newEnvFileContent) => {


    const envFileStream = fs.createWriteStream(envFilePath);


    for (let key in newEnvFileContent) {

        envFileStream.write(`${key}=${newEnvFileContent[key]}\r\n`);

        process.env[key] = newEnvFileContent[key];

    }

    return new Promise((resolve) => {

        envFileStream.end(() => {

            resolve();

        });

    })

}




/**
 * @callback ApiRequestCheckCallback
 * @param {import("next").NextApiRequest} req
 * @param {import("next").NextApiResponse} res
 * @param {import("../typings/types").JWTFormat} decodedJWTpayload
 * @param {import("@prisma/client").PrismaClient} prisma ref to prisma client
 * @returns {void | Promise}
 */

/**
 * @callback ApiRequestCheckJWTErrorCallback
 * @param {import("next").NextApiRequest} req
 * @param {import("next").NextApiResponse} res
 * @param {import("jsonwebtoken").VerifyErrors | null} jwtError 
 * @param {import("@prisma/client").PrismaClient} prisma ref to prisma client
 * @returns {void | Promise}
 */

/**
 * This function performs simple request validation that includes:
 * 
 * (-) Check if request was made with `POST` http method
 * 
 * (-) Check if `JWTSESSION` cookie is in form of string
 * 
 * (-) verification of jwt token that came with request in `JWTSESSION` cookie
 * 
 * Evrything is enclosed in try catch block and if enything goes wrong it send back response with status code 400.
 * 
 * If each check succed `callback` is executed
 * 
 * If jwt verification has error `jwtErrorCallback` is executed
 * 
 * This function returns promise that resolves when callback completed (callback function may be async)
 * 
 * @param {import("next").NextApiRequest} req
 * @param {import("next").NextApiResponse} res
 * @param {ApiRequestCheckCallback} callback code in this function will be executed if request validation succed
 * @param {ApiRequestCheckJWTErrorCallback} jwtErrorCallback code in this function will be executed if all standard checks succed but jwt has error
 * 
 * @returns {Promise} 
 */
module.exports.apiRequestCheck = (req, res, callback, jwtErrorCallback) => {

    const prisma = require("../db/prismaClient");

    return new Promise(async (resolveRequestCheck) => {

        try {

            if (req.method !== "POST") { ret404(res); return };

            if (typeof req?.cookies?.JWTSESSION === "string") {

                jwt.verify(req.cookies.JWTSESSION, Buffer.from(process.env.JWT_PUBLIC_RSA, "base64").toString(), function (err, decoded) {

                    if (!err) {

                        //Request check succed here comes callback
                        const callbackRet = callback(req, res, decoded, prisma);

                        if (typeof callbackRet.then === "function") callbackRet.then(() => resolveRequestCheck());

                    } else {

                        const jwtErrorCallbackRet = jwtErrorCallback(req, res, err, prisma);

                        if (typeof jwtErrorCallbackRet.then === "function") jwtErrorCallbackRet.then(() => resolveRequestCheck());

                    }

                });

            } else {

                const jwtErrorCallbackRet = jwtErrorCallback(req, res, {}, prisma);

                if (typeof jwtErrorCallbackRet.then === "function") jwtErrorCallbackRet.then(() => resolveRequestCheck());

            }

        } catch (err) {

            res.status(400).end();

        }

    })




}

/**Deletes entire data from development sqlite db (except fakestore api products) */
module.exports.clearDatabase = async () => {

    const { PrismaClient } = require('@prisma/client');

    /**@type {import("@prisma/client").PrismaClient} */
    const prisma = new PrismaClient();


    await prisma.fakeapiproductsOfOrder.deleteMany().catch(err => {

        console.log(err);

    });

    await prisma.order.deleteMany().catch(err => {

        console.log(err);


    });

    await prisma.order.deleteMany().catch(err => {

        console.log(err);


    });

    await prisma.user.deleteMany().catch(err => {

        console.log(err);


    });

}

/**
 * 
 * @param {RequestInfo | URL} input 
 * @param {RequestInit} [init] 
 * @returns {Promise<Response>}
 */
module.exports.vercelProdFetch = (input, init) => {


    return new Promise((resolve, reject) => {

        const target = process.env.PROD_MODE ? `${process.env.VERCEL_URL}${input}` : input;

        fetch(target, init).then(res => {

            resolve(res)

        });

    })



}



