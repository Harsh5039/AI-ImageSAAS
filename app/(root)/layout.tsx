"use client";
import MobileNav from '@/components/shared/MobileNav'
import Sidebar from '@/components/shared/Sidebar'
import { Toaster } from '@/components/ui/toaster'
import { useRouter } from 'next/navigation';
import React, { useEffect } from 'react'

const Layout = ({children}: {children: React.ReactNode}) => {

  const router = useRouter()
  useEffect(() => {
router.push('/transformations/add/restore')
  }, [])
  return (
    <main className='root'>
      <Sidebar/>
      <MobileNav/>
        <div className='root-container'>
            <div className='wrapper'>
            {children}
            </div>
            <Toaster/>
        </div>
    </main>
  )
}

export default Layout
