import Navbar from '@/components/Navbar'
import AccountTabs from './AccountTabs';
import styles from "@/styles/Account.module.scss"
import { useState, useContext } from 'react'
import { GlobalContext } from '@/pages/_app'
import { LoadingButton } from '@mui/lab'
import EditIcon from '@mui/icons-material/Edit'
import CloseIcon from '@mui/icons-material/Close'
import { TextField, InputAdornment, IconButton } from '@mui/material'
import { validateName } from '@/utils/formValidation'
import { useRouter } from "next/router"
import coolShopLocalesData from "../locales/coolShopLocales"
import type { CoolShopLocale, UserInfo } from '@/typings/types';


function AccountProfile() {

    const globalContext = useContext(GlobalContext);

    const router = useRouter();

    const { locale } = router;

    const [awaitingOnApiResponse, updateAwaitingOnApiResponse] = useState(false);

    //username related states
    const [usernameFieldValue, changeUsernameFieldValue] = useState(String(globalContext?.curentUserInfo.userName))

    const [usernameIsEdited, updateUserIsEdited] = useState(false);

    const [newUsernameValueValidationResult, updateNewUserNameValueValidationResult] = useState("");


    const handleUsernameChange = () => {

        updateAwaitingOnApiResponse(true);

        const newUsernameValue = String(usernameFieldValue);

        if (!usernameIsEdited) { updateAwaitingOnApiResponse(false); return; }

        if (newUsernameValue === globalContext?.curentUserInfo.userName) { updateNewUserNameValueValidationResult(coolShopLocalesData[locale as CoolShopLocale].usernameNotChanged); updateAwaitingOnApiResponse(false); return; }

        if (!newUsernameValue) { updateNewUserNameValueValidationResult(coolShopLocalesData[locale as CoolShopLocale].blankName); updateAwaitingOnApiResponse(false); return; }

        const localNameValidationResult = validateName(newUsernameValue, locale as CoolShopLocale) || "";

        if (localNameValidationResult) { updateNewUserNameValueValidationResult(localNameValidationResult); updateAwaitingOnApiResponse(false); return };


        const requestPayload = JSON.stringify({ username: newUsernameValue });

        fetch("/api/credentialsChange", {
            method: "POST",
            body: requestPayload,
            credentials: "same-origin",
            headers: {
                "Content-Type": "application/json",
                "Content-Length": `${requestPayload.length}`,
            }
        }).then(res => {

            if (res.status === 200) {

                res.json().then((data: UserInfo) => {

                    updateAwaitingOnApiResponse(false)

                    globalContext?.updateCurentUserInfo((prevState) => { return { ...prevState, userName: data.userName } })

                    globalContext?.updateInfoComponentConfig({
                        infoComponentIsVisable: true,
                        infoText: "Username Changed",
                        infoType: "success",
                    })

                    updateUserIsEdited(false);

                })

            } else {

                updateAwaitingOnApiResponse(false);

                updateNewUserNameValueValidationResult(coolShopLocalesData[locale as CoolShopLocale].usernameNotChanged);

                updateUserIsEdited(false);

            }



        })

    }

    return (
        <>

            <Navbar localeURL={`/account`} />
            <AccountTabs tabType='accountData' />
            <main className={`${styles.mainContainer}`}>
                <div className={`${styles.fieldContainer}`}>
                    <div className={`${styles.fieldLabelItem}`}>{coolShopLocalesData[locale as CoolShopLocale].LogedAs}</div>
                    <div className={`${styles.fieldTextItem}`}>
                        <TextField
                            onChange={(evt) => { changeUsernameFieldValue(evt.target.value); updateNewUserNameValueValidationResult("") }}
                            helperText={newUsernameValueValidationResult}
                            error={!!newUsernameValueValidationResult}
                            value={usernameFieldValue}
                            disabled={!usernameIsEdited}
                            type={"text"}
                            InputProps={{
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <IconButton onClick={() => {
                                            updateUserIsEdited(prevState => !prevState);
                                            changeUsernameFieldValue(String(globalContext?.curentUserInfo.userName));
                                            updateNewUserNameValueValidationResult("")
                                        }}>
                                            {usernameIsEdited ? <CloseIcon /> : <EditIcon />}
                                        </IconButton>
                                    </InputAdornment>
                                )
                            }}
                        />
                    </div>
                    <div className={`${styles.fieldButtonItem}`}>
                        <LoadingButton
                            onClick={handleUsernameChange}
                            loading={awaitingOnApiResponse}
                            type="submit"
                            variant="contained"
                        >
                            {coolShopLocalesData[locale as CoolShopLocale].changeUsername}
                        </LoadingButton>
                    </div>
                </div>
            </main>

        </>
    );
}

export default AccountProfile;