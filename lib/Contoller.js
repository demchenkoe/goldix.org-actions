
class Controller {}

Controller._devStatuses = {...require('./meta/devStatuses')};
Controller._accessLevels = {...require('./meta/accessLevels')};

Controller.meta = (fn, {id, description, accessLevels, devStatus, params, actions, ...other}) => {
  if(!id) {
    id = fn.name || (fn.constructor && fn.constructor.name);
  }
  fn.meta = fn.prototype.meta = {
    ...fn.meta,
    id, description, devStatus, accessLevels, params,
    ...other
  };
  if (!fn.meta.devStatus) {
    fn.meta.devStatus = 'experimental';
  }
  if (typeof fn.meta.devStatus === 'string') {
    fn.meta.devStatus = Controller._devStatuses[fn.meta.devStatus];
  }
  
  if (!fn.meta.accessLevels) {
    fn.meta.accessLevels = 'public';
  }
  if (typeof fn.meta.accessLevels === 'string') {
    fn.meta.accessLevels = [fn.meta.accessLevels];
  }
  if (Array.isArray(fn.meta.accessLevels)) {
    fn.meta.accessLevels = fn.meta.accessLevels.map(name => Controller._accessLevels[name]);
  }
  fn.meta.actions = actions || [];
};

module.exports = { Controller };