import forceOrientation, {
  DetectType,
  OrientationMode,
  ForceOrientationProps,
} from '../force-orientation';

export { DetectType };
export type LandscapeProps = ForceOrientationProps;

const forceLandscape = (p: LandscapeProps = {}) => forceOrientation(OrientationMode.landscape, p);

forceLandscape.DetectType = DetectType;

export default forceLandscape;
