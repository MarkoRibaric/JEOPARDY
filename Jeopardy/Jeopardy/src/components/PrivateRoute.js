import { Navigate } from "react-router-dom"

export default function PrivateRoute(props) {
    return props.token ? (
        <>{props.children}</>
      ) : (
        <Navigate
          replace={true}
          to="/"
        />
      )
}   