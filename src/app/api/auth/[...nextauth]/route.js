// src/app/api/auth/[...nextauth]/route.js
import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"

// Aquí tu “base de datos” de ejemplo
const users = [
  { id: 1, name: "Usuario Test", email: "test@ejemplo.com", password: "123456" }
]

const authOptions = {
  providers: [
    CredentialsProvider({
      name: "Credenciales",
      credentials: {
        email: { label: "Correo", type: "email" },
        password: { label: "Contraseña", type: "password" }
      },
      async authorize(credentials) {
        const user = users.find(u => u.email === credentials.email)
        if (user && user.password === credentials.password) {
          return { id: user.id, name: user.name, email: user.email }
        }
        return null
      }
    })
  ],
  session: { strategy: "jwt" },
  pages: { signIn: "/login" }
}

const handler = NextAuth(authOptions)

// Exportamos para GET y POST (Route Handlers)
export { handler as GET, handler as POST }
