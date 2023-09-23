import Image from 'next/image';
import Link from 'next/link';
import Button from '@mui/material/Button';
import styles from '@/styles/Home.module.scss';
import type { CoolShopLocale, ProductCardProps } from '@/typings/types';
import type { MouseEvent } from 'react';
import coolShopLocalesData from '@/locales/coolShopLocales';
import { Skeleton } from '@mui/material';

export default function ProductCard({ product, router }: ProductCardProps) {

    const routeThroughButton = (clickEvent: MouseEvent<HTMLButtonElement>) => {

        clickEvent.preventDefault();

        clickEvent.stopPropagation();

        router.push(`/products/1`);

    }

    const { locale } = router;

    return (

        <>

            {product ? <Link href={`/products/${String(product.id)}`} className={`${styles.productCard}`}>
                <div className={`${styles.productCardImageContainer}`}>
                    <Image src={`/fakeapiproductsimages/${product.id}.webp`} sizes="(max-width: 450px) 56vw" alt='logo' fill />
                </div>
                <div title={product.title} className={`${styles.productCardNameContainer}`}>
                    {product.title}
                </div>
                <div className={`${styles.productCardPriceContainer}`}>
                    <Button onClick={routeThroughButton} variant="contained" color='primary'>{coolShopLocalesData[locale as CoolShopLocale].buyNow} {Number(product.price).toFixed(2)}$</Button>
                </div>
            </Link> :
                <Skeleton className={styles.productCard} variant="text" sx={{ fontSize: '1rem' }} />}

        </>

    );
}