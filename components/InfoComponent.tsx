import { Alert } from "@mui/material";
import styles from "@/styles/Navbar.module.scss"
import { useContext, useEffect } from "react";
import { GlobalContext } from "@/pages/_app";


function InfoComponent() {

    const globalContext = useContext(GlobalContext);

    useEffect(() => {

        if (globalContext?.infoComponentConfig.infoComponentIsVisable) {

            setTimeout(() => {
                globalContext.updateInfoComponentConfig((prevState => { return { ...prevState, infoComponentIsVisable: false } }))
            }, 3000);

        }

    }, [globalContext, globalContext?.infoComponentConfig.infoComponentIsVisable])

    return (
        <>

            <Alert className={globalContext?.infoComponentConfig.infoComponentIsVisable ? styles.infoComponent : styles.infoComponentHidden}
                severity={globalContext?.infoComponentConfig.infoType}
            >
                {globalContext?.infoComponentConfig.infoText}
            </Alert>

        </>
    );
}

export default InfoComponent;