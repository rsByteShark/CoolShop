import { useState, useContext } from "react";
import Avatar from '@mui/material/Avatar';
import CssBaseline from '@mui/material/CssBaseline';
import TextField from '@mui/material/TextField';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import Link from '@mui/material/Link';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import { ThemeProvider } from '@mui/material/styles';
import type { FormProps, UserOrder } from '@/typings/types';
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { InputAdornment, IconButton } from "@mui/material";
import { LoadingButton } from "@mui/lab";
import { validateName, validateEmail, validatePassword } from '@/utils/formValidation';
import { useRouter } from "next/router";
import { GlobalContext } from '@/pages/_app';
import coolShopLocalesData from "../locales/coolShopLocales"
import type { UserInfo, CoolShopLocale } from '@/typings/types';

function LoginForm({ defaultTheme, switchTo }: FormProps) {

    const globalContext = useContext(GlobalContext);

    const [showPassword, updateShowPassword] = useState(false);

    const [rememberChecked, updateRememberChecked] = useState(false)

    const [emailOrUserValidationResult, updateEmailOrUserValidationResult] = useState("");

    const [passwordValidationResult, updatePasswordValidationResult] = useState("");

    const [formAwaitsResponse, updateFormAwaitsResponse] = useState(false);

    const router = useRouter();

    const { locale } = router;

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {

        updateFormAwaitsResponse(true);

        event.preventDefault();

        const data = new FormData(event.currentTarget);

        const emailOrUser = data.get("email");

        const password = data.get("password");

        let credType: string;

        let formHasError = false;

        //check if username or mail was provided
        if (!validateEmail(emailOrUser as string)) {

            credType = "email";

            if (!emailOrUser) { updateEmailOrUserValidationResult(coolShopLocalesData[locale as CoolShopLocale].blankMail); updateFormAwaitsResponse(false); return; }

            const localEmailOrUserValidationResult = validateEmail(emailOrUser as string, locale as CoolShopLocale) || "";

            if (localEmailOrUserValidationResult) { formHasError = true; updateEmailOrUserValidationResult(localEmailOrUserValidationResult); }


        } else {

            credType = "username";

            if (!emailOrUser) { updateEmailOrUserValidationResult(coolShopLocalesData[locale as CoolShopLocale].blankName); updateFormAwaitsResponse(false); return; }

            const localEmailOrUserValidationResult = validateName(emailOrUser as string, locale as CoolShopLocale) || "";

            if (localEmailOrUserValidationResult) { formHasError = true; updateEmailOrUserValidationResult(localEmailOrUserValidationResult); }

        };

        if (!password) { updatePasswordValidationResult(coolShopLocalesData[locale as CoolShopLocale].blankPassword); updateFormAwaitsResponse(false); return; }

        const localPasswordValidationResult = validatePassword(password as string, locale as CoolShopLocale) || "";

        if (localPasswordValidationResult) { formHasError = true; updatePasswordValidationResult(localPasswordValidationResult); }


        if (!formHasError) {

            const requestPayload = JSON.stringify({
                emailOrUser,
                password,
                rememberChecked,
                credType,
            });

            fetch("/api/login", {
                method: "POST",
                body: requestPayload,
                headers: {
                    "Content-Type": "application/json",
                    "Content-Length": `${requestPayload.length}`,
                }
            }).then(res => {

                if (res.status === 200) {

                    res.json().then((data: { userInfo: UserInfo, userOrders: UserOrder[] }) => {

                        globalContext?.updateCurentUserInfo({
                            userName: data.userInfo.userName,
                        })

                        globalContext?.updateUserOrders(data.userOrders);

                        updateFormAwaitsResponse(false);

                        globalContext?.updateLoginRegisterModalIsOpen(false);

                        router.push("/account");

                    })

                } else {

                    updateEmailOrUserValidationResult(coolShopLocalesData[locale as CoolShopLocale].invalidCredentials);

                    updatePasswordValidationResult(coolShopLocalesData[locale as CoolShopLocale].invalidCredentials);

                    updateFormAwaitsResponse(false);

                }



            })



        } else updateFormAwaitsResponse(false);



    };

    const handleRememberChange = (event: React.ChangeEvent<HTMLInputElement>) => {

        updateRememberChecked(event.target.checked);

    }

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
                        Sign in
                    </Typography>
                    <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
                        <TextField
                            onChange={() => updateEmailOrUserValidationResult("")}
                            helperText={emailOrUserValidationResult}
                            error={!!emailOrUserValidationResult}
                            margin="normal"
                            required
                            fullWidth
                            id="email/username"
                            label="Email/Username"
                            name="email"
                            autoComplete="email"
                            autoFocus
                        />
                        <TextField
                            onChange={() => updatePasswordValidationResult("")}
                            helperText={passwordValidationResult}
                            error={!!passwordValidationResult}
                            margin="normal"
                            required
                            fullWidth
                            name="password"
                            label="Password"
                            id="password"
                            autoComplete="current-password"
                            type={showPassword ? "text" : "password"}
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
                        <FormControlLabel
                            control={<Checkbox onChange={handleRememberChange} value="remember" color="primary" />}
                            label="Remember me"
                        />
                        <LoadingButton
                            loading={formAwaitsResponse}
                            type="submit"
                            fullWidth
                            variant="contained"
                            sx={{ mt: 3, mb: 2 }}
                        >
                            Sign In
                        </LoadingButton>
                        <Grid container>
                            <Grid item xs>
                            </Grid>
                            <Grid item>
                                <Link onClick={() => switchTo("register")} style={{ cursor: "pointer" }} variant="body2">
                                    {"Don't have an account? Sign Up"}
                                </Link>
                            </Grid>
                        </Grid>
                    </Box>
                </Box>
            </Container>
        </ThemeProvider>

    );
}

export default LoginForm;