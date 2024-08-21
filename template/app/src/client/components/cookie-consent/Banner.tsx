import { useEffect, useState, useRef } from 'react';
import 'vanilla-cookieconsent/dist/cookieconsent.css';
import { cn } from '../../cn';

/**
 * NOTE: if you do not want to use the cookie consent banner, you should
 * run `npm uninstall vanilla-cookieconsent`, and delete this component, its config file,
 * as well as its import in src/client/App.tsx .
 */
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

export default MovingCookieConsentBanner;
