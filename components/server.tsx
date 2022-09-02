import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCopy,
  faStar,
  faCloudMoonRain,
  faCloudShowersHeavy,
  faMoon,
} from "@fortawesome/free-solid-svg-icons";
import { faStar as faStarRegular } from "@fortawesome/free-regular-svg-icons";
import styles from "./server.module.scss";
import { useEffect, useContext, useState } from "react";
import { ServerType } from "$utils/db";
import DataContext from "./dataContext";

export const Server = ({
  data,
  isRendered,
  serverId
}: {
  data: ServerType;
  isRendered: Function;
  serverId: string;
}) => {
  const ctx = useContext(DataContext);
  const sessionEls = [];
  const [isFavourite, setFavourite] = useState<boolean>(data.isFavourite);
  for (const [i, session] of data.sessions.entries()) {
    sessionEls.push(
      <div
        className={[
          styles.session,
          ... session.active ? [styles.active]: [],
        ].join(" ")}

        key={`${serverId}_session_${i}`}
      >
        {session.type}: {session.time}
      </div>
    );
  }
  useEffect(() => {
    isRendered();
    isRendered = ()=>{};
  });
  return (
    <tr className={styles.server}>
      <td className={styles.server_copy} onClick={()=>{
        navigator.clipboard.writeText(data.name ?? "")
      }}>
        <FontAwesomeIcon icon={faCopy} />
      </td>
      {/* <i className="far fa-copy" onclick="navigator.clipboard.writeText(`{{name}}`)" /> */}
      <td className={styles.server_favourite}>
        <div className={styles.server_favourite_icon} onClick={()=>{
          if(data.isFavourite){
            ctx.removeFavourite(data.id ?? "")
          } else {
            ctx.addFavourite(data.id ?? "")
          }
          data.isFavourite = !data.isFavourite;
          setFavourite(data.isFavourite);
        }}>
          {isFavourite ? (
            <FontAwesomeIcon icon={faStar} />
          ) : (
            <FontAwesomeIcon icon={faStarRegular} />
          )}
        </div>
      </td>

      <td className="flex-col">
        <div className={styles.server_name}>{data.name}</div>
        <div className="sessions">{sessionEls}</div>
        <div className="requirements">
          <span className="grey-text">REQUIREMENTS:</span>
          <span className="requirements-track-medals">
            Track Medals: {data.requirements?.trackMedals}
          </span>
          <span className="requirements-sa">
            SA: {data.requirements?.safetyRating}
          </span>
        </div>
      </td>
      <td>
        <div className={styles.conditions}>
          <div className={styles.conditions_icon}>
            {data.conditions?.rain ? (
              data.conditions?.night ? (
                <FontAwesomeIcon icon={faCloudMoonRain} />
              ) : (
                <FontAwesomeIcon icon={faCloudShowersHeavy} />
              )
            ) : (
              data.conditions?.night && <FontAwesomeIcon icon={faMoon} />
            )}
          </div>
          <progress
            className={styles.conditions_variability}
            max={80}
            value={data.conditions?.variability}
          />
        </div>
      </td>
      <td className={styles.server_track}>
        <div className={styles.server_track_name}>{data.track?.name}</div>
        <div className={[styles.server_class, data.class && styles[data.class]].join(" ")}>
          {data.class}
        </div>
      </td>
      <td className="drivers">
        <span className="grey-text">Drivers </span>
        {`${data.drivers?.connected}/${data.drivers?.max}`}
      </td>
      <td className={styles.flag}>
        <img
          src={`https://flagcdn.com/${data.country_code}.svg`}
          height="auto"
        />
      </td>
      {/* <img src="/img/tracks/{{track.id}}.jpg" class="track-image"> */}
      {/* <i class="fas fa-globe"></i> */}
    </tr>
  );
};
