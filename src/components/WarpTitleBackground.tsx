import { useReducedGraphics } from '../hooks/use-mobile';

const WarpTitleBackground = ({ active }: { active: boolean }) => {
  const reduceGraphics = useReducedGraphics();

  return (
    <div
      className={`mobile-title-warp absolute inset-0 ${active && !reduceGraphics ? 'title-warp-active' : ''}`}
      aria-hidden="true"
    />
  );
};

export default WarpTitleBackground;
