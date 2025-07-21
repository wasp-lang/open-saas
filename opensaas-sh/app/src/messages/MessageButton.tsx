import { MessageCircleMore } from 'lucide-react';
import { Link as WaspRouterLink, routes } from 'wasp/client/router';

const MessageButton = () => {
  return (
    <li className='relative' x-data='{ dropdownOpen: false, notifying: true }'>
      <WaspRouterLink
        className='relative flex h-8.5 w-8.5 items-center justify-center rounded-full border-[0.5px] border-stroke bg-gray hover:text-primary dark:border-strokedark dark:bg-meta-4 dark:text-white'
        to={routes.AdminMessagesRoute.to}
      >
        <span className='absolute -top-0.5 -right-0.5 z-1 h-2 w-2 rounded-full bg-meta-1'>
          {/* TODO: only animate if there are new messages */}
          <span className='absolute -z-1 inline-flex h-full w-full animate-ping rounded-full bg-meta-1 opacity-75'></span>
        </span>
        <MessageCircleMore className='size-5' />
      </WaspRouterLink>
    </li>
  );
};

export default MessageButton;
