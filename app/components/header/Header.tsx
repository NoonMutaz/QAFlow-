'use client'

import React from 'react'
import {useState} from 'react'
import axios from 'axios';
import Image from 'next/image'
import Link from "next/link";

interface HeaderProps {
  searchTerm: string
  setSearchTerm: (value: string) => void
}

export default function Header({searchTerm ,setSearchTerm}:HeaderProps) {
    // const [searchTerm, setSearchTerm] = useState<string>("")

  return (
    <div  className=" sticky top-0 z-50 gap-4" >
       <header className="flex flex-col md:flex-row items-center justify-between px-4 md:px-8 py-4 bg-white shadow-md sticky top-0 z-50 gap-4">

<Link href="/">
  <div className="text-xl font-bold text-blue-600 cursor-pointer">
    QAFlow
  </div>
</Link>
<nav className="hidden md:flex space-x-6">
  <Link href="/" className="text-gray-700 hover:text-blue-600">Home</Link>
  <Link href="/my-projects" className="text-gray-700 hover:text-blue-600">Projects</Link>
  <Link href="/aboutUs" className="text-gray-700 hover:text-blue-600">About Us</Link>
  <Link href="/contact" className="text-gray-700 hover:text-blue-600">Contact</Link>
</nav>
        
        {/* Search: Full width on mobile, 1/3 on desktop */}
        <input
         value={searchTerm}
    onChange={(e) => setSearchTerm(e.target.value)}
          type="text"
          placeholder="Search user, project..."
          aria-label="Search research"
          className="w-full md:w-1/3 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
        />
        
        <div className="flex items-center space-x-4 w-full md:w-auto justify-between md:justify-end">
          <button className="px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            Sign In
          </button>
          <img
            src="https://tse4.mm.bing.net/th/id/OIP._CaPhpRAjmgPpYL4Y9vXkwHaE8?rs=1&pid=ImgDetMain&o=7&rm=3"
            alt="User Profile"
            width={32} height={32}
            className="w-8 h-8 rounded-full border border-gray-200"
          />
        </div>
      </header>
      <div className='flex items-center justify-center  mt-3'>
        {/* <div className='bg-amber-300   items-center  w-5xl max-h-36 overflow-auto pt-7'>
           
           <div> */}
        
      </div>
      
    </div>
  )
}
