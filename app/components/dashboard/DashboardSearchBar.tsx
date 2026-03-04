import React from 'react'

interface DashboardSearchBarPrpos {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
}
export default function DashboardSearchBar({searchTerm,setSearchTerm}:DashboardSearchBarPrpos) {
  return (
  
      
<div  className="w-full   top-0  gap-4" >
       <header className="flex w-full md:flex-row items-center justify-between px-4 md:px-8 py-4 bg-gradient-to-r from-blue-50 to-indigo-50 shadow-md    ">
 
        
       
        <input
         value={searchTerm}
    onChange={(e) => setSearchTerm(e.target.value)}
          type="text"
          placeholder="Search user, bugs..."
          aria-label="Search research"
          className="w-full md:w-full px-4 bg-white py-2 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
        />
        
        
      </header>
      <div className='flex items-center justify-center  mt-3'>
        {/* <div className='bg-amber-300   items-center  w-5xl max-h-36 overflow-auto pt-7'>
           
           <div> */}
        
      </div>
    </div>
  )
}
