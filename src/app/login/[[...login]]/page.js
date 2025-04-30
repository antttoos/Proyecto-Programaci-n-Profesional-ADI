"use client"
import { SignIn } from '@clerk/nextjs'

export default function Login() {
  return(
    <>
      <div className='container'>
        <h1 className='title'>Iniciar Sesión</h1>
        <SignIn/>
      </div>
      <style jsx>
        {`    
          .container {
              flex: 1;
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              padding: 32px 0;
              gap: 8px;
            }
          .title {
            font-weight: bold;
            font-size: 1.5rem;
          }
        `}
      </style>
    </>
  )
}