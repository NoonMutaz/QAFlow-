import React from 'react'
type Status = "notFixed" | "in-progress" | "fixed";
interface FilterByStatusPrpos {
 select: Status | "";
  setSelect: React.Dispatch<React.SetStateAction<Status | "">>;
}
export default function FilterByStatus({select,setSelect}:FilterByStatusPrpos) {
  return (
    <div>
       <form>
                  <select
                    value={select}
                    onChange={(e) => setSelect(e.target.value as Status | "")}
                    className={`px-4 py-2 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition `}
                  >
                    <option value="" disabled hidden>
                      {" "}
                      Filter by status{" "}
                    </option>
                    <option value="">All</option>
                    <option value="notFixed"> not fixed</option>
                    <option value="in-progress">In-progress</option>
                    <option value="fixed">fixed</option>
                  </select>
                </form>
    </div>
  )
}
