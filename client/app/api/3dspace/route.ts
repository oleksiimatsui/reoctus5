import { Collection, MongoClient } from "mongodb";

type PresenceRecord = {
  _id: string;
  position: { x: number; y: number; z: number };
  yaw: number;
  updatedAt: Date;
};

type PresencePayload = {
  id: string;
  position: { x: number; y: number; z: number };
  yaw: number;
};

type MongoCache = typeof globalThis & {
  presenceCollectionPromise?: Promise<Collection<PresenceRecord>>;
};

const globalForMongo = globalThis as MongoCache;
const uuidPattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isPresencePayload(value: unknown): value is PresencePayload {
  if (!isRecord(value) || !isRecord(value.position)) return false;
  const { x, y, z } = value.position;

  return (
    typeof value.id === "string" &&
    uuidPattern.test(value.id) &&
    [x, y, z].every(
      (coordinate) =>
        typeof coordinate === "number" &&
        Number.isFinite(coordinate) &&
        Math.abs(coordinate) <= 10000,
    ) &&
    typeof value.yaw === "number" &&
    Number.isFinite(value.yaw)
  );
}

function getPresenceCollection() {
  if (globalForMongo.presenceCollectionPromise) {
    return globalForMongo.presenceCollectionPromise;
  }

  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error("MONGODB_URI is not configured");
  }

  const promise = new MongoClient(uri)
    .connect()
    .then(async (client) => {
      const collection =
        client.db().collection<PresenceRecord>("3dspace_presence");
      await collection.createIndex(
        { updatedAt: 1 },
        { expireAfterSeconds: 30 },
      );
      return collection;
    });

  globalForMongo.presenceCollectionPromise = promise;
  return promise;
}

export async function GET() {
  const collection = await getPresenceCollection();
  const activeAfter = new Date(Date.now() - 10_000);
  const records = await collection
    .find({ updatedAt: { $gt: activeAfter } })
    .toArray();

  return Response.json(
    records.map(({ _id, position, yaw }) => ({
      id: _id,
      position,
      yaw,
    })),
    { headers: { "Cache-Control": "no-store" } },
  );
}

export async function POST(request: Request) {
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (!isPresencePayload(payload)) {
    return Response.json({ error: "Invalid presence data" }, { status: 400 });
  }

  const collection = await getPresenceCollection();
  await collection.updateOne(
    { _id: payload.id },
    {
      $set: {
        position: payload.position,
        yaw: payload.yaw,
        updatedAt: new Date(),
      },
    },
    { upsert: true },
  );

  return new Response(null, { status: 204 });
}
