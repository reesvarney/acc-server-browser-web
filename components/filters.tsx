import { FormEvent, useContext, useEffect, useState } from "react";
import styles from "./filters.module.scss";
import DataContext from "./dataContext";
import { filterType } from "$pages/api/servers";
export const Filters = () => {
  const [filtersVisible, setFiltersVisible] = useState(false);
  const [filterData, setFilterData] = useState<filterType>(null);

  const ctx = useContext(DataContext);
  function showFilters() {
    setFiltersVisible(true);
  }

  function hideFilters() {
    setFiltersVisible(false);
  }

  function updateServers(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const searchVal = data.get("search") as string;
    const oldData = JSON.parse(localStorage.getItem("filters") ?? "{}");
    const newData = {
      min_sa: Number(data.get("min_sa") ?? oldData.min_sa ?? 0),
      max_sa: Number(data.get("max_sa") ?? oldData.max_sa ?? 99),
      min_drivers: Number(data.get("min_cd") ?? oldData.min_drivers ?? 0),
      max_drivers: Number(data.get("max_cd") ?? oldData.max_drivers ?? 99),
      min_tm: Number(data.get("min_tm") ?? oldData.min_tm ?? 0),
      max_tm: Number(data.get("max_tm") ?? oldData.max_tm ?? 3),
      showEmpty: data.get("show_empty") == "on" ?? oldData.showEmpty ?? false,
      showFull: data.get("show_full") == "on" ?? oldData.showFull ?? true,
      class: (data.getAll("class") as Array<string>) ?? oldData.class ?? [],
      dlc: (data.getAll("dlc") as Array<string>) ?? oldData.dlc ?? [],
      sessions: (data.getAll("session") as Array<string>) ?? oldData.sessions ?? [],
      favouritesOnly: data.get("favourites_only") == "on" ?? oldData.favouritesOnly ?? false,
      ...(searchVal && searchVal !== "" && { search: searchVal }),
    };
    setFilterData(newData);
  }

  ctx.addFavourite = (id)=>{
    const favourites = JSON.parse(localStorage.getItem("favourites") || "[]") as Array<string>;
    localStorage.setItem("favourites", JSON.stringify([...favourites, id]));
  }

  ctx.removeFavourite = (id)=>{
    const favourites = JSON.parse(localStorage.getItem("favourites") || "[]") as Array<string>;
    localStorage.setItem("favourites", JSON.stringify(favourites.filter(a=>a!==id)));
  }

  useEffect(() => {
    if (filterData) {
      localStorage.setItem("filters", JSON.stringify(filterData));
      ctx.refetch(filterData);
    } else {
      // set defaults or load from localStorage
      const data = JSON.parse(localStorage.getItem("filters") ?? "{}");
      const setData = {
        min_sa: data["min_sa"] ?? 0,
        max_sa: data["max_sa"] ?? 99,
        min_drivers: data["min_cd"] ?? 0,
        max_drivers: data["max_cd"] ?? 99,
        min_tm: data["min_tm"] ?? 0,
        max_tm: data["max_tm"] ?? 3,
        showEmpty: data["showEmpty"] ?? false ? true : false,
        showFull: data["showFull"] ?? true ? true : false,
        class: data["class"] ?? ["mixed", "gt3", "gt4", "gtc", "tcx"],
        dlc: data["dlc"] ?? ["base", "icgt", "gtwc", "bgt", "atp"],
        sessions: data["session"] ?? ["race", "qualifying", "practice"],
        favouritesOnly: data["favouritesOnly"] ?? false ? true : false,
      };
      setFilterData(setData);
    }
  }, [filterData]);

  return (
    <form className={styles.filters} onSubmit={updateServers}>
      <div className={styles.filter_search}>
        <input name="search" type="text" placeholder="Search by Name" />
        {!filtersVisible ? (
          <button onClick={showFilters} type="button">
            Filters
          </button>
        ) : null}
      </div>
      <div className={styles.filters_main} style={
        {
          display: filtersVisible ? "flex" : "none"
        }
      }>
        <div className={styles.filter_group}>
          <span className={styles.filter_group_name}>SA</span>
          <div className={styles.filter}>
            <label htmlFor="min_sa">Min</label>
            <input
              id="min_sa"
              name="min_sa"
              type="number"
              min={0}
              max={99}
              defaultValue={filterData?.min_sa ?? 0}
            />
          </div>
          <div className={styles.filter}>
            <label htmlFor="max_sa">Max</label>
            <input
              name="max_sa"
              id="max_sa"
              type="number"
              min={0}
              max={99}
              defaultValue={filterData?.max_sa ?? 99}
            />
          </div>
        </div>
        <div className={styles.filter_group}>
          <div className={styles.filter_group_name}>Track Medals</div>
          <div className={styles.filter}>
            <label htmlFor="min_tm">Min</label>
            <input
              name="min_tm"
              id="min_tm"
              type="number"
              min={0}
              max={3}
              defaultValue={filterData?.min_tm ?? 0}
            />
          </div>
          <div className={styles.filter}>
            <label htmlFor="max_tm">Max</label>
            <input
              name="max_tm"
              id="max_tm"
              type="number"
              min={0}
              max={3}
              defaultValue={filterData?.max_tm ?? 3}
            />
          </div>
        </div>
        <div className={styles.filter_group}>
          <span className={styles.filter_group_name}>Drivers</span>
          <div className={styles.filter}>
            <label htmlFor="min_cd">Min</label>
            <input
              name="min_cd"
              id="min_cd"
              type="number"
              min={0}
              max={99}
              defaultValue={filterData?.min_drivers ?? 0}
            />
          </div>
          <div className={styles.filter}>
            <label htmlFor="max_cd">Max</label>
            <input
              name="max_cd"
              id="max_cd"
              type="number"
              min={0}
              max={99}
              defaultValue={filterData?.max_drivers ?? 99}
            />
          </div>
        </div>

        <div className={styles.filter_group}>
          <span className={styles.filter_group_name}>DLC</span>
          <div className={styles.filter}>
            <label htmlFor="dlc_base">Base Game</label>
            <input
              name="dlc"
              id="dlc_base"
              type="checkbox"
              value="base"
              defaultChecked={filterData?.dlc?.includes("base") ?? true}
            />
          </div>
          <div className={styles.filter}>
            <label htmlFor="dlc_icgt">ICGT</label>
            <input
              name="dlc"
              id="dlc_icgt"
              type="checkbox"
              value="icgt"
              defaultChecked={filterData?.dlc?.includes("icgt") ?? true}
            />
          </div>
          <div className={styles.filter}>
            <label htmlFor="dlc_gtwc">GTWC</label>
            <input
              name="dlc"
              id="dlc_gtwc"
              type="checkbox"
              value="gtwc"
              defaultChecked={filterData?.dlc?.includes("gtwc") ?? true}
            />
          </div>
          <div className={styles.filter}>
            <label htmlFor="dlc_bgt">BGT</label>
            <input
              name="dlc"
              id="dlc_bgt"
              type="checkbox"
              value="bgt"
              defaultChecked={filterData?.dlc?.includes("bgt") ?? true}
            />
          </div>
          <div className={styles.filter}>
            <label htmlFor="dlc_atp">ATP</label>
            <input
              name="dlc"
              id="dlc_atp"
              type="checkbox"
              value="atp"
              defaultChecked={filterData?.dlc?.includes("atp") ?? true}
            />
          </div>
        </div>
        <div className={styles.filter_group}>
          <span className={styles.filter_group_name}>Class</span>
          <div className={styles.filter}>
            <label htmlFor="class_mixed">Mixed</label>
            <input
              name="class"
              id="class_mixed"
              type="checkbox"
              value="mixed"
              defaultChecked={filterData?.class?.includes("mixed") ?? true}
            />
          </div>
          <div className={styles.filter}>
            <label htmlFor="class_gt3">GT3</label>
            <input
              name="class"
              id="class_gt3"
              type="checkbox"
              value="gt3"
              defaultChecked={filterData?.class?.includes("gt3") ?? true}
            />
          </div>
          <div className={styles.filter}>
            <label htmlFor="class_gt4">GT4</label>
            <input
              name="class"
              id="class_gt4"
              type="checkbox"
              value="gt4"
              defaultChecked={filterData?.class?.includes("gt4") ?? true}
            />
          </div>
          <div className={styles.filter}>
            <label htmlFor="class_gtc">GTC</label>
            <input
              name="class"
              id="class_gtc"
              type="checkbox"
              value="gtc"
              defaultChecked={filterData?.class?.includes("gtc") ?? true}
            />
          </div>
          <div className={styles.filter}>
            <label htmlFor="class_tcx">TCX</label>

            <input
              name="class"
              id="class_tcx"
              type="checkbox"
              value="tcx"
              defaultChecked={filterData?.class?.includes("tcx") ?? true}
            />
          </div>
        </div>

        <div className={styles.filter_group}>
          <span className={styles.filter_group_name}>Current Session</span>
          <div className={styles.filter}>
            <label htmlFor="session_practice">Practice</label>

            <input
              name="session"
              id="session_practice"
              type="checkbox"
              value="practice"
              defaultChecked={
                filterData?.sessions?.includes("practice") ?? true
              }
            />
          </div>
          <div className={styles.filter}>
            <label htmlFor="session_qualifying">Qualifying</label>
            <input
              name="session"
              id="session_qualifying"
              type="checkbox"
              value="qualifying"
              defaultChecked={
                filterData?.sessions?.includes("qualifying") ?? true
              }
            />
          </div>
          <div className={styles.filter}>
            <label htmlFor="session_race">Race</label>
            <input
              name="session"
              id="session_race"
              type="checkbox"
              value="race"
              defaultChecked={filterData?.sessions?.includes("race") ?? true}
            />
          </div>
        </div>

        <div className={styles.filter_group}>
          <span className={styles.filter_group_name}>Misc</span>
          <div className={styles.filter}>
            <label htmlFor="show_empty">Show Empty</label>
            <input
              name="show_empty"
              id="show_empty"
              type="checkbox"
              defaultChecked={filterData?.showEmpty ?? false}
            />
          </div>
          <div className={styles.filter}>
            <label htmlFor="show_full">Show Full</label>
            <input
              name="show_full"
              id="show_full"
              type="checkbox"
              defaultChecked={filterData?.showFull ?? true}
            />
          </div>
          <div className={styles.filter}>
            <label htmlFor="filter_favourites_only">Favourites Only</label>
            <input
              name="favourites_only"
              id="filter_favourites_only"
              type="checkbox"
              defaultChecked={filterData?.favouritesOnly ?? false}
            />
          </div>
          {/* Hidden */}
          <input
            name="favourites"
            id="filter_favourites"
            type="hidden"
            defaultValue={`[${filterData?.favourites?.map(a=>`"${a}"`)}]` ?? "[]"}
          />
        </div>

        <div className={styles.button_area}>
          <button onClick={hideFilters} type="button">
            Hide
          </button>
          <button type="submit" id="update_button">
            Update
          </button>
        </div>
      </div>
    </form>
  );
};
