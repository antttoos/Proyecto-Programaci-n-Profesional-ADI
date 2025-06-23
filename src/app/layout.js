"use client"
import {Inter } from "next/font/google"
import "./globals.css"
import {
  ClerkProvider
} from '@clerk/nextjs'

export default function RootLayout({children}){
  return(
    <>
      <ClerkProvider>
        <html>
          <body>
            {children}
          </body>
        </html>
      </ClerkProvider>
      <style jsx>{`
        :global(body) {
          margin: 0;
          font-family: system-ui, sans-serif;
          background: #F3F4F6;
          color: #1F2937;
          display: flex;
          flex-direction: column;
          min-height: 100vh;
        }
      `}</style>
    </>
  )
}