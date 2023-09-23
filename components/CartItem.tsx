import Image from "next/image";
import ProductCounterInterface from "./ProductCounterInterface";
import DeleteIcon from '@mui/icons-material/Delete';
import styles from "@/styles/Account.module.scss"
import type { CartItemProps } from "@/typings/types";
import { useContext } from "react"
import { GlobalContext } from "@/pages/_app";


function CartItem({ cartItem, cartItemIndex }: CartItemProps) {

    const globalContext = useContext(GlobalContext);

    return (
        <main className={`${styles.mainContainer}`}>
            <div className={`${styles.fieldContainer}`}>
                <div className={styles.cartProductCheckBoxContainer}>
                    <input className={styles.cartProductCheckBox} type="checkbox" />
                </div>
                <div className={`${styles.fieldLabelItem}`}>
                    <Image src={`/fakeapiproductsimages/${cartItem.product.id}.webp`} alt="img" width={145} height={80} ></Image>
                </div>
                <div className={`${styles.fieldTextItem}`}>
                    <span className={styles.fixedSpan}>{cartItem.product.title}</span>
                </div>
                <div className={`${styles.fieldButtonItem}`}>
                    <ProductCounterInterface
                        productQuantity={cartItem.product.productQuantity}
                        productPrice={cartItem.product.price}
                        initialCounterProductQuantity={cartItem.productInCartQuantity}
                        cartItemIndex={cartItemIndex}
                        key={Math.random()}
                    />
                </div>
                <button onClick={() => {

                    globalContext?.updateCart((prevState) => {

                        const newState = [...prevState];

                        newState.splice(cartItemIndex, 1);

                        return newState
                    });

                }} className={styles.fieldTrashIcon}>
                    <DeleteIcon />
                </button>
            </div>
        </main>
    );
}

export default CartItem;