"use server";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../lib/auth";

export async function GET() {
  const session = await getServerSession(authOptions);

  const res = await fetch(
    "https://gmail.googleapis.com/gmail/v1/users/me/messages/19672e3edc8c968a",
    {
      headers: {
        Authorization: `Bearer ${session?.accessToken}`,
      },
    },
  );

  const data = await res.json();
  const base64 = data.payload.parts[0].body.data
    .replace(/-/g, "+")
    .replace(/_/g, "/")
    .replace(/\r?\n|\r/g, "");

  const decodedBody = Buffer.from(base64, "base64").toString("utf-8");

  return NextResponse.json(decodedBody);
}
