import aiReadyDark from "../client/static/assets/aiready-dark.webp";
import aiReady from "../client/static/assets/aiready.webp";
import HighlightedFeature from "./components/HighlightedFeature";

export default function AIReady() {
  return (
    <HighlightedFeature
      name="Example Feature Highlight"
      description="Yo! Use this component to show off the most important features in your app."
      highlightedComponent={<AIReadyExample />}
      direction="row-reverse"
    />
  );
}

const AIReadyExample = () => {
  return (
    <div className="w-full">
      <img src={aiReady} alt="AI Ready" width={600} height={503} loading="lazy" className="dark:hidden" />
      <img src={aiReadyDark} alt="AI Ready" width={600} height={518} loading="lazy" className="hidden dark:block" />
    </div>
  );
};
