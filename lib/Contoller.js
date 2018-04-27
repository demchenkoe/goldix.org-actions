class Controller {
  
  getRouter() {
    const {RestRouter} = require('@goldix.org/http');
    return this.restRouter || (this.restRouter = new RestRouter({name: this.meta.id}));
  }
  
}

Controller._devStatuses = require('./meta/devStatuses');
Controller._accessLevels = require('./meta/accessLevels');

Controller.meta = (fn, {name, description, accessLevels, devStatus, params, actions, ...other}) => {
  fn.meta = fn.prototype.meta = {
    ...fn.meta,
    name, description, devStatus, accessLevels, params,
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