import { useEffect, useState, useRef } from 'react';
import { cn } from '../../cn';
import getConfig from './Config';
import 'vanilla-cookieconsent/dist/cookieconsent.css';
import * as CookieConsent from 'vanilla-cookieconsent';
import { Wheel } from 'react-custom-roulette';

/**
 * NOTE: This is the ACTUAL cookie consent banner that ships with Open SaaS
 * You may use this one with a wrapper as part of your contest submission
 * or you may create a dummy cookie consent banner as seen in the `WheelSpinner` example
 * below.
 */
const CookieConsentBanner = () => {
  useEffect(() => {
    CookieConsent.run(getConfig());
  }, []);

  return <div id='cookieconsent'></div>;
};

const MovingCookieConsentBanner = () => {
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const [isVisible, setIsVisible] = useState(true);
  const divRef = useRef<HTMLDivElement>(null);

  const handleMouseOver = () => {
    const divWidth = divRef.current ? divRef.current.offsetWidth : 0;
    const divHeight = divRef.current ? divRef.current.offsetHeight : 0;

    const newPosition = {
      top: Math.random() * (window.innerHeight - divHeight - 30), // subtract divHeight
      left: Math.random() * (window.innerWidth - divWidth - 30), // subtract divWidth
    };
    console.log('new position: ', newPosition);
    setPosition(newPosition);
  };

  return (
    <div style={{ position: 'absolute', top: position.top, left: position.left }} onMouseOver={handleMouseOver}>
      <div
        className={cn(
          { 'fixed bottom-0 left-0 w-full bg-blue-500 text-white p-4 flex justify-between items-center ': isVisible },
          { 'min-w-full bg-blue-500 text-white p-4 flex justify-between items-center ': !isVisible }
        )}
      >
        <div>
          <p className='font-bold'>This website uses cookies</p>
          <p>We use cookies to ensure you get the best experience on our website.</p>
        </div>
        <button
          disabled={!isVisible}
          className='bg-white text-blue-500 px-4 py-2 rounded'
          onClick={() => setIsVisible(false)}
        >
          Accept
        </button>
      </div>
      {/* <div id='cookieconsent'></div> */}
    </div>
  );
};

const ImmersiveCookieConsentBanner = () => {
  const [isVisible, setIsVisible] = useState(true);
  const [opacity, setOpacity] = useState(1);
  const [displacement, setDisplacement] = useState(0); // add this line

  const handleAccept = () => {
    setOpacity(0); // start the fade-out
    const intervalId = setInterval(() => {
      setDisplacement((dis) => dis + 100);
    }, 100);

    setTimeout(() => {
      clearInterval(intervalId);
    }, 10000);
    setTimeout(() => {
      setIsVisible(false); // remove the element after 10 seconds
      window.location.href =
        'https://www.youtube.com/watch?v=dQw4w9WgXcQ&pp=ygU8cmljayBhc3RsZXkgLSBuZXZlciBnb25uYSBnaXZlIHlvdSB1cCAob2ZmaWNpYWwgbXVzaWMgdmlkZW8p'; // navigate to new URL
    }, 10000);
  };

  return (
    isVisible && (
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundColor: 'rgba(0,0,0,0.8)',
          color: 'white',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          flexDirection: 'column',
          zIndex: 9999,
          opacity: opacity,
          transition: 'opacity 10s, filter 10s', // add filter to the transition
          filter: `url(#warp)`, // add this line
        }}
      >
        <svg style={{ position: 'absolute', width: 0, height: 0 }}>
          <filter id='warp'>
            <feTurbulence type='fractalNoise' baseFrequency='0.01' numOctaves='2' result='warp' />
            <feDisplacementMap
              xChannelSelector='R'
              yChannelSelector='G'
              scale={displacement}
              in='SourceGraphic'
              in2='warp'
            />
          </filter>
        </svg>
        <h2>This website uses cookies</h2>
        <p>We use cookies to ensure you get the best experience on our website.</p>
        <button
          style={{
            marginTop: '1em',
            padding: '0.5em 1em',
            fontSize: '1em',
            backgroundColor: 'white',
            color: 'black',
            border: 'none',
            borderRadius: '0.3em',
            cursor: 'pointer',
          }}
          onClick={handleAccept}
        >
          Accept
        </button>
      </div>
    )
  );
};

