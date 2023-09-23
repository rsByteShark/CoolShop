import Navbar from "@/components/Navbar";
import styles from "@/styles/Account.module.scss"
import AccountTabs from "@/components/AccountTabs";
import coolShopLocalesData from "@/locales/coolShopLocales";
import { CoolShopLocale, GlobalContextType } from "@/typings/types";
import { useRouter } from "next/router";
import CartItem from "./CartItem";
import { useState, useContext, useEffect } from "react"
import { GlobalContext } from "@/pages/_app";

function AccountCart() {

    const globalContext = useContext(GlobalContext) as GlobalContextType;

    const router = useRouter();

    const { locale } = router;

    return (
        <>
            <Navbar localeURL={`/account/orders`} />
            <AccountTabs tabType="cart" />
            <h1 className={`${styles.cartHeader} ${styles.mainContainer}`}>Koszyk ({globalContext.cart.length})</h1>
            {globalContext.cart.length ? globalContext.cart.map((cartItem, cartItemIndex) => {

                return <CartItem
                    cartItem={cartItem}
                    cartItemIndex={cartItemIndex}
                    key={cartItemIndex} />


            }) : <div className={styles.mainContainer}>Your cart is empty</div>}

        </>
    );
}

export default AccountCart;