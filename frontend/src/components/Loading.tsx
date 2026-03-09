'use client'
import React from 'react'

import { SpinnerInfinity } from 'spinners-react'

export default function Loading() {
  return (
    <div className='flex flex-col justify-center items-center w-full'>
        <SpinnerInfinity color=''/>
    </div>
  )
}
