import _objectAssign from './_objectAssign';

export default typeof Object.assign === 'function' ? Object.assign : _objectAssign;