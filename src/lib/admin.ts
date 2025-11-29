import { currentUser } from "@/modules/Authentication/actions";
import { redirect } from "next/navigation";

export async function requireAdmin() {
  const user = await currentUser();
  
  if (!user) {
    redirect("/sign-in");
  }
  
  if (user.role !== "ADMIN") {
    redirect("/");
  }
  
  return user;
}
