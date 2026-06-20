import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

export async function GET() {
  const client = await clientPromise;
  const notes = await client
    .db()
    .collection("Reoctus5")
    .find()
    .sort({ createdAt: -1 })
    .toArray();

  const formattedNotes = notes.map((note) => ({
    id: note._id.toString(),
    title: note.title,
    content: note.content,
    createdAt: note.createdAt?.toISOString?.() ?? new Date().toISOString(),
  }));

  return NextResponse.json(formattedNotes);
}

export async function POST(request: Request) {
  const body = await request.json();
  const title = String(body.title ?? "").trim();
  const content = String(body.content ?? "").trim();

  if (!title && !content) {
    return NextResponse.json(
      { error: "Please provide a title or content." },
      { status: 400 },
    );
  }

  const client = await clientPromise;
  const result = await client.db().collection("Reoctus5").insertOne({
    title,
    content,
    createdAt: new Date(),
  });

  return NextResponse.json(
    {
      id: result.insertedId.toString(),
      title,
      content,
      createdAt: new Date().toISOString(),
    },
    { status: 201 },
  );
}
