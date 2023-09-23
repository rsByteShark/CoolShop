import styles from "../styles/Navbar.module.scss";
import { useContext, useState } from "react";
import { GlobalContext } from "@/pages/_app";
import { createTheme } from '@mui/material/styles';
import LoginForm from "./LoginForm";
import RegisterForm from "./RegisterForm";

export const defaultLoginRegisterFormTheme = createTheme({
    palette: {
        mode: "dark",
        primary: { main: '#9c27b0', }
    }
});

function LoginRegisterFormModal() {

    const globalContext = useContext(GlobalContext);

    const [registerOrLogin, updateRegisterOrLogin] = useState<"login" | "register">("login");


    return (
        <>
            <div onClick={() => globalContext?.updateLoginRegisterModalIsOpen(false)} className={`${styles.menuModalBackdrop}`}></div>
            <div className={registerOrLogin === "login" ? `${styles.loginModal}` : `${styles.registerModal}`}>
                <div className={`${styles.formContainer}`}>
                    {registerOrLogin === "login" ?
                        <LoginForm defaultTheme={defaultLoginRegisterFormTheme} switchTo={updateRegisterOrLogin} /> :
                        <RegisterForm defaultTheme={defaultLoginRegisterFormTheme} switchTo={updateRegisterOrLogin} />}
                </div>
            </div>
        </>

    );
}

export default LoginRegisterFormModal;






