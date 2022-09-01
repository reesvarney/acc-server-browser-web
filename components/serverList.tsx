import { filterType } from "$api/servers";
import { ServerType } from "$utils/db";
import {
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import DataContext from "./dataContext";
import { Server } from "./server";
import styles from "./serverList.module.scss";
let currentIndex = 0;
let lastFilters: filterType | {} = null;

export const ServerList = ({setStatus} : {setStatus: Function}) => {
  const ctx = useContext(DataContext);
  const containerRef = useRef<HTMLTableElement>(null);
  const paddingRef = useRef<HTMLTableRowElement>(null);

  const [servers, setServers] = useState<Array<ServerType> | null>(null);
  const [loadedData, setLoadedData] = useState<Array<any> | null>([]);

  ctx.refetch = (data: filterType) => {
    getServers(data);
  };

  useEffect(() => {
    let scrollTimeout: number | null;
    let fastScrollTimeout: number | null | undefined;
    const container = containerRef.current;
    const padding = paddingRef.current;
    container?.addEventListener("scroll", checkScroll);

    async function needNewContent() {
      if (!container || !padding) {
        return;
      }
      while (
        container.scrollHeight - padding.clientHeight - container.scrollTop < container.clientHeight + container.clientHeight * 2 &&
        servers !== null && servers.length > currentIndex
      ) {
        await addServer();
      }
      padding.style.height = "0px";
    }

    async function addServer() {
      const serverIndex = currentIndex;
      currentIndex += 1;
      if (
        servers &&
        container &&
        padding &&
        servers.length - serverIndex > 0
      ) {
        const serverData = servers[serverIndex];
        await new Promise(async (resolve) => {
          setLoadedData((oldData) => [
            ...oldData ? oldData : [],
            <Server
              data={serverData}
              key={`server_${serverIndex}`}
              serverId={`server_${serverIndex}`}
              isRendered={resolve}
            ></Server>,
          ]);
        });
        padding.style.height = `${
          (container.firstChild?.firstChild as HTMLElement)
            .clientHeight *
            (servers.length - serverIndex) -
          container.clientHeight * 2
        }px`;
      } else {
        setTimeout(addServer, 5000);
      }
    }

    function checkScroll() {
      if (!container || !padding) {
        return;
      }

      if (
        servers &&
        servers.length - currentIndex > 0 &&
        scrollTimeout == null
      ) {
        if (
          container.scrollHeight -
            padding.clientHeight -
            container.scrollTop <
          500
        ) {
          if (fastScrollTimeout != null) {
            window.clearTimeout(fastScrollTimeout);
          }
          let lastPos =
            container.scrollHeight -
            padding.clientHeight -
            container.scrollTop;

          fastScrollTimeout = window.setTimeout(() => {
            if (!servers || !container || !padding) {
              return;
            }

            let newPos =
              container.scrollHeight -
              padding.clientHeight -
              container.scrollTop;
            if (lastPos - newPos < 500 && lastPos - newPos > -500) {
              needNewContent();
            }
            fastScrollTimeout = null;
          }, 500);
        } else {
          scrollTimeout = window.setTimeout(() => {
            if (!servers || !container) {
              return;
            }
            needNewContent();
            scrollTimeout = null;
          }, 200);
        }
      }
    }

    if(servers){
      needNewContent();
    }

    return ()=>{
      container?.removeEventListener("scroll", checkScroll);
    }
  }, [servers]);

  async function getServers(filters: filterType | {} = null) {
    if(!filters){
      if(lastFilters){
        filters = lastFilters
      }
    } else {
      lastFilters = filters;
    }
    currentIndex = 0;
    setLoadedData(null);
    filters = {
      ...filters,
      ...{favourites: JSON.parse(localStorage.getItem("favourites") || "[]") as Array<string>}
    };
    const urlData = new URLSearchParams(filters ?? {}).toString();
    const data = (await (
      await fetch("/api/servers?" + urlData)
    ).json()) as {servers: Array<ServerType>, status: string};
    if(data.status){
      setStatus(data.status);
    }
    if(!data.servers){
      return
    }
    if(data.servers.length === 0){
      setLoadedData([]);
    }
    setServers(data.servers);
  }

  return (
    <div className={styles.table_container}>
      <table className={styles.servers} ref={containerRef}>
        <tbody>
          {loadedData}
          <tr ref={paddingRef}></tr>
        </tbody>
      </table>
      <div id="spinner" style={{
        display: (loadedData !== null ? "none" : "flex")
      }}>
        <div className="lds-ring">
          <div />
          <div />
          <div />
          <div />
        </div>
        <span>Getting kunos servers</span>
      </div>
    </div>
  );
};
