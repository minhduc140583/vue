import CommonResourcesEN from './ResourcesEN';
import CommonResourcesTH from './ResourcesTH';
import SetupResourcesEN from '../projects/setup/resource/SetupResourceEN';
import SetupResourcesTH from '../projects/setup/resource/SetupResourceTH';
import AuthenticationResourceEN from '../projects/authentication/resource/AuthenticationResourceEN';
import AuthenticationResourceTH from '../projects/authentication/resource/AuthenticationResourceTH';

const ResourcesEN = {
  ...AuthenticationResourceEN,
  ...CommonResourcesEN
};
const ResourcesTH = {
  ...AuthenticationResourceTH,
  ...CommonResourcesTH
};

const Resources = {
  en: ResourcesEN,
  th: ResourcesTH
};

export default Resources;
