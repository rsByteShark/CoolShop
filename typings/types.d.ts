import type { Dispatch, SetStateAction } from "react"


export interface GlobalContextType {
    paginationConfigShadow: PaginationConfig | undefined

    updatePaginationConfigShadow: Dispatch<SetStateAction<PaginationConfig | undefined>>

    savedPageScroll: number

    updateSavedPageScroll: Dispatch<SetStateAction<number>>

    loginRegisterModalIsOpen: boolean

    updateLoginRegisterModalIsOpen: Dispatch<SetStateAction<boolean>>

    curentUserInfo: UserInfo

    updateCurentUserInfo: Dispatch<SetStateAction<UserInfo> | ((prevState: UserInfo) => UserInfo)>

    initialUserApiCallDone: boolean

    updateInitialUserApiCallDone: Dispatch<SetStateAction<boolean>>

    infoComponentConfig: InfoComponentConfig

    updateInfoComponentConfig: Dispatch<SetStateAction<InfoComponentConfig> | ((prevState: InfoComponentConfig) => InfoComponentConfig)>

    productsForDisplay: Product[] | undefined

    updateProductsForDisplay: Dispatch<SetStateAction<Product[] | undefined> | ((prevState: Product[] | undefined) => Product[] | undefined)>

    cachedproductsIDRange: number[]

    updateProductsCachedIDRange: Dispatch<SetStateAction<number[]>>

    cart: CartItem[]

    updateCart: Dispatch<SetStateAction<CartItem[]> | ((prevState: CartItem[]) => CartItem[])>

}


export type UserInfo = {

    userName: string

}

export type UserCreationFailReason = {

    reason: string

}

export type FakeStoreApiProduct = {

    id: number

    title: string

    price: number

    description: string

    category: string

    image: string

    rating: {

        rate: number

        count: number

    }

}

export type Product = {
    id: number

    title: string

    price: number

    category: string

    description: string

    productQuantity: number,

    productImageExternalURL: string

}


export type PaginationConfig = {

    elementsPerPage: number

    quantityOfElements: number

    curentPage: number

    quantityOfPages: number

    firstVisableCardIndex: number

    lastVisableCardIndex: number

    isMoreThenOnePage: boolean

    isLastPage: boolean,

    isFirstPage: boolean
}

export type InfoComponentConfig = {

    infoType: "error" | "warning" | "info" | "success"

    infoText: string

    infoComponentIsVisable: boolean

}

export type CartItem = {

    product: Product

    productInCartQuantity: number

}

export interface CartItemProps {

    cartItem: CartItem

    cartItemIndex: number

}

export interface NavbarProps {

    backToFirstPaginationPage?: () => void

    localeURL?: string
}

export interface PaginationProps {

    t: any

    paginationConfig: PaginationConfig

    changeElementsPerPage: (changeEvent: ChangeEvent<HTMLSelectElement>) => void

    changePage: (direction: "forward" | "backward") => void
}


export interface ProductsMainPageDisplayProps {

    products: Product[]

    totalProducts: number

    newProductsRequired: (s: number, e: number) => void
}

export interface ProductCardProps {

    product: Product

    router: NextRouter
}

export interface FormProps {

    defaultTheme: Theme

    switchTo: Dispatch<SetStateAction<"login" | "register">>

}

export interface AccountActionsProps {

    accountActionsAreVisable: boolean

    switchAccountActionsVisibility: Dispatch<SetStateAction<boolean>>

}

export type AccountTabsProps = {

    tabType: "accountData" | "orders" | "cart"

}

export interface ProductCounterInterfaceProps {

    productQuantity: number

    productPrice: number

    initialCounterProductQuantity: number

    cartItemIndex: number


}

export type JWTFormat = {

    username: string,

    iat: number,

    exp: number

}

export type LoginCredentials = {

    emailOrUser: string

    password: string

    rememberChecked: boolean

    credType: "email" | "username"

    [key: string]: string | boolean;
}


export type CoolShopEnvVariables = {

    /**private key used to sign json web token */
    JWT_PRIVATE_RSA: string

    /**public key used to verify json web token */
    JWT_PUBLIC_RSA: string

    /**port on wich next js server will listn */
    PORT: string

    /**flag that indicates do products from fakestoreapi will be fetch and included in shop offer */
    INCLUDE_FAKESTORE_API: string

    /**timestamp of next planned fakestore api data fetch */
    NEXT_FAKESTORE_API_REFRESH: number

}

export type ProductsCache = {

    [key: string]: Product
}

export type CoolShopLocale = "pl" | "en"

