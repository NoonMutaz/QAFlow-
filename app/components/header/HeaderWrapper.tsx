"use client"; // only this small component is client-side

import { useState } from "react";
import Header from "./Header";
 import { useSearch } from "@/app/context/SearchContext";
 


export default function HeaderWrapper() {
  
// const [searchTerm, setSearchTerm] = useState<string>("");
const { setSearchTerm } = useSearch();
const { searchTerm } = useSearch();

  return (
    <>
      <Header searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
      
      
    </>
  )
}
