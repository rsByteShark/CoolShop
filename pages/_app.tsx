import '@/styles/globals.css'
import type { AppProps } from 'next/app'
import React, { useState, useEffect } from "react"
import { Inter } from 'next/font/google'
const inter = Inter({ subsets: ['latin'] })
import type { PaginationConfig, GlobalContextType, UserInfo, JWTFormat, InfoComponentConfig, Product, CartItem, UserOrder } from '@/typings/types'
import { defaultLoginRegisterFormTheme } from '@/components/LoginRegisterFormModal'
import { ThemeProvider } from '@emotion/react'


export const GlobalContext = React.createContext<GlobalContextType | undefined>(undefined);


export default function App({ Component, pageProps }: AppProps) {

  const [paginationConfigShadow, updatePaginationConfigShadow] = useState<PaginationConfig | undefined>(undefined);

  const [savedPageScroll, updateSavedPageScroll] = useState(0);

  const [loginRegisterModalIsOpen, updateLoginRegisterModalIsOpen] = useState(false);

  const [cachedproductsIDRange, updateProductsCachedIDRange] = useState([1, 6]);

  const [productsForDisplay, updateProductsForDisplay] = useState<Product[]>();

  const [cart, updateCart] = useState<CartItem[]>([]);

  const [userOrders, updateUserOrders] = useState<UserOrder[]>([]);

  const [totalCartValue, updateTotalCartValue] = useState<number>(0);

  const [infoComponentConfig, updateInfoComponentConfig] = useState<InfoComponentConfig>({
    infoComponentIsVisable: false,
    infoText: "",
    infoType: "info"
  });

  const [curentUserInfo, updateCurentUserInfo] = useState<UserInfo>({
    userName: ""
  });

  const [initialUserApiCallDone, updateInitialUserApiCallDone] = useState(false);

  const updateCartMiddleware = (callBackOrNewState: CartItem[] | ((prevState: CartItem[]) => CartItem[])) => {

    if (typeof callBackOrNewState === "function") {

      updateCart(prevState => {

        const newState = callBackOrNewState(prevState);

        //count new total value of cart

        let totalPriceOfProductsInCart = 0;

        const duplicateDetection: number[] = [];

        newState.forEach((cartItem, index) => {

          if (duplicateDetection.includes(cartItem.product.id)) {

            newState.splice(index, 1);

          } else {

            duplicateDetection.push(cartItem.product.id);

            totalPriceOfProductsInCart = totalPriceOfProductsInCart + (cartItem.product.price * cartItem.productInCartQuantity)

          }

        })

        updateTotalCartValue(totalPriceOfProductsInCart);

        return newState

      })

    } else {

      let totalPriceOfProductsInCart = 0;

      const duplicateDetection: number[] = [];

      callBackOrNewState.forEach((cartItem, index) => {

        if (duplicateDetection.includes(cartItem.product.id)) {

          callBackOrNewState.splice(index, 1);

        } else {

          duplicateDetection.push(cartItem.product.id);

          totalPriceOfProductsInCart = totalPriceOfProductsInCart + (cartItem.product.price * cartItem.productInCartQuantity)

        }

      })

      updateTotalCartValue(totalPriceOfProductsInCart);

      updateCart(callBackOrNewState);



    }

  }

  useEffect(() => {

    fetch("/api/user", {
      credentials: "same-origin",
      method: "POST",
    }).then(res => {

      if (res.status === 200) {

        res.json().then((userData: JWTFormat) => {

          updateCurentUserInfo({ userName: userData.username })

          updateInitialUserApiCallDone(true);

        });

      } else updateInitialUserApiCallDone(true);

    });


    const userOrdersRequestPayload = JSON.stringify({
      type: "get",
    });

    fetch("/api/order", {
      credentials: "same-origin",
      method: "POST",
      body: userOrdersRequestPayload,
      headers: {
        "Content-Type": "application/json",
        "Content-Length": `${userOrdersRequestPayload.length}`,
      }
    }).then(res => {

      if (res.status == 200) {

        res.json().then(data => {

          const userOrders: UserOrder[] = data;

          updateUserOrders(userOrders);

        })

      }



    })

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
      updateCart: updateCartMiddleware,
      totalCartValue,
      updateUserOrders,
      userOrders
    }}>
      <ThemeProvider theme={defaultLoginRegisterFormTheme}>
        <div className={`${inter.className}`}>
          <Component {...pageProps} />
        </div>
      </ThemeProvider>

    </GlobalContext.Provider>)

}
