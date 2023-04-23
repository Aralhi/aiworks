import { useRouter } from "next/router";

function user() {
  const router = useRouter()
  const { id } = router.query
  console.log('....id', id)
  return <div>user {id} to be online</div>
}

export default user;
