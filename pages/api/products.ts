import { Product } from '@/typings/types';
import { apiRequestCheck } from '@/utils/generalBackendUtils';
import { PrismaClient } from '@prisma/client';
import type { NextApiRequest, NextApiResponse } from 'next';


export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {


    const getProductsFromDb = (fromIndex: number, toIndex: number, prisma: PrismaClient): Promise<{ products: Product[], totalProducts: number }> => {

        return new Promise((resolve, reject) => {

            prisma.fakeapidatalocalstorage.findMany({
                where: {
                    id: {
                        gte: fromIndex,
                        lte: toIndex,
                    }
                }
            }).then(async (products) => {

                const totalProducts = await prisma.fakeapidatalocalstorage.count();

                resolve({ products, totalProducts });

            }).catch(err => {

                reject(err);

            })


        })



    }


    await apiRequestCheck(req, res,
        async (req, res, decodedJWTPayload, prisma) => {

            //user is verified

            const fromIndex: number = JSON.parse(req.body)?.fromIndex;

            const toIndex: number = JSON.parse(req.body)?.toIndex;

            const productsForResponse = await getProductsFromDb(fromIndex, toIndex, prisma);

            res.status(200).end(JSON.stringify(productsForResponse));

        },
        async (req, res, jwtVerificationEorror, prisma) => {

            //user is not verified

            const fromIndex: number = JSON.parse(req.body)?.fromIndex;

            const toIndex: number = JSON.parse(req.body)?.toIndex;

            const productsForResponse = await getProductsFromDb(fromIndex, toIndex, prisma);

            res.status(200).end(JSON.stringify(productsForResponse));

        })
}
