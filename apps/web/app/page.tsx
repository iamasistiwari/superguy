import { getServerSession } from "next-auth";
import React from "react";
import { authOptions } from "../lib/auth";

export default async function page() {
  const session = await getServerSession(authOptions);
  return (
    <div className="text-2xl font-extrabold">
      {JSON.stringify(session?.accessToken)}
    </div>
  );
}
