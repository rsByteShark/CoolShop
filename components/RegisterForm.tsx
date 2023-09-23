import { useState, useContext } from 'react';
import { GlobalContext } from '@/pages/_app';
import Avatar from '@mui/material/Avatar';
import LoadingButton from '@mui/lab/LoadingButton';
import CssBaseline from '@mui/material/CssBaseline';
import TextField from '@mui/material/TextField';
import Link from '@mui/material/Link';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import { ThemeProvider } from '@mui/material/styles';
import type { CoolShopLocale, FormProps } from '@/typings/types';
import { useRouter } from "next/router";
import { validateName, validateEmail, validatePassword } from '@/utils/formValidation';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { InputAdornment, IconButton } from '@mui/material';
import en from "../locales/en";
import pl from "../locales/pl";
import type { UserInfo, UserCreationFailReason } from '@/typings/types';
import coolShopLocalesData from '@/locales/coolShopLocales';

export default function RegisterForm({ defaultTheme, switchTo }: FormProps) {

    const globalContext = useContext(GlobalContext);

    const [showPassword, updateShowPassword] = useState(false);

    const [nameValidationResult, updateNameValidationResult] = useState("");

    const [emailValidationResult, updateEmailValidationResult] = useState("");

    const [passwordValidationResult, updatePasswordValidationResult] = useState("");

    const [formAwaitsResponse, updateFormAwaitsResponse] = useState(false);

    const router = useRouter();

    const { locale } = router;

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {

        updateFormAwaitsResponse(true);

        event.preventDefault();

        const data = new FormData(event.currentTarget);

        const username = data.get("username");

        const email = data.get("email");

        const password = data.get("password");


        let formHasError = false;


        if (!username) { updateNameValidationResult(coolShopLocalesData[locale as CoolShopLocale].blankName); updateFormAwaitsResponse(false); return; }

        const localNameValidationResult = validateName(username as string, locale as CoolShopLocale) || "";

        if (localNameValidationResult) { formHasError = true; updateNameValidationResult(localNameValidationResult); }



        if (!email) { updateEmailValidationResult(coolShopLocalesData[locale as CoolShopLocale].blankMail); updateFormAwaitsResponse(false); return; }

        const localEmailValidationResult = validateEmail(email as string, locale as CoolShopLocale) || "";

        if (localEmailValidationResult) { formHasError = true; updateEmailValidationResult(localEmailValidationResult); }



        if (!password) { updatePasswordValidationResult(coolShopLocalesData[locale as CoolShopLocale].blankPassword); updateFormAwaitsResponse(false); return; }

        const localPasswordValidationResult = validatePassword(password as string, locale as CoolShopLocale) || "";

        if (localPasswordValidationResult) { formHasError = true; updatePasswordValidationResult(localPasswordValidationResult); }


        if (!formHasError) {

            const requestPayload = JSON.stringify({
                username,
                email,
                password
            });

            fetch("/api/register", {
                method: "POST",
                body: requestPayload,
                headers: {
                    "Content-Type": "application/json",
                    "Content-Length": `${requestPayload.length}`,
                }
            }).then(res => {

                if (res.status === 200) {

                    res.json().then((data: UserInfo) => {

                        globalContext?.updateCurentUserInfo({
                            userName: data.userName,
                        })

                        updateFormAwaitsResponse(false);

                        globalContext?.updateLoginRegisterModalIsOpen(false);

                        router.push("/account");

                    })

                } else if (res.status === 400) {

                    res.json().then((data: UserCreationFailReason) => {

                        if (data.reason === "username") {

                            updateNameValidationResult(coolShopLocalesData[locale as CoolShopLocale].userNameTaken)

                            updateFormAwaitsResponse(false);

                        } else if (data.reason === "email") {

                            updateEmailValidationResult(coolShopLocalesData[locale as CoolShopLocale].mailTaken);

                            updateFormAwaitsResponse(false);
                        }

                    })

                }



            })



        } else updateFormAwaitsResponse(false);


    };




    return (
        <ThemeProvider theme={defaultTheme}>
            <Container component="main" maxWidth="xs">
                <CssBaseline />
                <Box
                    sx={{
                        marginTop: 8,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                    }}
                >
                    <Avatar sx={{ m: 1, bgcolor: 'secondary.main' }}>
                        <LockOutlinedIcon />
                    </Avatar>
                    <Typography component="h1" variant="h5">
                        Sign up
                    </Typography>
                    <Box component="form" noValidate onSubmit={handleSubmit} sx={{ mt: 3 }}>
                        <Grid container spacing={2}>
                            <Grid item xs={12}>
                                <TextField
                                    onChange={() => updateNameValidationResult("")}
                                    helperText={nameValidationResult}
                                    error={!!nameValidationResult}
                                    fullWidth
                                    id="username"
                                    label="Username"
                                    name="username"
                                    autoComplete="username"
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    onChange={() => updateEmailValidationResult("")}
                                    helperText={emailValidationResult}
                                    error={!!emailValidationResult}
                                    fullWidth
                                    id="email"
                                    label="Email Address"
                                    name="email"
                                    autoComplete="email"
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    onChange={() => updatePasswordValidationResult("")}
                                    helperText={passwordValidationResult}
                                    error={!!passwordValidationResult}
                                    fullWidth
                                    name="password"
                                    label="Password"
                                    type={showPassword ? "text" : "password"}
                                    id="password"
                                    autoComplete="new-password"
                                    InputProps={{
                                        endAdornment: (
                                            <InputAdornment position="end">
                                                <IconButton onClick={() => updateShowPassword(prevState => !prevState)}>
                                                    {showPassword ? <Visibility /> : <VisibilityOff />}
                                                </IconButton>
                                            </InputAdornment>
                                        )
                                    }}
                                />
                            </Grid>
                        </Grid>
                        <LoadingButton
                            loading={formAwaitsResponse}
                            color='secondary'
                            type="submit"
                            fullWidth
                            variant="contained"
                            sx={{ mt: 3, mb: 2 }}
                        >
                            Sign Up
                        </LoadingButton>
                        <Grid container justifyContent="flex-end">
                            <Grid item>
                                <Link style={{ cursor: "pointer" }} onClick={() => switchTo("login")} variant="body2">
                                    Already have an account? Sign in
                                </Link>
                            </Grid>
                        </Grid>
                    </Box>
                </Box>
            </Container>
        </ThemeProvider>
    );
}