import styles from "./banner.module.scss";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faRedoAlt } from "@fortawesome/free-solid-svg-icons";
import { Filters } from "./filters";
import DataContext from "./dataContext";
import { useContext, useEffect, useState } from "react";

export const Banner = ({ status }: { status: string }) => {
  const ctx = useContext(DataContext);
  const [bannerHidden, setBannerHidden] = useState(false);

  useEffect(() => {
    if (!bannerHidden) {
      const isHidden = JSON.parse(
        localStorage.getItem("newsHidden") || "false"
      );
      if (isHidden) {
        setBannerHidden(true);
      }
    } else {
      localStorage.setItem("newsHidden", "true");
    }
  }, [bannerHidden]);
  return (
    <div className={styles.banner}>
      <div className={styles.flex_row + " flex-row"}>
        <h1 className="site-title">ACC Community Server Browser Project</h1>
        <div className="flex-row flex-wrap">
          <div className={styles.status_area}>
            Kunos server status:
            <span
              className={`${status === "online" && styles.online} ${
                styles.kunos_status
              }`}
            >
              {status}
            </span>
          </div>
          <div>
            <a
              className="btn link"
              href="https://github.com/reesvarney/acc-server-browser-web/issues"
            >
              Report issue
            </a>
            <button
              aria-label="Refresh Button"
              className={styles.refresh_button}
              onClick={(e) => {
                ctx.refetch(null);
              }}
              style={{
                marginLeft: "5px",
              }}
            >
              <FontAwesomeIcon icon={faRedoAlt} />
            </button>
          </div>
        </div>
      </div>
      {!bannerHidden && (
        <div className={styles.news_container}>
          <p className={styles.site_news}>
            <b>📰 UPDATE</b>: ACC Server Browser has moved, if you&apos;re
            viewing this you are on the new site. The old URL will stop
            redirecting here after 28 November. A lot of the site had to be
            rewritten to run on the new hosting provider, some issues are known
            with applying filters currently though this should go away after
            pressing the refresh button however if you experience anything more
            severe please report it using the button above.
          </p>

          <button
            onClick={(e) => {
              setBannerHidden(true);
            }}
          >
            Close
          </button>
        </div>
      )}
      <Filters></Filters>
    </div>
  );
};
