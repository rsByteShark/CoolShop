import Image from "next/image";
import ProductCounterInterface from "./ProductCounterInterface";
import DeleteIcon from '@mui/icons-material/Delete';
import styles from "@/styles/Account.module.scss"
import type { CartItemProps } from "@/typings/types";
import { useContext } from "react"
import { GlobalContext } from "@/pages/_app";
import Link from "next/link";


function CartItem({ cartItem, cartItemIndex }: CartItemProps) {

    const globalContext = useContext(GlobalContext);

    return (
        <div className={`${styles.mainContainer}`}>
            <div className={`${styles.fieldContainer}`}>
                <div className={`${styles.fieldLabelItem}`}>
                    <Image src={`/fakeapiproductsimages/${cartItem.product.id}.webp`} alt="img" width={145} height={80} ></Image>
                </div>
                <div className={`${styles.fieldTextItem}`}>
                    <Link href={`../products/${cartItem.product.id}`} className={styles.fixedSpan}>{cartItem.product.title}</Link>
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
        </div>
    );
}

export default CartItem;