import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({ message: "Auth handled via Supabase Auth" });
}

export async function POST() {
  return NextResponse.json({ message: "Auth handled via Supabase Auth" });
}
