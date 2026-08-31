import type { AppProps } from "next/app";
import Head from "next/head";
import Layout from "../components/Layout";
import "../styles/globals.css";

export default function MythBaseApp({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <title>MythBase — каталог вымышленной мифологии</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta
          name="description"
          content="Каталог вымышленных существ, героев и духов с поиском и фильтрами по типам и локациям."
        />
        <meta name="theme-color" content="#0f1115" />
        <meta property="og:type" content="website" />
        <meta property="og:title" content="MythBase" />
        <meta
          property="og:description"
          content="Каталог вымышленных существ, героев и духов с поиском и фильтрами."
        />
      </Head>
      <Layout>
        <Component {...pageProps} />
      </Layout>
    </>
  );
}
