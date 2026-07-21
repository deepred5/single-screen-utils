import forceOrientation, {
  DetectType,
  OrientationMode,
  ForceOrientationProps,
} from '../force-orientation';

export { DetectType };
export type PortraitProps = ForceOrientationProps;

const forcePortrait = (p: PortraitProps = {}) => forceOrientation(OrientationMode.portrait, p);

forcePortrait.DetectType = DetectType;

export default forcePortrait;
