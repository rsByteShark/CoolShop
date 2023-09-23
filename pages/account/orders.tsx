import Navbar from "@/components/Navbar";
import AccountTabs from "@/components/AccountTabs";

function AccountOrders() {
    return (
        <>
            <Navbar localeURL={`/account/orders`} />
            <AccountTabs tabType="orders" />
        </>
    );
}

export default AccountOrders;