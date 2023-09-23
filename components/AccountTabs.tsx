import type { AccountTabsProps } from "@/typings/types";
import Link from "next/link";
import styles from "@/styles/Account.module.scss"

function AccountTabs({ tabType }: AccountTabsProps) {
    return (
        <nav className={`${styles.accountTabsContainer}`}>
            <Link href={"/account"} className={`${styles.accountTab} ${tabType === "accountData" ? styles.currentTab : styles.notCurrentTab}`}>Account Data</Link>
            <Link href={"/account/orders"} className={`${styles.accountTab}  ${tabType === "orders" ? styles.currentTab : styles.notCurrentTab}`}>Orders</Link>
            <Link href={"/account/cart"} className={`${styles.accountTab}  ${tabType === "cart" ? styles.currentTab : styles.notCurrentTab}`}>Cart</Link>
        </nav>
    );
}

export default AccountTabs;