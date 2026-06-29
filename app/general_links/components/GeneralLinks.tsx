import YoutubeIcon from "@/app/icons/YoutubeIcon";
import InstagramIcon from "@/app/icons/InstagramIcon";

const GeneralLinks = () => {
  const info = {
    name: "П'ятий Реоктус",
    instagram: "https://www.instagram.com/reoctus5",
    youtube: "https://www.youtube.com/@reoctus5",
  };

  return (
    <div className="w-full max-w-120 min-w-0 ">
      <div className="shadow-2xl bg-neutral-950   flex p-3 gap-1 items-center rounded-lg">
        <div className="grow shrink">{info.name}</div>

        <a href={info.instagram} target="_blank" rel="noopener noreferrer">
          <InstagramIcon width={20}></InstagramIcon>
        </a>
        <a href={info.youtube} target="_blank" rel="noopener noreferrer">
          <YoutubeIcon width={20}></YoutubeIcon>
        </a>
      </div>
    </div>
  );
};
export default GeneralLinks;
