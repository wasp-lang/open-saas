import { useState, useEffect } from 'react';
import { AiFillGithub } from 'react-icons/ai';

type TimeLeft = { hours: string; minutes: string; seconds: string };

export default function Announcement() {
  const [timeLeft, setTimeLeft] = useState<TimeLeft | undefined>(
    calculateTimeLeft()
  );

  function calculateTimeLeft() {
    const targetDate = '2024-01-30T08:01:00Z';
    let diff = new Date(targetDate).getTime() - new Date().getTime();
    let timeLeft: TimeLeft | undefined;

    if (diff > 0) {
      timeLeft = {
        hours: Math.floor((diff / (1000 * 60 * 60)) % 24).toString(),
        minutes: Math.floor((diff / 1000 / 60) % 60).toString(),
        // make sure seconds are always displayed as two digits, e.g. '02'
        seconds: Math.floor((diff / 1000) % 60).toString(),
      };
    }
    if (!!timeLeft) {
      if (timeLeft.seconds.length === 1) {
        timeLeft.seconds = '0' + timeLeft.seconds;
      }
      if (timeLeft.minutes.length === 1) {
        timeLeft.minutes = '0' + timeLeft.minutes;
      }
    }
    return timeLeft;
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);
    return () => clearTimeout(timer);
  });

  return (
    <div className='flex items-center justify-center gap-3 border-b border-gray-300 border-dashed text-center py-6 text-sm'>
      Open SaaS trending on{' '}
      <a
        href='https://github.com/trending#:~:text=wasp%2Dlang%20/%20open%2Dsaas'
        target='_blank'
        rel='noopener noreferrer'
        className='flex items-center justify-center  gap-2  bg-purple-200 hover:bg-purple-300 text-gray-900 border-b border-1 border-purple-300 hover:border-purple-400 py-1 px-3 -my-1 rounded-full shadow-lg hover:shadow-md duration-200 ease-in-out tracking-wider'
      >
        <span>GitHub</span>
        <AiFillGithub />
      </a>
      📈
    </div>
  );
}
