//"use client";

import NotesApp from "@/app/notes/components/NotesApp";
import AlbumListener from "./albums_listener/components/AlbumListener";
import GeneralLinks from "./general_links/components/GeneralLinks";

export default function Home() {
  return (
    <div className="h-screen w-screen overflow-auto bg text-neutral-200 flex flex-col items-center px-2 pt-4 gap-2">
      <GeneralLinks />
      <AlbumListener />

      {/* <div className="w-100 max-w-full h-full absolute top-0 right-0 bottom-0 flex items-center justify-center">
        <NotesApp />
      </div> */}
    </div>
  );
}
