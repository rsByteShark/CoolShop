import Navbar from '@/components/Navbar';
import type { InferGetServerSidePropsType, GetServerSideProps } from 'next'
import styles from "@/styles/Account.module.scss"
import { useState } from 'react';
import { OrderDetails } from '@/typings/types';
import { Skeleton } from '@mui/material';
import Image from 'next/image';
import Link from 'next/link';

export const getServerSideProps = (async (context) => {

    return { props: { orderID: context.params?.id as string } }
}) satisfies GetServerSideProps<{
    orderID: string
}>

export default function Page({
    orderID,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {

    const [orderDetails, updateOrderDetails] = useState<OrderDetails | undefined | "Forbidden">(undefined);

    const userOrdersRequestPayload = JSON.stringify({
        type: "orderDetails",
        orderID: orderID
    });

    if (!orderDetails) {

        fetch("/api/order", {
            credentials: "same-origin",
            method: "POST",
            body: userOrdersRequestPayload,
            headers: {
                "Content-Type": "application/json",
                "Content-Length": `${userOrdersRequestPayload.length}`,
            }
        }).then(res => {



            if (res.status == 200) {

                res.json().then((data: OrderDetails) => {

                    updateOrderDetails(data);

                })

            } else {

                updateOrderDetails("Forbidden");

            }


        })

    }



    return <>
        <Navbar localeURL={`/account/order/${orderID}`} />
        {orderDetails === "Forbidden" ?
            <div style={{ minHeight: "300px" }} className={`${styles.cartHeader} ${styles.mainContainer}`}>
                <h1>{`${orderDetails}`}</h1>
            </div>
            :
            <div className={`${styles.cartHeader} ${styles.mainContainer}`}>
                <h1>{`Order #${orderID}`}</h1>
                <span style={{ marginTop: "10px" }}>
                    {orderDetails ? `Order total value: ${orderDetails.totalPrice.toFixed(2)} $` : <Skeleton className={styles.productCard} variant="text" sx={{ fontSize: '1rem', width: "200px" }} />}
                </span>
                <span style={{ marginTop: "10px" }} >
                    {orderDetails ? `Order status: ${orderDetails.orderStatus}` : <Skeleton className={styles.productCard} variant="text" sx={{ fontSize: '1rem', width: "200px" }} />}
                </span>
                <span style={{ marginTop: "10px" }}>
                    {orderDetails ? `Order items (${orderDetails.orderProducts.length})` : <Skeleton className={styles.productCard} variant="text" sx={{ fontSize: '1rem', width: "200px" }} />}
                </span>
                {orderDetails ? orderDetails?.orderProducts.map((orderProduct, id) => {

                    return <div key={id} className={`${styles.fieldContainer}`}>
                        <div style={{ padding: 0 }} className={`${styles.fieldLabelItem}`}>
                            <Image src={`/fakeapiproductsimages/${orderProduct.id}.webp`} alt="img" width={145} height={80} ></Image>
                        </div>
                        <div className={`${styles.fieldTextItem}`}>
                            <Link href={`../products/${orderProduct.id}`} className={styles.fixedSpan}>{orderProduct.title}</Link>
                        </div>
                        <div style={{ whiteSpace: "normal" }} className={`${styles.fieldTextItem}`}>
                            {`Product Quantity:\n ${orderProduct.inOrderQuantity}`}
                        </div>
                        <div style={{ whiteSpace: "normal" }} className={`${styles.fieldTextItem}`}>
                            {`Product Total Value:\n ${orderProduct.inOrderTotalPrice.toFixed(2)} $`}
                        </div>
                    </div>

                }) : <Skeleton className={styles.productCard} variant="text" sx={{ fontSize: '1rem', width: "200px" }} />}
            </div>}


    </>
}