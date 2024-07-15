// TODO: Add messages page
import { AuthUser } from "wasp/auth"
import { useRedirectHomeUnlessUserIsAdmin } from "../admin/useRedirectHomeUnlessUserIsAdmin"

function AdminMessages({user} : {user: AuthUser}) {
  useRedirectHomeUnlessUserIsAdmin({user})

  return (
    <div>Hello world!</div>
  )
}

export default AdminMessages
