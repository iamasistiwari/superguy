"use server"
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../lib/auth";



export async function GET() {
  const session = await getServerSession(authOptions);
  const accessToken = session?.accessToken;
    const checkToken =
      "ya29.a0AZYkNZhMNCHDdUaoi23CTKXjQq-LlQ5fewup8LRu-6D4iVLL4MWO9H8gjUDkoGBTGq8IEkm5vPhDTOPKm1je42xbTCZBXAf_J0qXFixr5V_W3SGdFCKXuXbr8XruCjQSp10ApWzuY2m2BWqt_auFXUusXd8oW571J8GbV0ctaCgYKAS8SARESFQHGX2MiMW-p_QMjVWJTGnUO5RfEiA0175";
//   if(!accessToken){
//     return NextResponse.json("Invalid token")
//   }

  const res = await fetch(
    "https://gmail.googleapis.com/gmail/v1/users/me/messages/19672e3edc8c968a",
    {
      headers: {
        Authorization: `Bearer ${checkToken}`,
      },
    },
  );

  const data = await res.json();
  const base64 = data.payload.parts[0].body.data
    .replace(/-/g, "+")
    .replace(/_/g, "/")
    .replace(/\r?\n|\r/g, "");

  // Step 2: Decode from base64
  const decodedBody = Buffer.from(base64, "base64").toString("utf-8");


  return NextResponse.json(decodedBody);
}
