import { schema, t, type SchemaType } from "@colyseus/schema";

export const Player = schema({
  x: t.number().default(0),
  y: t.number().default(5),
  z: t.number().default(0),
});
export type Player = SchemaType<typeof Player>;

export const MyRoomState = schema({
  players: t.map(Player),
});
export type MyRoomState = SchemaType<typeof MyRoomState>;
