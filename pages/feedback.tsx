import Head from 'next/head'
import validator from 'validator'
import accstyles from '@/styles/Account.module.scss'
import styles from '@/styles/Feedback.module.scss'
import Navbar from '@/components/Navbar'
import { useState } from 'react';
import { Alert, AlertColor, LoadingButton } from '@mui/lab';
import pl from '@/locales/pl'
import en from '@/locales/en'
import { useRouter } from 'next/router'


export default function Feedback() {

    const [alertIsVisable, updateAlertIsVisable] = useState(false);

    const [feedbackSubmitedAlertConfig, updateFeedbackSubmitAlertConfig] = useState({ severity: "info", text: "null" });

    const [feedbackInputValue, changeFeedbackInputValue] = useState("");

    const [awaitsForApiResponse, updateAFAR] = useState(false);

    const router = useRouter();

    const { locale } = router;

    const handleFeedSubmit = () => {

        //check if feed contains forbiden chars
        if (validator.isAlphanumeric(feedbackInputValue, "pl-PL", { ignore: " -" }) || validator.isAlphanumeric(feedbackInputValue, "de-DE", { ignore: " -" }) || validator.isAlphanumeric(feedbackInputValue, "ru-RU", { ignore: " -" })) { }
        else {

            updateFeedbackSubmitAlertConfig({
                severity: "error",
                text: locale === "pl" ? pl.illegalCharInFeedback : en.illegalCharInFeedback
            })

            updateAlertIsVisable(true);
        }

    }

    return (
        <>
            <Head>
                <title>Feed comments</title>
                <meta name="description" content="Feedback section of coolshop" />
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                <link rel="icon" href="/favicon.ico" />
            </Head>
            <Navbar localeURL={`/feedback`} />
            <main className={`${accstyles.mainContainer}`}>
                <textarea value={feedbackInputValue} onChange={(e) => changeFeedbackInputValue(e.target.value)} className={styles.feedInput} placeholder='Leave feedback about page' style={{ width: "100%" }} name="feedback" id="1" cols={30} rows={4}></textarea>
                {alertIsVisable ? <Alert severity={feedbackSubmitedAlertConfig.severity as AlertColor}>{feedbackSubmitedAlertConfig.text}</Alert> : undefined}
                <div className={styles.feedSubmitButton}>
                    <LoadingButton
                        disabled={true}
                        onClick={handleFeedSubmit}
                        loading={awaitsForApiResponse}
                        type="button"
                        variant="contained"
                        sx={{ mt: 3, mb: 2, fontSize: "15px" }}
                    >
                        {`Submit Feedback (currently disabled)`}
                    </LoadingButton>
                </div>

            </main>
        </>
    )
}