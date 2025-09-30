import React from "react";
import Image from "next/image";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

const AuthLayout = async ({
  children,
}: Readonly<{ children: React.ReactNode }>) => {
  
    const session = await auth.api.getSession({
    headers: await headers(),
  });

  if(session) return redirect("/");

  return (
    <div className="h-screen flex overflow-hidden relative">
      <div className="hidden lg:flex lg:w-1/2 bg-auth-background items-center justify-center p-12 relative">
        <div className="max-w-lg text-center">
          <Image
            src="/auth/auth.png"
            alt="Authentication illustration"
            width={300}
            height={300}
            className="w-full h-auto object-contain"
            priority
          />
          <h2 className="mt-8 text-2xl font-semibold text-foreground">
            Turn your ideas into reality.
          </h2>
          <p className="mt-2 text-muted-foreground">
            Start for free and get attractive offers from the community
          </p>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-8 bg-background overflow-y-auto">
        <div className="w-full max-w-md">{children}</div>
      </div>
    </div>
  );
};

export default AuthLayout;
