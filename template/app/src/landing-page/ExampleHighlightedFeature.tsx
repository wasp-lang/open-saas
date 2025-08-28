import HighlightedFeature from './components/HighlightedFeature';
import aiReadyDark from '../client/static/assets/aiready-dark.webp';
import aiReady from '../client/static/assets/aiready.webp';

export default function AIReady() {
  return (
    <HighlightedFeature
      name='Example Feature Highlight'
      description='Yo! Use this component to show off the most important features in your app.'
      highlightedComponent={<AIReadyExample />}
      direction='row-reverse'
    />
  );
}

const AIReadyExample = () => {
  return (
    <div className='w-full'>
      <img src={aiReady} alt='AI Ready' className='dark:hidden' />
      <img src={aiReadyDark} alt='AI Ready' className='hidden dark:block' />
    </div>
  );
};
