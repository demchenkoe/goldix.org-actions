const {CompositeType} = require('@goldix.org/types');

class Action {
  
  constructor(props) {
    this.props = props;
  }
  
  validateParams(params, context, options) {
    if (!this.meta || !this.meta.params) {
      return Promise.resolve(params);
    }
    
    return new CompositeType({values: params, schema: this.meta.params})
      .toJSON({validate: true})
  }
  
  exec(params, context, options) {
    return Promise.resolve('this is mock...');
  }
}

Action._devStatuses = require('./meta/devStatuses');
Action._accessLevels = require('./meta/accessLevels');

Action.meta = (fn, {name, description, accessLevels, devStatus, params, ...other}) => {
  fn.meta = fn.prototype.meta = {
    ...fn.meta,
    name, description, devStatus, accessLevels, params,
    ...other
  };
  if (!fn.meta.devStatus) {
    fn.meta.devStatus = 'experimental';
  }
  if (typeof fn.meta.devStatus === 'string') {
    fn.meta.devStatus = Action._devStatuses[fn.meta.devStatus];
  }
  
  if (!fn.meta.accessLevels) {
    fn.meta.accessLevels = 'public';
  }
  if (typeof fn.meta.accessLevels === 'string') {
    fn.meta.accessLevels = [fn.meta.accessLevels];
  }
  if (Array.isArray(fn.meta.accessLevels)) {
    fn.meta.accessLevels = fn.meta.accessLevels.map(name => Action._accessLevels[name]);
  }
};

module.exports = { Action };
