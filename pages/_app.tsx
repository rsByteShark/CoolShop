import '@/styles/globals.css'
import type { AppProps } from 'next/app'
import React, { useState, useEffect } from "react"
import { Inter } from 'next/font/google'
const inter = Inter({ subsets: ['latin'] })
import type { PaginationConfig, GlobalContextType, UserInfo, JWTFormat, InfoComponentConfig, ProductsCache, Product, CartItem } from '@/typings/types'
import { defaultLoginRegisterFormTheme } from '@/components/LoginRegisterFormModal'
import { ThemeProvider } from '@emotion/react'


export const GlobalContext = React.createContext<GlobalContextType | undefined>(undefined);


export default function App({ Component, pageProps }: AppProps) {

  const [paginationConfigShadow, updatePaginationConfigShadow] = useState<PaginationConfig | undefined>(undefined);

  const [savedPageScroll, updateSavedPageScroll] = useState(0);

  const [loginRegisterModalIsOpen, updateLoginRegisterModalIsOpen] = useState(false);

  const [cachedproductsIDRange, updateProductsCachedIDRange] = useState([1, 6]);

  const [productsForDisplay, updateProductsForDisplay] = useState<Product[]>();

  const [cart, updateCart] = useState<CartItem[]>([{
    product: {

      id: 1,

      title: "mock product",

      price: 10,

      category: "car",

      description: "dascsadsa",

      productQuantity: 1030,

      productImageExternalURL: "/fakeapiproductsimages/1.webp",

    }, productInCartQuantity: 1,
    totalPrice: 10
  }]);

  const [infoComponentConfig, updateInfoComponentConfig] = useState<InfoComponentConfig>({
    infoComponentIsVisable: false,
    infoText: "",
    infoType: "info"
  });

  const [curentUserInfo, updateCurentUserInfo] = useState<UserInfo>({
    userName: ""
  });

  const [initialUserApiCallDone, updateInitialUserApiCallDone] = useState(false);

  useEffect(() => {

    fetch("/api/user", {
      credentials: "same-origin",
      method: "POST",
    }).then(res => {

      console.log(res.status);

      if (res.status === 200) {

        res.json().then((userData: JWTFormat) => {

          updateCurentUserInfo({ userName: userData.username })

          updateInitialUserApiCallDone(true);

        });

      } else updateInitialUserApiCallDone(true);

    });

  }, []);


  return (
    <GlobalContext.Provider value={{
      paginationConfigShadow,
      updatePaginationConfigShadow,
      savedPageScroll,
      updateSavedPageScroll,
      loginRegisterModalIsOpen,
      updateLoginRegisterModalIsOpen,
      curentUserInfo,
      updateCurentUserInfo,
      initialUserApiCallDone,
      updateInitialUserApiCallDone,
      infoComponentConfig,
      updateInfoComponentConfig,
      productsForDisplay,
      updateProductsForDisplay,
      cachedproductsIDRange,
      updateProductsCachedIDRange,
      cart,
      updateCart
    }}>
      <ThemeProvider theme={defaultLoginRegisterFormTheme}>
        <div className={`${inter.className}`}>
          <Component {...pageProps} />
        </div>
      </ThemeProvider>

    </GlobalContext.Provider>)

}
