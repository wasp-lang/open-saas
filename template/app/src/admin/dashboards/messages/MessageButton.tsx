import { MessageCircleMore } from "lucide-react";
import { Link as WaspRouterLink, routes } from "wasp/client/router";

const MessageButton = () => {
  return (
    <li className="relative" x-data="{ dropdownOpen: false, notifying: true }">
      <WaspRouterLink
        className="h-8.5 w-8.5 border-stroke bg-gray hover:text-primary dark:border-strokedark dark:bg-meta-4 relative flex items-center justify-center rounded-full border-[0.5px] dark:text-white"
        to={routes.AdminMessagesRoute.to}
      >
        <span className="z-1 bg-meta-1 absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full">
          {/* TODO: only animate if there are new messages */}
          <span className="-z-1 bg-meta-1 absolute inline-flex h-full w-full animate-ping rounded-full opacity-75"></span>
        </span>
        <MessageCircleMore className="size-5" />
      </WaspRouterLink>
    </li>
  );
};

export default MessageButton;
