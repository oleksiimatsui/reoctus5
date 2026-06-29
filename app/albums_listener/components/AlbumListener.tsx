"use client";

import Pause from "@/app/icons/PauseIcon";
import PlayIcon from "@/app/icons/PlayIcon";
import Spotify from "@/app/icons/SpotifyIcon";
import YoutubeMusic from "@/app/icons/YoutubeMusicIcon";
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
  const [isPlayingLoading, setIsPlayingLoading] = useState<boolean>(false);

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

  const play = async (album: number, song: number) => {
    if (album == albumIndex && song == songIndex) {
      if (isPlaying == false) {
        resume();
      }
      return;
    }
    pauseButtonClicked();

    setIsPlayingLoading(true);
    setSongIndex(song);
    setAlbumIndex(album);
    setCurrentTimestamp(0);
  };
  const onPlay = (event: YouTubeEvent<number>) => {
    setIsPlayingLoading(false);
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

  const stopTimestampLoop = () => {
    if (interval.current) {
      clearInterval(interval.current);
      interval.current = null;
    }
  };

  const onPause = (currentTime: number) => {
    stopTimestampLoop();
    const elapsed =
      playedTimeBeforeResume.current + (currentTime - timeOfLastResume.current);
    setCurrentTimestamp(elapsed);
    setIsPlaying(false);
  };

  const pauseButtonClicked = () => {
    playerRef.current?.pauseVideo();
  };

  const startNext = () => {
    if (albumIndex == null || songIndex == null) return;
    if (songIndex != albums[albumIndex].songs.length - 1) {
      play(albumIndex, songIndex + 1);
    } else {
      setAlbumIndex(null);
      setSongIndex(null);
    }
  };

  const sliderClicked = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    const wasPlaying: boolean = isPlaying;
    if (wasPlaying) {
      stopTimestampLoop();
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
    <div className="w-full max-w-120 min-w-0">
      {currentSong != null && albumIndex != null && (
        <div className="shadow-2xl flex flex-col bg-neutral-950 p-3 rounded-lg mb-2">
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
              <div className="text-neutral-200">{currentSong.title}</div>
              <div className="text-sm text-neutral-400">
                {albums[albumIndex]?.title}
              </div>
            </div>
            <div className="ml-auto mr-4">
              {isPlayingLoading ? (
                <div className=" animate-[spin_1s_linear_infinite]  w-10 h-10 bg-[url(/sun.png)] bg-contain"></div>
              ) : isPlaying ? (
                <button
                  className="hover:bg-neutral-700 p-2 rounded-full"
                  onClick={() => pauseButtonClicked()}
                >
                  <Pause></Pause>
                </button>
              ) : (
                <button
                  className="hover:bg-neutral-700 p-2  rounded-full"
                  onClick={resume}
                >
                  <PlayIcon></PlayIcon>
                </button>
              )}
            </div>
          </div>

          <div
            className=" mx-1 py-4 -mb-2 cursor-pointer"
            onClick={(event) => sliderClicked(event)}
          >
            <div className="bg-neutral-900 w-full">
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
        onPause={(event) => onPause(Date.now())}
        onEnd={(event) => startNext()}
        opts={{
          playerVars: {
            controls: 0, // hide YouTube controls
            autoplay: 1,
          },
        }}
      />

      {albums.map((album, albumIndex) => (
        <div className="flex shadow-2xl" key={album.id}>
          <div className="  flex grow shrink bg-neutral-950 flex-col  rounded-s-lg">
            <div className="w-full max-w-40 min-w-0 mx-auto mt-4 mb-4">
              <div className="relative shrink" style={{ padding: "50%" }}>
                <div className={`absolute flex w-full h-full top-0 left-0`}>
                  <div
                    className={`grow bg-contain rounded-sm`}
                    style={{
                      backgroundImage: `url(/${albums[albumIndex]?.image})`,
                    }}
                  ></div>
                </div>
              </div>
            </div>
            <h4 className="mb-4 text-center text-neutral-200">{album.title}</h4>
            <div className="flex flex-col gap-2 mb-4 px-4">
              <button
                onClick={() => play(0, 0)}
                className="flex items-center gap-2 rounded-2xl bg-neutral-800 text-neutral-400 hover:text-neutral-300 hover:bg-neutral-700 py-1 px-4"
              >
                <div className="w-[20px] h-[20px] bg-[url(/sun.png)] bg-contain"></div>
                Слухати тут
              </button>

              {album.listenLinks?.map((link) => (
                <a
                  key={link.url}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 rounded-2xl bg-neutral-800 text-neutral-400 hover:text-neutral-300 hover:bg-neutral-700 py-1 px-4"
                >
                  {link.icon == LinkType.youtubeMusic && (
                    <YoutubeMusic width={20}></YoutubeMusic>
                  )}
                  {link.icon == LinkType.spotify && (
                    <Spotify width={20}></Spotify>
                  )}
                  {link.icon == LinkType.youtubeMusic && "YouTube Music"}{" "}
                  {link.icon == LinkType.spotify && "Spotify"}
                </a>
              ))}
            </div>
          </div>
          <div className=" shadow-[inset_12px_0_15px_-4px_rgba(0,0,0,0.5)] flex flex-col bg-neutral-900  py-4 pl-4 pr-8 rounded-e-lg">
            {album.songs.map((song, songIndex) => (
              <div className="flex gap-2" key={song.id}>
                <div
                  onClick={() => play(albumIndex!, songIndex!)}
                  className={
                    (currentSong && currentSong.id === song.id
                      ? "text-neutral-200"
                      : "text-neutral-500  hover:text-neutral-400") +
                    " cursor-pointer"
                  }
                  title={
                    currentSong && currentSong.id === song.id
                      ? "Оце зараз грає"
                      : "Тисніть щоб відтворити"
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
