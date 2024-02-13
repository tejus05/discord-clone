import { PropsWithChildren } from "react"

const AuthLayout = ({children}:PropsWithChildren) => {
  return (
    <div className="h-full flex justify-center items-center">
      {children}
    </div>
  )
}

export default AuthLayout