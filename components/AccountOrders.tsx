import AccountTabs from "./AccountTabs";
import Navbar from "./Navbar";
import styles from "@/styles/Account.module.scss"
import { GlobalContext } from "@/pages/_app";
import { useContext } from "react"
import Link from "next/link";

function AccountOrders() {

    const globalContext = useContext(GlobalContext);

    return (

        <>
            <Navbar localeURL={`/account/orders`} />
            <AccountTabs tabType="orders" />
            <h1 className={`${styles.cartHeader} ${styles.mainContainer}`}>Zamówienia ({globalContext?.userOrders.length})</h1>
            {globalContext?.userOrders.map(userOrder => {

                return <div key={userOrder.id} className={styles.mainContainer}>
                    <div className={`${styles.fieldContainer}`}>
                        <div className={`${styles.fieldTextItem}`}>
                            {`OrderID: #${userOrder.id}`}
                        </div>
                        <div className={`${styles.fieldTextItem}`}>
                            {`Order Status: ${userOrder.status}`}
                        </div>
                        <div className={`${styles.fieldTextItem}`}>
                            {`Payment Status: paid`}
                        </div>
                        <div className={`${styles.fieldTextItem}`}>
                            {`Order value: ${userOrder.orderTotalPrice.toFixed(2)}$`}
                        </div>
                        <div style={{ color: "violet", textDecoration: "underline" }} className={`${styles.fieldTextItem}`}>
                            <Link href={`/order/${userOrder.id}`}>Order Detalies</Link>
                        </div>
                    </div>
                </div>

            })}
        </>

    );
}

export default AccountOrders;