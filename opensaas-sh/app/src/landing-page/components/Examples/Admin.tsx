import admin from '../../../client/static/assets/admin.png';
import HighlightedFeature from '../HighlightedFeature';

export default function Admin() {
  return (
    <HighlightedFeature
      name='Admin Dashboard'
      description='Graphs! Tables! Analytics w/ Plausible or Google! All in one place. Ooooooooh.'
      highlightedComponent={<AdminExample />}
    />
  );
}

const AdminExample = () => {
  return (
    <div className='w-full max-w-lg'>
      <img src={admin} alt='Admin' />
    </div>
  );
};
