import { currentUser } from "@/modules/Authentication/actions";
import { acceptWorkspaceInvite } from "@/modules/invites/actions";
import { redirect } from "next/navigation";

export const dynamic = 'force-dynamic';

const Invite = async ({ params }: { params: Promise<{ token: string }> }) => {
  const { token } = await params;

  const user = await currentUser();

  if (!user) {
    redirect("/sign-in");
  }

  const invite = await acceptWorkspaceInvite(token);

  if (invite.success) {
    redirect("/");
  }

  return redirect("/sign-in");
};

export default Invite;