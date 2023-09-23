import { GlobalContext } from '../pages/_app';
import Pagination from '@/components/Pagination';
import ProductCard from '@/components/ProductCard';
import styles from '@/styles/Home.module.scss'
import { type ReactNode, type ChangeEvent, useContext, useEffect, useState } from 'react';
import { useRouter } from "next/router";
import en from "../locales/en";
import pl from "../locales/pl";
import { PaginationConfig, ProductsMainPageDisplayProps } from '@/typings/types';
import Navbar from './Navbar';


function ProductsMainPageDisplay({ products, totalProducts, newProductsRequired }: ProductsMainPageDisplayProps) {

    const router = useRouter();

    const globalContext = useContext(GlobalContext);

    const { locale } = router;

    const t = locale === "en" ? en : pl;

    const [paginationConfig, updatePaginationConfig] = useState<PaginationConfig>(globalContext?.paginationConfigShadow ? globalContext.paginationConfigShadow : {
        elementsPerPage: 6,
        quantityOfElements: totalProducts,
        curentPage: 1,
        quantityOfPages: Math.ceil(totalProducts / 6),
        firstVisableCardIndex: 1,
        lastVisableCardIndex: 6,
        isMoreThenOnePage: totalProducts > 6,
        isLastPage: false,
        isFirstPage: true,
    });

    const backToFirstPaginationPage = () => {

        const newElementsPerPageValue = paginationConfig.elementsPerPage;

        const newQuantityOfPages = Math.ceil(totalProducts / newElementsPerPageValue);

        const newCurentPage = 1;

        const newFirstVisableCardIndex = (newCurentPage * newElementsPerPageValue) - (newElementsPerPageValue - 1);

        let newLastVisableCardIndex = newCurentPage * (newElementsPerPageValue);

        if (newLastVisableCardIndex > totalProducts) newLastVisableCardIndex = totalProducts;

        updatePaginationConfig(prevState => {

            return {
                ...prevState,
                elementsPerPage: newElementsPerPageValue,
                quantityOfPages: newQuantityOfPages,
                firstVisableCardIndex: newFirstVisableCardIndex,
                lastVisableCardIndex: newLastVisableCardIndex,
                curentPage: newCurentPage,
                isMoreThenOnePage: newQuantityOfPages > 1 ? true : false,
                isLastPage: newCurentPage === newQuantityOfPages ? true : false,
                isFirstPage: newCurentPage === 1 ? true : false,
            }

        })

    }

    const changeElementsPerPage = (changeEvent: ChangeEvent<HTMLSelectElement>) => {

        const newElementsPerPageValue = Number(changeEvent.target.value);

        const newQuantityOfPages = Math.ceil(totalProducts / newElementsPerPageValue);

        const newCurentPage = Math.ceil(paginationConfig.firstVisableCardIndex / newElementsPerPageValue);

        const newFirstVisableCardIndex = (newCurentPage * newElementsPerPageValue) - (newElementsPerPageValue - 1);

        let newLastVisableCardIndex = newCurentPage * (newElementsPerPageValue);

        if (newLastVisableCardIndex > totalProducts) newLastVisableCardIndex = totalProducts;

        newProductsRequired(newFirstVisableCardIndex, newLastVisableCardIndex);

        updatePaginationConfig(prevState => {

            return {
                ...prevState,
                elementsPerPage: newElementsPerPageValue,
                quantityOfPages: newQuantityOfPages,
                firstVisableCardIndex: newFirstVisableCardIndex,
                lastVisableCardIndex: newLastVisableCardIndex,
                curentPage: newCurentPage,
                isMoreThenOnePage: newQuantityOfPages > 1 ? true : false,
                isLastPage: newCurentPage === newQuantityOfPages ? true : false,
                isFirstPage: newCurentPage === 1 ? true : false,
            }

        })

    };

    const changePage = (direction: "forward" | "backward") => {

        if ((direction === "backward" && paginationConfig.curentPage - 1) ||
            (direction === "forward" && !((paginationConfig.curentPage + 1) > paginationConfig.quantityOfPages))) {

            const newCurentPage = direction === "forward" ? paginationConfig.curentPage + 1 : paginationConfig.curentPage - 1;

            const newFirstVisableCardIndex = direction === "forward" ? paginationConfig?.lastVisableCardIndex + 1 : paginationConfig.firstVisableCardIndex - paginationConfig.elementsPerPage;

            let newLastVisableCardIndex = direction === "forward" ? paginationConfig?.lastVisableCardIndex + paginationConfig.elementsPerPage : paginationConfig.firstVisableCardIndex - 1;

            if (newLastVisableCardIndex > totalProducts) newLastVisableCardIndex = totalProducts;

            newProductsRequired(newFirstVisableCardIndex, newLastVisableCardIndex);

            updatePaginationConfig(prevState => {

                return {
                    ...prevState,
                    curentPage: newCurentPage,
                    firstVisableCardIndex: newFirstVisableCardIndex,
                    lastVisableCardIndex: newLastVisableCardIndex,
                    isLastPage: newCurentPage === paginationConfig.quantityOfPages ? true : false,
                    isFirstPage: newCurentPage === 1 ? true : false,
                }

            })

        }


    }

    const renderVisableProducts = () => {


        const visableProducts: ReactNode[] = [];

        const startIndexRelativeToPageCount = ((paginationConfig.curentPage - 1) * paginationConfig.elementsPerPage);

        const startIndex = startIndexRelativeToPageCount < 0 ? 0 : startIndexRelativeToPageCount;

        for (let firstVisableProductIndex = startIndex;
            firstVisableProductIndex < (startIndex + paginationConfig.elementsPerPage);
            firstVisableProductIndex++) {


            const product = products?.[firstVisableProductIndex];


            if (product) {

                visableProducts.push(<ProductCard key={product.id} product={product} router={router} />)

            } else if (firstVisableProductIndex < totalProducts) {

                visableProducts.push(<ProductCard key={firstVisableProductIndex} product={product} router={router} />)

            } else break;

        }


        return visableProducts


    }


    useEffect(() => {

        globalContext?.updatePaginationConfigShadow(paginationConfig);

        const handleRouteChange = () => {

            globalContext?.updateSavedPageScroll(window.scrollY);

        }

        router.events.on('routeChangeStart', handleRouteChange);


        return () => {

            router.events.off('routeChangeStart', handleRouteChange);

        }


    }, [paginationConfig, router, globalContext])

    useEffect(() => {

        const prevScrollValue = globalContext?.savedPageScroll;

        if (prevScrollValue) window.scrollTo(0, prevScrollValue)


    }, [globalContext?.savedPageScroll]);

    return (
        <>
            <Navbar backToFirstPaginationPage={backToFirstPaginationPage} />
            <main className={`${styles.main}`}>
                <div className={`${styles.productsHeader}`}>{t.allProducts}</div>
                <div className={`${styles.productsContainer}`}>
                    {renderVisableProducts()}
                </div>
                <Pagination
                    t={t}
                    paginationConfig={paginationConfig}
                    changeElementsPerPage={changeElementsPerPage}
                    changePage={changePage}
                />

            </main>

        </>
    );
}

export default ProductsMainPageDisplay;