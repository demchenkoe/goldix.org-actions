const {CompositeType} = require('@goldix.org/types');
const globalErrors = require('./meta/globalErrors');

class ActionError extends Error {
  constructor(error, payload) {
    if (!error) return null;
    
    if (typeof error === 'string') {
      super(error);
    } else {
      super(error.message || null);
    }
    Error.captureStackTrace(this, this.constructor);
    this.originalError = error;
    this.payload = payload;
  }
}

class Action {
  
  constructor(options) {
    this.options = {
      ...options
    };
  }
  
  validateParams(params, context, options) {
    if (!this.meta || !this.meta.params) {
      return Promise.resolve(params);
    }
    
    return new CompositeType({values: params, schema: this.meta.params})
      .toJSON({validate: true})
  }
  
  getErrorOptions(hash) {
    let localErrorOptions = this.meta.errors && this.meta.errors[hash];
    let globalErrorOptions = globalErrors && globalErrors[hash];
    return {...globalErrorOptions, ...localErrorOptions};
  }
  
  async exec(params, context, options) {
    options = {...this.options, options};
    if (!context) {
      context = options.context || {};
    }
    params = await this.validateParams(params, context, options)
      .catch(e => {
        let hash = 'INVALID_PARAMS';
        return Promise.reject(
          new ActionError(e, {
            hash,
            errorOptions: this.getErrorOptions(hash),
            params,
            context,
            options,
            details: e.errors
          })
        );
      });
    try {
      return await this.process(params, context, options);
    }
    catch (e) {
      let hash;
      let errorOptions;
      
      if (e instanceof ActionError) {
        hash = e.payload && e.payload.hash;
        if (hash && !e.payload.errorOptions) {
          e.payload.errorOptions = this.getErrorOptions(hash);
        }
        e.payload.params  || (e.payload.params = params);
        e.payload.context || (e.payload.context = context);
        e.payload.options || (e.payload.options = options);
        
        return Promise.reject(e);
      }
      if (typeof e === 'string') {
        errorOptions = this.getErrorOptions(e);
        hash = errorOptions.hash;
      }
      if (!hash) {
        hash = 'INTERNAL_ACTION_ERROR';
        errorOptions = this.getErrorOptions(hash);
      }
      
      return Promise.reject(
        new ActionError(e, {
          hash,
          errorOptions,
          params,
          context,
          options,
        })
      );
    }
  }
}

Action._devStatuses = {...require('./meta/devStatuses')};
Action._accessLevels = {...require('./meta/accessLevels')};

Action.meta = (fn, {id, description, accessLevels, devStatus, params, ...other}) => {
  if (!id) {
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

/**
 *
 * @param fn
 * @param {object} options
 * @param {string} options.hash       Is unique error ID and key for i18n
 * @param {number} options.code       Is unique numeric code (optional if your API specification not declared it)
 * @param {number} options.httpCode   Http status code
 * @param {string} options.message    If not stated, the value "hash". This value can be replaced by i18n._(hash)
 */

Action.error = (fn, options) => {
  if (typeof fn === 'object') {
    options = fn;
    fn = null;
  }
  if (!options || typeof options !== 'object') {
    throw new Error('Options is required and must be object.');
  }
  
  if (typeof options.hash !== 'string' || !options.hash.length) {
    throw new Error('Option "hash" is required and must be string.');
  }
  
  if (fn === null) {
    //global error
    
    if (globalErrors[options.hash]) {
      if (!silent) throw new Error(`Global error ${options.hash} already exists.`);
      return;
    }
    globalErrors[options.hash] = {...options};
    
  } else {
    
    fn.meta = fn.prototype.meta = {
      ...fn.meta,
      errors: {
        ...fn.meta.errors,
        [options.hash]: {...options}
      }
    }
  }
};

module.exports = {Action, ActionError};
