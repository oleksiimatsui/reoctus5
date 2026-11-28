//"use client";

import NotesApp from "@/client/app/notes/components/NotesApp";
import AlbumListener from "./albums_listener/components/AlbumListener";
import GeneralLinks from "./general_links/components/GeneralLinks";

export default function Home() {
  return (
    <div className="h-screen w-screen overflow-auto bg text-neutral-200 flex flex-col items-center px-2 pt-4 gap-2">
      <GeneralLinks />

      <AlbumListener />

      <div className="mt-1 mb-2">
        <a href="/3dspace" className="underline">
          Перейти до 3D простору
        </a>
      </div>
    </div>
  );
}
