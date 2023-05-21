import { Analytics } from "@vercel/analytics/react";
import type { AppProps } from "next/app";
import { SWRConfig } from "swr";
import "../styles/globals.css";
import Header from "../components/Header";
import fetchJson from "@/lib/fetchJson";
import MainLayout from '../layouts/main'
import '../public/antd.min.css';

function MyApp({ Component, pageProps }: AppProps) {
  return (
    MainLayout( <SWRConfig
      value={{
        fetcher: fetchJson,
        onError: (err) => {
          console.error(err);
        },
      }}
    >
      <Header />
      <Component {...pageProps} />
      <Analytics />
    </SWRConfig>)
  );
}

export default MyApp;
