import { useTranslation } from 'react-i18next';
import HighlightedFeature from './components/HighlightedFeature';
import aiReadyDark from '../client/static/assets/aiready-dark.webp';
import aiReady from '../client/static/assets/aiready.webp';

export default function AIReady() {
  const { t } = useTranslation();
  
  return (
    <HighlightedFeature
      name={t('highlightedFeature.name')}
      description={t('highlightedFeature.description')}
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
