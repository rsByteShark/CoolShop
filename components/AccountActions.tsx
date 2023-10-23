import styles from "@/styles/Navbar.module.scss"
import type { AccountActionsProps } from "@/typings/types"
import { useState, useContext } from 'react';
import { GlobalContext } from "@/pages/_app";
import { useRouter } from "next/router";

export default function AccountActions({ accountActionsAreVisable, switchAccountActionsVisibility }: AccountActionsProps) {

    const globalContext = useContext(GlobalContext);

    const router = useRouter();

    const [awaitsForResponse, updateAwaitsForResponse] = useState(false);

    const handleLogout = () => {

        updateAwaitsForResponse(true);

        document.body.style.cursor = "progress";

        fetch("/api/logout", {
            credentials: "same-origin",
            method: "POST",
        }).then(res => {

            if (res.status === 200) {

                globalContext?.updateCurentUserInfo({
                    userName: ""
                })

            }

            router.push("/");

            switchAccountActionsVisibility(prevState => !prevState);
            document.body.style.cursor = "";
            updateAwaitsForResponse(false);

            globalContext?.updateInfoComponentConfig({
                infoType: "info",

                infoText: "loged out",

                infoComponentIsVisable: true
            })



        });



    }

    return (
        accountActionsAreVisable ? <div className={`${styles.accountActionsContainer}`}>
            <div className={`${styles.accountActions}`}>
                <button onClick={() => { router.push("/account"); switchAccountActionsVisibility(prevState => !prevState) }} className={`${styles.accountAction}`}>Profile</button>
                <button onClick={() => { router.push("/account/cart"); switchAccountActionsVisibility(prevState => !prevState) }} className={`${styles.accountAction}`}>Cart</button>
                <button disabled={awaitsForResponse ? true : false} onClick={() => handleLogout()} className={`${styles.accountAction}`}>Logout</button>
            </div>
        </div> : null
    )
}