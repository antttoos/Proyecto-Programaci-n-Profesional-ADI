"use client"
import { SignIn, SignUp } from '@clerk/nextjs'

export default function Login() {
  return(
    <>
      <div className='container'>
        <h1 className='title'>Iniciar Sesión</h1>
        <SignIn afterSignInUrl="/dashboard" afterSignUpUrl="/dashboard"/>
        <div style={{ marginTop: 24 }}>
          <h2 className='title'>¿No tienes cuenta?</h2>
          <SignUp afterSignInUrl="/dashboard" afterSignUpUrl="/dashboard"/>
        </div>
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