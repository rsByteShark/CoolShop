import prisma from '@/db/prismaClient';
import type { NextApiRequest, NextApiResponse } from 'next';

type Data = {
    name: string
}

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<Data>
) {



    const requestedOrder = await prisma.order.findFirst({
        where: {
            id: "1051"
        },
        select: {
            id: true,
            orderTotalPrice: true,
            status: true,
            orderProductsFromFakestore: {
                select: {
                    product: {
                        select: {
                            title: true,
                        }
                    },
                    productID: true,
                    productQuantity: true,
                    order: false,
                    orderID: false
                }
            }
        }

    })

    console.log(requestedOrder);

    console.log("req")

    res.redirect("/");

    res.end();


}
