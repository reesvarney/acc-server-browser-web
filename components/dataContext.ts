import { createContext } from "react";
import type {filterType} from "$api/servers"
const DataContext = createContext({
  refetch: (data: filterType)=>{},
  addFavourite: (id: string)=>{},
  removeFavourite: (id: string)=>{},
  status: "online"
});
export default DataContext;