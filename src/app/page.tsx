import { currentUser } from "@/modules/Authentication/actions";
import UserButton from "@/modules/Authentication/components/user-button";

export default async function Home() {
  const user = await currentUser();

  return (
    <div>
      <UserButton user={user} />
    </div>
  );
}
