//"use client";

import NotesApp from "@/app/notes/components/NotesApp";
import AlbumListener from "./albums_listener/components/AlbumListener";

export default function Home() {
  return (
    <div className="h-screen w-screen overflow-auto bg-gray-800 text-slate-300 flex justify-center">
      <AlbumListener />

      {/* <div className="w-100 max-w-full h-full absolute top-0 right-0 bottom-0 flex items-center justify-center">
        <NotesApp />
      </div> */}
    </div>
  );
}
