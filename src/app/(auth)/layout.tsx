import { PropsWithChildren } from "react"

const AuthLayout = ({children}:PropsWithChildren) => {
  return (
    <div>
      {children}
    </div>
  )
}

export default AuthLayout