const BouncingBallConsentBanner = () => {
  const [isVisible, setIsVisible] = useState(true);
  const [ballPosition, setBallPosition] = useState({ x: 0, y: 0 });
  const [velocity, setVelocity] = useState({ x: 5, y: 5 });
  const [speed, setSpeed] = useState(8);

  const updateBallPosition = () => {
    let newX = ballPosition.x + velocity.x;
    let newY = ballPosition.y + velocity.y;

    if (newX < 0 || newX > window.innerWidth) {
      setVelocity({ x: -velocity.x, y: velocity.y });
    }

    if (newY < 0 || newY > window.innerHeight) {
      setVelocity({ x: velocity.x, y: -velocity.y });
    }

    setBallPosition({ x: newX, y: newY });
  };

  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  useEffect(() => {
    const interval = setInterval(updateBallPosition, speed);
    return () => clearInterval(interval);
  }, [ballPosition]);

  const handleKeyPress = (event: KeyboardEvent) => {
    if (event.code === 'Enter') {
      setSpeed((num) => {
        if (num >= 0) {
          return num / 2;
        }
        return num;
      });
      const acceptButton = document.getElementById('acceptButton');
      const ball = document.getElementById('ball');

      if (acceptButton && ball) {
        const acceptButtonRect = acceptButton.getBoundingClientRect();
        const ballRect = ball.getBoundingClientRect();

        const isOverlap =
          ballRect.right > acceptButtonRect.left &&
          ballRect.left < acceptButtonRect.right &&
          ballRect.bottom > acceptButtonRect.top &&
          ballRect.top < acceptButtonRect.bottom;

        if (isOverlap) {
          alert('got it!');
          setIsVisible(false);
        } else {
          alert('whoops. try again!');
        }
      }
    }
  };

  return (
    <>
      <div
        id='ball'
        className={cn('absolute bg-red-500 rounded-full z-50 w-12 h-12', { hidden: !isVisible })}
        style={{
          top: ballPosition.y,
          left: ballPosition.x,
        }}
      ></div>
      <div
        className={cn(
          'fixed top-0 left-0 w-full h-full bg-black bg-opacity-80 text-white flex justify-center items-center flex-col z-48',
          { hidden: !isVisible }
        )}
      >
        <div className='p-10 justify-center items-center flex flex-col bg-black bg-opacity-40 z-49'>
          <h2>This website uses cookies</h2>
          <p>We use cookies to ensure you get the best experience on our website.</p>
          <button
            id='acceptButton'
            className='mt-2 bg-white text-black px-4 py-2 rounded'
            onClick={() =>
              alert('press the ENTER key at the exact moment the ball is over the Accept button to consent to cookies.')
            }
          >
            Accept
          </button>
        </div>
      </div>
    </>
  );
};

// Dummy example for the Annoying Cookie Consent Banner contest
const WheelSpinnerConsentBanner = ({
  showCookieBanner,
  setShowCookieBanner,
}: {
  showCookieBanner: boolean;
  setShowCookieBanner: any;
}) => {
  const [winningOption, setWinningOption] = useState(0);
  const [isSpinning, setIsSpinning] = useState(false);

  const data = [
    { option: 'Accept ✅' },
    { option: 'Decline 👎' },
    { option: "I'm thinking 🤔" },
    { option: 'Mmm 🍪' },
    { option: 'Weeee! 🤗' },
    { option: 'This is fun! 🥳' },
  ];

  useEffect(() => {
    setWinningOption(Math.floor(Math.random() * data.length));
  }, []);

  const handleOnStopSpinning = () => {
    setIsSpinning(false);
    if (winningOption === 0 || winningOption === 1) {
      setShowCookieBanner(false);
      alert('Thanks. You may continue!');
    } else {
      alert('Uh oh. Try again.');
    }
    setWinningOption(Math.floor(Math.random() * data.length));
  };

  return (
    <>
      <div
        className={cn('hidden lg:fixed right-0 text-white flex justify-center items-center flex-col z-50', {
          'bottom-0': window.innerHeight > 600,
          'top-0': window.innerHeight <= 600,
          hidden: !showCookieBanner,
        })}
      >
        <div className='relative px-10 pt-5 pb-1 justify-center items-center text-center gap-2 flex flex-col bg-black bg-opacity-85'>
          <button
            className='absolute top-1 left-3 bg-transparent text-white text-xl'
            onClick={() => setShowCookieBanner(false)}
          >
            &times;
          </button>
          <p>
            Wasp's THE MOST ANNOYING COOKIE CONSENT BANNER CONTEST 2024. <br />
            Make something like this, and win cool prizes 🏅{' '}
          </p>
          <a
            href='https://wasp-lang.notion.site/The-MOST-ANNOYING-COOKIE-CONSENT-BANNER-Contest-e43b1345ac36453d8dfc6f271cb70ae8?pvs=4'
            className='underline'
            target='_blank'
          >
            Learn more!
          </a>

          <button
            className='mt-2 bg-white text-black text-sm px-4 py-2 rounded'
            onClick={() => setIsSpinning(true)}
            disabled={isSpinning}
          >
            Do you consent to cookies?
          </button>

          <Wheel
            innerBorderColor='white'
            radiusLineColor='white'
            innerBorderWidth={10}
            outerBorderColor='white'
            fontSize={22}
            textDistance={56}
            mustStartSpinning={isSpinning}
            onStopSpinning={handleOnStopSpinning}
            prizeNumber={winningOption}
            data={data}
            backgroundColors={['#3e3e3e', '#df3428', '#1f8a70', '#bedb39', '#b3a125', '#4b0082']}
            textColors={['#ffffff']}
          />
        </div>
      </div>
    </>
  );
};
export default WheelSpinnerConsentBanner;

// export default BouncingBallConsentBanner;
