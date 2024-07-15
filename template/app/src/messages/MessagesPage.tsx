// TODO: Add messages page
import { AuthUser } from "wasp/auth"
import { useIsUserAdmin } from "../admin/useIsUserAdmin"

function AdminMessages({user} : {user: AuthUser}) {
  useIsUserAdmin({user})

  return (
    <div>Hello world!</div>
  )
}

export default AdminMessages
