import Navbar from "@/components/Navbar";
import styles from "@/styles/Account.module.scss";
import AccountTabs from "@/components/AccountTabs";
import { GlobalContextType, StripedCart } from "@/typings/types";
import { useRouter } from "next/router";
import CartItem from "./CartItem";
import { useContext, useState } from "react";
import { GlobalContext } from "@/pages/_app";
import { Alert, AlertColor, LoadingButton } from "@mui/lab";

function AccountCart() {

    const globalContext = useContext(GlobalContext) as GlobalContextType;

    const [alertIsVisable, updateAlertIsVisable] = useState(false);

    const [orderSubmitedAlertConfig, updateOrderSubmitAlertConfig] = useState({ severity: "info", text: "null" });

    const [awaitsForApiResponse, updateAwaitsForApiResponse] = useState(false);

    const router = useRouter();

    const { locale } = router;

    const handleOrderSubmit = () => {

        const stripedCart: StripedCart = [];

        globalContext.cart.forEach(cartItem => {
            stripedCart.push({
                itemID: cartItem.product.id,
                productQuantity: cartItem.productInCartQuantity
            });
        })

        const requestPayload = JSON.stringify({
            type: "create",
            payload: {
                cart: stripedCart,
                totalOrderPrice: globalContext.totalCartValue
            }
        });

        fetch("/api/order", {
            method: "POST",
            body: requestPayload,
            credentials: "same-origin",
            headers: {
                "Content-Type": "application/json",
                "Content-Length": `${requestPayload.length}`,
            }
        }).then(res => {

            if (res.status === 200) {

                res.json().then(data => {

                    updateAwaitsForApiResponse(false);

                    updateOrderSubmitAlertConfig({ severity: "success", text: `order #${data.id} submited succesfully` });

                    updateAlertIsVisable(true);

                    console.log(data);

                    globalContext.updateCart([]);

                    globalContext.updateUserOrders(prevState => {

                        const newState = [...prevState];

                        console.log("updated")

                        newState.push(data);

                        return newState

                    })

                })

            } else {

                updateAwaitsForApiResponse(false);

                updateOrderSubmitAlertConfig({ severity: "error", text: "order creation failed" });

                updateAlertIsVisable(true);



            }


        }).catch(err => {

            updateAwaitsForApiResponse(false);

            updateOrderSubmitAlertConfig({ severity: "error", text: "order creation failed" });

            updateAlertIsVisable(true);


        })

        updateAwaitsForApiResponse(true);

    }

    return (
        <>
            <Navbar localeURL={`/account/cart`} />
            <AccountTabs tabType="cart" />
            <h1 className={`${styles.cartHeader} ${styles.mainContainer}`}>Koszyk ({globalContext.cart.length})</h1>
            {globalContext.cart.length ?
                <div className={`${styles.mainContainer}`}>
                    <div>
                        <LoadingButton
                            onClick={handleOrderSubmit}
                            loading={awaitsForApiResponse}
                            type="button"
                            variant="contained"
                            sx={{ mt: 3, mb: 2 }}
                        >
                            {`Submit Order for total ${globalContext.totalCartValue.toFixed(2)} $`}
                        </LoadingButton>
                    </div>
                </div> : undefined}
            <div className={`${styles.mainContainer}`}>
                {alertIsVisable ? <Alert severity={orderSubmitedAlertConfig.severity as AlertColor}>{orderSubmitedAlertConfig.text}</Alert> : undefined}
            </div>
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