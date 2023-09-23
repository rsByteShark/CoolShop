import styles from "@/styles/ProductPage.module.scss";
import { useRouter } from "next/router";
import coolShopLocalesData from '@/locales/coolShopLocales';
import type { CartItem, CoolShopLocale, ProductCounterInterfaceProps } from '@/typings/types';
import { ChangeEvent, useState, useEffect, useContext } from "react";
import { GlobalContext } from "@/pages/_app";


function ProductCounterInterface({ productQuantity, initialCounterProductQuantity, cartItemIndex, productPrice }: ProductCounterInterfaceProps) {

    const [desiredProductQuantity, updateDesiredProductQuantity] = useState(initialCounterProductQuantity);

    const globalContext = useContext(GlobalContext);


    const handleInputChange = (changeEvent: ChangeEvent<HTMLInputElement>) => {

        const newDesiredProductQuantity = Number(changeEvent.target.value);


        if (!Number.isNaN(newDesiredProductQuantity)) {

            if (newDesiredProductQuantity <= productQuantity) updateDesiredProductQuantity(newDesiredProductQuantity);

        }


    }


    const { locale } = useRouter();


    useEffect(() => {

        globalContext?.updateCart((prevState) => {

            prevState[cartItemIndex].productInCartQuantity = desiredProductQuantity;

            console.log("updating product quantity", prevState);

            return prevState
        });

    }, [desiredProductQuantity, cartItemIndex, globalContext]);

    return (

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
            <div style={{ display: "flex", justifyContent: "center", alignItems: "center" }} >
                {`${(desiredProductQuantity * productPrice).toFixed(2)}$`}
            </div>
        </div>

    );
}

export default ProductCounterInterface;