import type { InferGetStaticPropsType, GetStaticPaths, } from 'next';
import styles from "@/styles/ProductPage.module.scss";
import { useContext, useState } from "react";
import Image from 'next/image';
import Navbar from '@/components/Navbar';
import Button from '@mui/material/Button';
import Head from 'next/head'
import { useRouter } from "next/router";
import type { CoolShopLocale, Product } from '@/typings/types';
import type { ChangeEvent } from 'react';
import coolShopLocalesData from '@/locales/coolShopLocales';
import { GlobalContext } from '../_app';
import prisma from '@/db/prismaClient';

export const getServerSideProps = async (obj: any) => {

    console.log(obj.params.id);


    //as we know that fakeapiproducts id is just incremental number we can get from db first six products
    const product = await prisma.fakeapidatalocalstorage.findFirst({
        where: {
            id: Number(obj.params.id)
        }
    });



    return { props: { product: product as Product } }
}

export default function Page({ product }: InferGetStaticPropsType<typeof getServerSideProps>) {

    console.log(product);

    const globalContext = useContext(GlobalContext);

    const [productQuantity, updateProductQuantity] = useState(product.productQuantity);

    const [desiredProductQuantity, updateDesiredProductQuantity] = useState(1);

    const handleInputChange = (changeEvent: ChangeEvent<HTMLInputElement>) => {

        const newDesiredProductQuantity = Number(changeEvent.target.value);


        if (!Number.isNaN(newDesiredProductQuantity)) {

            if (newDesiredProductQuantity <= productQuantity) updateDesiredProductQuantity(newDesiredProductQuantity);

        }


    }

    const router = useRouter();

    const { locale } = router;


    return (
        <div>
            <Head>
                <title>{product.title}</title>
            </Head>
            <Navbar localeURL={`/products/${product.id}`} />
            <main className={`${styles.productPageContainer}`}>
                <div className={`${styles.productImageContainer}`}>
                    <Image src={`/fakeapiproductsimages/${product.id}.webp`} sizes="(max-width: 450px) 56vw" alt='logo' fill />
                </div>
                <div className={`${styles.productTitleContainer}`}>
                    {`${product.title}`}
                </div>
                <div className={`${styles.productCounterElementText}`}>{coolShopLocalesData[locale as CoolShopLocale].price}:<b style={{ marginLeft: "1vw" }}>{` ${(desiredProductQuantity * Number(product.price)).toFixed(2)}`}$</b> <span style={{ marginLeft: "1vw" }}>{coolShopLocalesData[locale as CoolShopLocale].total}</span>  </div>
                <div className={`${styles.productCountContainer}`}>
                    <div className={`${styles.productCounterElementText}`}>{coolShopLocalesData[locale as CoolShopLocale].quantity}</div>
                    <div className={`${styles.productCountInterfaceContainer}`}>
                        <button
                            onClick={() => {

                                if (desiredProductQuantity > 1) updateDesiredProductQuantity(prevState => prevState - 1);

                            }}
                            className={desiredProductQuantity > 1 ? `${styles.productCounterElementDec} ${styles.scalableFontSize}` : `${styles.productCounterElementDecDisabled} ${styles.scalableFontSize}`}

                        >-</button>
                        <div className={`${styles.productCounterElementCount} ${styles.scalableFontSize}`}>
                            <input
                                onChange={handleInputChange}
                                style={{ width: `${desiredProductQuantity === 0 ? "1em" : String(desiredProductQuantity).length}em` }}
                                type='text'
                                value={desiredProductQuantity === 0 ? "" : desiredProductQuantity}>
                            </input>
                        </div>
                        <button
                            onClick={() => {

                                if (desiredProductQuantity < productQuantity) updateDesiredProductQuantity(prevState => prevState + 1);

                            }}
                            className={desiredProductQuantity < productQuantity ? `${styles.productCounterElementInc} ${styles.scalableFontSize}` : `${styles.productCounterElementIncDisabled} ${styles.scalableFontSize}`}

                        >+</button>
                    </div>
                    <div className={`${styles.productCounterElementText}`}>{locale === "pl" ? "z" : "from"} {productQuantity}</div>

                </div>
                <div className={`${styles.addToCartButtonContainer}`}>
                    <Button onClick={() => {

                        globalContext?.updateCart((prevState) => {

                            const newState = [...prevState];

                            newState.push({
                                product: product,
                                productInCartQuantity: desiredProductQuantity
                            })

                            globalContext.updateInfoComponentConfig({
                                infoType: "info",
                                infoText: "Product added to cart",
                                infoComponentIsVisable: true
                            })

                            return newState

                        })

                    }} variant="contained" color='primary'>{coolShopLocalesData[locale as CoolShopLocale].addToCart}</Button>
                </div>
                <div className={`${styles.productDescContainer}`}>
                    {`${product.description}`}
                </div>

            </main>

        </div>
    )
}