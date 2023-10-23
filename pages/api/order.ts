import type { OrderDetails, Product, StripedCart, UserOrder } from '@/typings/types';
import { apiRequestCheck } from '@/utils/generalBackendUtils';
import type { NextApiRequest, NextApiResponse } from 'next';

type RequestBody = {

    type: "create" | "get" | "orderDetails"

    payload: { cart: StripedCart, totalOrderPrice: number }

    orderID?: string

}

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {


    await apiRequestCheck(req, res,
        async (req, res, decodedJWTPayload, prisma) => {

            const requestBody: RequestBody = req.body;


            console.log("req recived:", typeof requestBody);
            //validate request body
            if (typeof requestBody?.type !== "string") { res.status(400).end(); return; }
            console.log("type checked");
            //check request type and make valid action
            if (requestBody.type === "create") {

                if (Object.getPrototypeOf(requestBody?.payload?.cart).constructor.name !== "Array") { res.status(400).end(); return; }
                if (isNaN(requestBody.payload.totalOrderPrice)) { res.status(400).end(); return; }

                //check if requested totalOrderPrice is valid for items in cart
                let totalOrderPrice = 0;
                let invalidCartFormat = false;
                //create array of requested order products for db query
                const requestedProducts: { productID: number, productQuantity: number }[] = [];
                for (let i = 0; i < requestBody.payload.cart.length; i++) {
                    const cartItem = requestBody.payload.cart[i];

                    if (isNaN(cartItem.itemID)) { invalidCartFormat = true; break; }
                    if (isNaN(cartItem.productQuantity)) { invalidCartFormat = true; break; }




                    const productPrice = await prisma.fakeapidatalocalstorage.findFirst({
                        where: {
                            id: cartItem.itemID
                        },
                        select: {
                            price: true
                        }
                    }).catch(err => {

                        console.log(err);

                        invalidCartFormat = true;

                    })

                    if (!productPrice) { invalidCartFormat = true; break; }

                    requestedProducts.push({ productID: cartItem.itemID, productQuantity: cartItem.productQuantity });

                    totalOrderPrice = totalOrderPrice + (productPrice.price * cartItem.productQuantity);

                }

                if (invalidCartFormat) { res.status(400).end(); return; }

                if (totalOrderPrice !== requestBody.payload.totalOrderPrice) {

                    //handle inconsistency
                    res.status(400).end(); return;
                }

                //create orderID
                const orderID = Math.ceil(Math.random() * 10000).toString();

                //create order in db
                const order = await prisma.order.create({
                    data: {
                        id: orderID,
                        orderTotalPrice: requestBody.payload.totalOrderPrice,
                        orderProductsFromFakestore: {
                            create: requestedProducts,
                        },
                        orderCreatorName: decodedJWTPayload.username,
                        status: "recived"
                    }
                }).catch(err => {

                    console.log(err);

                    res.status(400).end();
                })


                res.status(200).end(JSON.stringify(order));

            } else if (requestBody.type === "get") {


                //get user orders
                const userOrders = await prisma.user.findFirst({
                    where: {
                        username: decodedJWTPayload.username
                    },
                    select: {
                        orders: {
                            include: {
                                orderProductsFromFakestore: {
                                    select: {
                                        product: true,
                                        orderID: false,
                                        productID: false,
                                        productQuantity: true
                                    }
                                }
                            }
                        },
                        username: false,
                        email: false,
                        password: false
                    }

                })

                console.log(userOrders?.orders[0]);

                if (!userOrders) { res.status(400).end(); return; }

                const retOrders: UserOrder[] = [];

                userOrders?.orders.forEach(userOrder => {

                    const retOrder: UserOrder = {} as UserOrder;

                    retOrder.id = userOrder.id;

                    retOrder.orderTotalPrice = userOrder.orderTotalPrice;

                    retOrder.status = userOrder.status;

                    retOrders.push(retOrder);

                });


                res.status(200).end(JSON.stringify(retOrders));

            } else if (requestBody.type === "orderDetails") {

                //validate request body
                if (typeof requestBody?.orderID !== "string") { res.status(400).end(); return; }

                //find requested order in db
                const requestedOrder = await prisma.order.findFirst({
                    where: {
                        id: requestBody?.orderID
                    },
                    select: {
                        id: true,
                        orderTotalPrice: true,
                        orderCreatorName: true,
                        status: true,
                        orderProductsFromFakestore: {
                            select: {
                                product: {
                                    select: {
                                        title: true,
                                        price: true
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


                //if order don't exist
                if (!requestedOrder) { res.status(400).end(); return; }
                //if user requested someone else order
                if (requestedOrder.orderCreatorName !== decodedJWTPayload.username) { res.status(400).end(); return; }

                const orderDetails: OrderDetails = {} as OrderDetails;

                orderDetails.totalPrice = requestedOrder.orderTotalPrice;

                orderDetails.orderStatus = requestedOrder.status;

                orderDetails.orderProducts = [];

                requestedOrder.orderProductsFromFakestore.forEach(orderProduct => {

                    orderDetails.orderProducts.push({
                        id: orderProduct.productID,
                        title: orderProduct.product.title,
                        inOrderQuantity: orderProduct.productQuantity,
                        inOrderTotalPrice: (orderProduct.product.price * orderProduct.productQuantity)
                    })

                })

                console.log("order came", requestBody)

                res.status(200).end(JSON.stringify(orderDetails));

            } else { res.status(400).end(); return; }



        },
        (req, res, jwtError, prisma) => {

            console.log("validation error")

            res.status(400).end();

        }
    )










}
