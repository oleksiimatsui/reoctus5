"use client";

import Pause from "@/app/icons/Pause";
import PlayIcon from "@/app/icons/Play";
import Spotify from "@/app/icons/Spotify";
import YoutubeMusic from "@/app/icons/YoutubeMusic";
import React from "react";
import { RefObject, useEffect, useRef, useState } from "react";
import YouTube, { YouTubeEvent, YouTubePlayer } from "react-youtube";

enum LinkType {
  youtubeMusic,
  spotify,
}

interface ListenLink {
  url: string;
  icon: LinkType;
}

class YouTubeLink implements ListenLink {
  url: string;
  icon: LinkType;
  constructor(url: string) {
    this.url = url;
    this.icon = LinkType.youtubeMusic;
  }
}
class SpotifyLink implements ListenLink {
  url: string;
  icon: LinkType;
  constructor(url: string) {
    this.url = url;
    this.icon = LinkType.spotify;
  }
}

type Song = {
  id: string;
  title: string;
  url: string;
};
type Album = {
  id: string;
  title: string;
  image: string;
  songs: Array<Song>;
  listenLinks?: Array<ListenLink>;
};

const AlbumListener = () => {
  const delay = 100;

  const [albums, setAlbums] = useState<Album[]>([]);

  useEffect(() => {
    const fetchAlbums = async () => {
      const data: Album[] = [
        {
          id: "1",
          title: "Дорога в Тремпотерте",
          image: "album1.jpg",
          songs: [
            { id: "1", title: "Припутеніада", url: "1_mbq-W9RcU" },
            { id: "2", title: "Повертайся", url: "cJtSHQO8crE" },
            { id: "3", title: "Я не знаю де", url: "Etug3F9tsPU" },
            { id: "4", title: "Сухарі", url: "sNWlilaaCo4" },
            { id: "5", title: "Дерево", url: "RGPGjMstdp4" },
          ],
          listenLinks: [
            new YouTubeLink(
              "https://music.youtube.com/playlist?list=OLAK5uy_mVX8EiwW8lD9HldIIgXxay-JuZm6aq4To",
            ),
            new SpotifyLink(
              "https://open.spotify.com/album/3g6xKaIWp4AN7ji63mxCcx?si=UGB_nyu9Rf6tm5Rq-zamjQ&utm_medium=share&utm_source=linktree",
            ),
          ],
        },
      ];
      setAlbums(data);
    };

    fetchAlbums();
  }, []);

  const playerRef: React.RefObject<YouTubePlayer> = useRef(null);
  const onReady = (event: YouTubeEvent) => {
    playerRef.current = event.target;
  };

  const [songIndex, setSongIndex] = useState<number | null>(null);
  const [albumIndex, setAlbumIndex] = useState<number | null>(null);

  const currentSong =
    songIndex !== null && albumIndex !== null
      ? albums[albumIndex].songs[songIndex]
      : null;

  const [isPlaying, setIsPlaying] = useState<boolean>(false);

  const [currentSongDuration, setCurrentSongDuration] = useState<number>(0);
  const [currentTimestamp, setCurrentTimestamp] = useState<number>(0);

  const currentPercentage =
    currentSongDuration > 0
      ? (currentTimestamp * 100) / currentSongDuration
      : 0;

  const resume = () => {
    playerRef.current?.playVideo();
    setIsPlaying(true);
  };

  const interval: RefObject<NodeJS.Timeout | null> = useRef(null);
  const timeOfLastResume = useRef(0);
  const playedTimeBeforeResume = useRef(0);

  const play = (album: number, song: number, currentTime: number) => {
    pause(currentTime);
    setSongIndex(song);
    setAlbumIndex(album);

    setCurrentTimestamp(0);
  };
  const onPlay = (event: YouTubeEvent<number>) => {
    setIsPlaying(true);
    if (interval.current) {
      clearInterval(interval.current);
      interval.current = null;
    }
    timeOfLastResume.current = Date.now();
    playedTimeBeforeResume.current = currentTimestamp;
    setCurrentSongDuration(event.target.getDuration() * 1000);
    interval.current = setInterval(() => {
      const now = Date.now();
      const timePassed = now - timeOfLastResume.current;
      setCurrentTimestamp(playedTimeBeforeResume.current + timePassed);
    }, delay);
  };

  const pause = (currentTime: number) => {
    if (interval.current) {
      clearInterval(interval.current);
      interval.current = null;
    }

    const elapsed =
      playedTimeBeforeResume.current + (currentTime - timeOfLastResume.current);
    setCurrentTimestamp(elapsed);

    playerRef.current?.pauseVideo();
    setIsPlaying(false);
  };

  const startNext = () => {
    if (albumIndex == null || songIndex == null) return;
    if (songIndex != albums[albumIndex].songs.length - 2) {
      play(albumIndex, songIndex + 1, Date.now());
    } else {
      setAlbumIndex(null);
      setSongIndex(null);
    }
  };

  const sliderClicked = (
    e: React.MouseEvent<HTMLDivElement, MouseEvent>,
    currentTime: number,
  ) => {
    const wasPlaying: boolean = isPlaying;
    if (wasPlaying) {
      pause(currentTime);
    }
    const ref = e.currentTarget as HTMLDivElement;
    const rect = ref.getBoundingClientRect();
    const relation = (e.clientX - rect.left) / ref.scrollWidth;
    const timestamp = currentSongDuration * relation;
    setCurrentTimestamp(timestamp);
    playerRef.current.seekTo(timestamp / 1000, true);
    if (wasPlaying) resume();
  };

  return (
    <div className="w-100 min-w-0 p-4">
      {currentSong != null && albumIndex != null && (
        <div className="flex flex-col bg-gray-950 p-3 rounded-lg mb-2">
          <div className="flex items-center gap-2">
            <div className="h-10 pl-10 relative">
              <div
                className={`w-full h-full absolute top-0 left-0 bg-contain rounded-full 
              animate-[spin_3000ms_linear_infinite]
              `}
                style={{
                  backgroundImage: `url(/${albums[albumIndex]?.image})`,
                  animationPlayState: isPlaying ? "running" : "paused",
                }}
              ></div>
            </div>
            <div className="flex flex-col ">
              <div>{currentSong.title}</div>
              <div className="text-sm text-gray-400">
                {albums[albumIndex]?.title}
              </div>
            </div>
            <div className="ml-auto mr-4">
              {isPlaying ? (
                <button onClick={() => pause(Date.now())}>
                  <Pause></Pause>
                </button>
              ) : (
                <button onClick={resume}>
                  <PlayIcon></PlayIcon>
                </button>
              )}
            </div>
          </div>

          <div
            className=" mx-1 py-4 -mb-2 cursor-pointer"
            onClick={(event) => sliderClicked(event, Date.now())}
          >
            <div className="bg-gray-900 w-full">
              <div
                className={`bg-white h-1`}
                style={{ width: `${currentPercentage}%` }}
              ></div>
            </div>
          </div>
        </div>
      )}

      <YouTube
        className="hidden"
        videoId={currentSong?.url}
        onReady={(event) => onReady(event)}
        onPlay={(event) => onPlay(event)}
        onEnd={(event) => startNext()}
        opts={{
          playerVars: {
            controls: 0, // hide YouTube controls
            autoplay: 1,
          },
        }}
      />

      {albums.map((album, albumIndex) => (
        <div className="flex " key={album.id}>
          <div className="flex grow shrink bg-gray-950 flex-col items-center  rounded-s-lg">
            <div className="relative grow shrink" style={{ padding: "50%" }}>
              <div className={`absolute flex w-full h-full top-0 left-0`}>
                <div
                  className={`m-4 grow bg-contain`}
                  style={{
                    backgroundImage: `url(/${albums[albumIndex]?.image})`,
                  }}
                ></div>
              </div>
            </div>
            <h4 className="mb-2 text-center">{album.title}</h4>

            <div className="flex gap-2 mb-4">
              {album.listenLinks?.map((link) => (
                <a
                  key={link.url}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {link.icon == LinkType.youtubeMusic && (
                    <YoutubeMusic width={20}></YoutubeMusic>
                  )}
                  {link.icon == LinkType.spotify && (
                    <Spotify width={20}></Spotify>
                  )}
                </a>
              ))}
            </div>
          </div>
          <div className="flex flex-col bg-gray-900 py-4 pl-4 pr-8 rounded-e-lg">
            {album.songs.map((song, songIndex) => (
              <div className="flex gap-2" key={song.id}>
                <div
                  onClick={() => play(albumIndex!, songIndex!, Date.now())}
                  className={
                    (currentSong && currentSong.id === song.id
                      ? "text-shadow-gray-600"
                      : "text-gray-500") + " cursor-pointer"
                  }
                  title={
                    currentSong && currentSong.id === song.id
                      ? "Now Playing"
                      : "Click to Play"
                  }
                >
                  {song.title}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default AlbumListener;
