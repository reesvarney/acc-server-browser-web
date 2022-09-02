import type { NextPage } from "next";
import Head from "next/head";
import { Banner } from "$components/banner";
import { ServerList } from "$components/serverList";
import Image from "next/image";
import DataContext from "$components/dataContext";
import { useState } from "react";

const Home: NextPage = () => {
  const [status, setStatus] = useState<string>("online");
  function setStatusFromChild(a: string){
    setStatus(a)
  }
  const googleVerify = process.env.NEXT_PUBLIC_GOOGLE_VERIFY;
  return (
    <div>
      <Head>
        <title>ACC Server Browser Web</title>
        <meta name="description"
    content="Improved web-based server browser for Assetto Corsa Competizione with more ways to filter servers and check races before loading the game." />
        {googleVerify &&
          <meta name="google-site-verification" content={googleVerify} />
        }
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main>
        <div className="background">
          <Image
            objectFit="cover"
            src="/img/bg.jpg"
            quality={100}
            aria-hidden="true"
            layout="fill"
            alt=""
          />
        </div>

        <DataContext.Provider value={{refetch: ()=>{}, status: "online", removeFavourite: ()=>{}, addFavourite: ()=>{}}}>
          <Banner status={status}></Banner>
          <ServerList setStatus={setStatusFromChild}/>
        </DataContext.Provider>
      </main>
    </div>
  );
};
export default Home;
