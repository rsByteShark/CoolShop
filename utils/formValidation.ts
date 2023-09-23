import validator from 'validator'
import en from "../locales/en"
import pl from "../locales/pl"

type ErrorComunicate = string

/**if null is returned provided input is valid otherwise validation error cause in form of string in provided locale language is returned */
export const validateName = (input: string, curentLocale: "pl" | "en" = "en"): ErrorComunicate | null => {

    let errorComunicate = "";

    if (validator.isAlphanumeric(input, "pl-PL", { ignore: " -" }) || validator.isAlphanumeric(input, "de-DE", { ignore: " -" }) || validator.isAlphanumeric(input, "ru-RU", { ignore: " -" })) { }
    else errorComunicate = curentLocale === "pl" ? pl.illegalCharInName : en.illegalCharInName;

    if (errorComunicate) return errorComunicate;

    if (validator.isLength(input, { min: 1, max: 25 })) { }
    else errorComunicate = curentLocale === "pl" ? pl.illegalNameLength : en.illegalNameLength;

    return errorComunicate || null

}

/**if null is returned provided input is valid otherwise validation error cause in form of string provided locale language is returned */
export const validateEmail = (input: string, curentLocale: "pl" | "en" = "en"): ErrorComunicate | null => {

    let errorComunicate = "";

    if (validator.isEmail(input)) { }
    else errorComunicate = curentLocale === "pl" ? pl.illegalMail : en.illegalMail;

    return errorComunicate || null

}

/**if null is returned provided input is valid otherwise validation error cause in form of string is returned */
export const validatePassword = (input: string, curentLocale: "pl" | "en" = "en"): ErrorComunicate | null => {

    let errorComunicate = "";

    if (validator.isStrongPassword(input, { minSymbols: 0, minLowercase: 0 })) { }
    else errorComunicate = curentLocale === "pl" ? pl.illegalPassword : en.illegalPassword;

    return errorComunicate || null

}