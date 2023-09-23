
import Head from 'next/head'
import type { InferGetStaticPropsType, GetStaticProps } from 'next'
import type { Product } from '@/typings/types';
import ProductsMainPageDisplay from '@/components/ProductsMainPageDisplay';
import prisma from '@/db/prismaClient';
import { useState, useContext } from 'react';
import { GlobalContext } from './_app';


type ResolvedFetchIsNeeded = {

  fetchIsNeeded: boolean,

  startFetchIndex: number,

  endFetchIndex: number
}

export const getStaticProps: GetStaticProps<{
  initialStaticProducts: Product[],
  initialTotalProducts: number,
}> = async () => {


  //initialy we want to fetch only 6 products and total number of products as Static props, then addictional products are fetched from frontend

  const totalProducts = await prisma.fakeapidatalocalstorage.count();

  //as we know that fakeapiproducts id is just incremental number we can get from db first six products
  const products = await prisma.fakeapidatalocalstorage.findMany({
    where: {
      id: {
        gte: 1,
        lte: 6
      }
    }
  });

  return { props: { initialStaticProducts: products, initialTotalProducts: totalProducts } }

}

export default function Home({ initialStaticProducts, initialTotalProducts }: InferGetStaticPropsType<typeof getStaticProps>) {

  //we store already fetched products data and cached products ID range in global context
  const globalContext = useContext(GlobalContext);

  //we updating total products count for each new products data fetch
  const [totalProducts, updateTotalProducts] = useState(initialTotalProducts);

  const resolveWhatNewProductsFetch = (firstVisableProductIndex: number, lastVisableProductIndex: number): ResolvedFetchIsNeeded => {

    const retObj: ResolvedFetchIsNeeded = {

      startFetchIndex: 0,
      endFetchIndex: 0,
      fetchIsNeeded: false

    };


    const start = globalContext?.cachedproductsIDRange[0] as number;
    const end = globalContext?.cachedproductsIDRange[1] as number;

    // Check if the received range is within the existing range
    if (firstVisableProductIndex >= start && lastVisableProductIndex <= end) return retObj;

    // Calculate the missing numbers
    const missingIndexes = [];

    for (let i = firstVisableProductIndex; i <= lastVisableProductIndex; i++) {
      if (i < start || i > end) {
        missingIndexes.push(i);
      }
    }

    retObj.startFetchIndex = missingIndexes[0];

    retObj.endFetchIndex = missingIndexes.at(-1) as number;

    retObj.fetchIsNeeded = true;

    return retObj

  }

  const newProductsRequired = (firstVisableProductIndex: number, lastVisableProductIndex: number) => {


    const { startFetchIndex, endFetchIndex, fetchIsNeeded } = resolveWhatNewProductsFetch(firstVisableProductIndex, lastVisableProductIndex);

    if (fetchIsNeeded) {

      fetch("/api/products", {
        method: "POST",
        credentials: "include",
        body: JSON.stringify({ fromIndex: startFetchIndex, toIndex: endFetchIndex })
      }).then(res => {

        res.json().then((data: { products: Product[], totalProducts: number }) => {

          console.log(data.products.length, "products fetched");

          globalContext?.updateProductsForDisplay(prevState => {

            if (prevState) {

              return prevState?.concat(data.products)

            } else return initialStaticProducts.concat(data.products);

          });

          globalContext?.updateProductsCachedIDRange(prevState => {

            prevState[1] = data.products.at(-1)?.id as number

            return prevState

          })

          updateTotalProducts(data.totalProducts);

        })

      })

    }

  }

  return (
    <>
      <Head>
        <title>Cool Shop</title>
        <meta name="description" content="cool shop with cool items" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <ProductsMainPageDisplay products={globalContext?.productsForDisplay ? globalContext?.productsForDisplay : initialStaticProducts}
        totalProducts={totalProducts}
        newProductsRequired={newProductsRequired} />

    </>
  )
}
