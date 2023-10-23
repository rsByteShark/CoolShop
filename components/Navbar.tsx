import styles from "@/styles/Navbar.module.scss"
import MenuIcon from '@mui/icons-material/Menu';
import FeedbackIcon from '@mui/icons-material/Feedback';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import AccountActions from "./AccountActions";
import Link from 'next/link'
import { useState, useContext, ChangeEvent } from "react"
import { useRouter } from "next/router";
import coolShopLocalesData from "../locales/coolShopLocales"
import type { CoolShopLocale } from '@/typings/types';
import { NavbarProps } from "@/typings/types";
import LoginRegisterFormModal from "./LoginRegisterFormModal";
import { GlobalContext } from "@/pages/_app";
import InfoComponent from "./InfoComponent";

function Navbar({ backToFirstPaginationPage, localeURL }: NavbarProps) {

    const [accountActionsAreVisable, switchAccountActionsVisibility] = useState(false);

    const globalContext = useContext(GlobalContext);

    const router = useRouter();

    const { locale } = router;

    const changeLanguage = (newLanguagePref: ChangeEvent<HTMLSelectElement>) => {

        const locale = newLanguagePref.target.value;

        const newUrl = localeURL ? localeURL : "/";

        router.push(newUrl, newUrl, { locale });

    };


    const [menuModalIsOpen, setMenuModalIsOpen] = useState(false);



    return (
        <header className={`${styles.navbarContainer}`}>
            <div className={`${styles.menuButtonAndLogoImageContainer}`}>
                <button
                    title="Open Side Menu"
                    onClick={() => setMenuModalIsOpen(prevState => !prevState)}
                    className={`${styles.centredFlexbox} ${styles.menuButton}`}>
                    <MenuIcon />
                </button>
                <div role="separator" style={{ width: "1vw" }}></div>
                <Link href="/" onClick={backToFirstPaginationPage} style={{ whiteSpace: "nowrap", fontSize: "18px" }} className={`${styles.centredFlexbox} ${styles.menuButton}`}>Cool Shop</Link>
            </div>
            <div style={{ flex: 1 }}></div>
            <div className={styles.languageChangeAndLoginAccountContainer}>
                <div onClick={(evt) => { globalContext?.curentUserInfo.userName ? switchAccountActionsVisibility(prevState => !prevState) : globalContext?.updateLoginRegisterModalIsOpen(true) }} className={`${styles.menuLink} ${styles.linkButton}`} role="button">
                    <div><AccountCircleIcon /></div>
                    <div role="separator" style={{ width: "1vw" }}></div>
                    <span>
                        {globalContext?.curentUserInfo.userName ? globalContext?.curentUserInfo.userName : coolShopLocalesData[locale as CoolShopLocale].account}
                    </span>
                </div>
                <AccountActions accountActionsAreVisable={accountActionsAreVisable} switchAccountActionsVisibility={switchAccountActionsVisibility} />
                <div role="separator" style={{ width: "1vw" }}></div>
                <select
                    onChange={changeLanguage}
                    defaultValue={locale}>
                    <option value="en">EN</option>
                    <option value="pl">PL</option>
                </select>
            </div>
            <div style={{ display: `${menuModalIsOpen ? "flex" : "none"}` }} className={`${styles.menuModal}`}>
                <Link href="/" className={`${styles.navbarContainerInMenuModal}`}>Cool Shop Name</Link>
                <h3 className={styles.menuLinksSection}>Contact</h3>
                <Link href="/feedback" className={`${styles.menuLink} ${styles.linkButton}`}>
                    <div style={{ paddingLeft: "1vw", paddingRight: "1vw" }}><FeedbackIcon /></div>
                    <span>{coolShopLocalesData[locale as CoolShopLocale].feedback}</span>
                </Link>
                <div role="separator" className={`${styles.separator}`} />
            </div>
            {menuModalIsOpen ? <div onClick={() => setMenuModalIsOpen(false)} className={`${styles.menuModalBackdrop}`}></div> : undefined}
            {globalContext?.loginRegisterModalIsOpen ? <LoginRegisterFormModal /> : undefined}
            <InfoComponent />
        </header>
    );
}

export default Navbar;