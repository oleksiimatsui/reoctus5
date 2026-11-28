import { defineRoom, defineServer } from "colyseus";
import { MyRoom } from "./src/rooms/MyRoom";

const server = defineServer({
  rooms: {
    world: defineRoom(MyRoom),
  },
});

server.listen(process.env.PORT || 2567);

console.log("Colyseus running on port 2567");
