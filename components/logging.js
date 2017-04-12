'use strict';

const winston = require('winston');

const settings = require('./settings');

/**
 * Represents a wrapper for winston logger.
 */
class WinstonLoggerWrapper {
  /**
   * constructor for WinstonLoggerWrapper class.
   * @param  {Winston.Logger} logger          An instance of winston.Logger.
   * @param  {String}         [moduleName=''] Name of module in which logger
   *                                          is used.
   */
  constructor(logger, moduleName = '') {
    this.logger = logger;
    this.moduleName = moduleName;

    for (let level in winston.levels) {
      if (Object.prototype.hasOwnProperty.call(winston.levels, level)) {
        this[level] = this.log.bind(this, level);
      }
    }
  }

  /**
   * Returns an instance of WinstonLoggerWrapper.
   * @param  {String}               moduleName Name of module in which logger
   *                                           is used.
   * @return {WinstonLoggerWrapper}            An instance of
   *                                           WinstonLoggerWrapper.
   */
  getWrapperForModule(moduleName) {
    return new WinstonLoggerWrapper(this.logger, moduleName);
  }

  /**
   * Logs message.
   * @param  {String}   level    Logging level.
   * @param  {String[]} messages Messages to log.
   */
  log(level, ...messages) {
    let message = messages.map(handleMessage).join(' ');
    let moduleInfo = '';
    if (this.moduleName && String(this.moduleName).length) {
      moduleInfo = `[${this.moduleName}] `;
    }
    this.logger[level](`${moduleInfo}${message}`);
  }
}

/**
 * Creates transports for logger.
 * @param  {String[]}             transportsJson      Arrays of transports
 *                                                    options.
 * @param  {Function}             [formatFunc=format] Formatter.
 * @return {Winston.transports[]}                     Array of transports.
 */
function createTransports(transportsJson, formatFunc = format) {
  let transports = [];
  let c = 0;

  transportsJson.forEach(function(transport) {
    switch (transport.type) {
    case 'console':
      transports.push(new(winston.transports.Console)({
        name: 'transport-' + (c++),
        level: transport.level,
        formatter: formatFunc,
        timestamp: time,
        json: false,
      }));
      break;
    case 'file':
      transports.push(new(winston.transports.File)({
        name: 'transport-' + (c++),
        filename: transport.path,
        level: transport.level,
        formatter: formatFunc,
        timestamp: time,
        json: false,
      }));
      break;
    }
  });

  return process.env.NODE_ENV === 'test' ? [] : transports;
}

/**
 * Adds stack trace to error messages.
 * @param  {String} message Logging message.
 * @return {String}         Logging message.
 */
function handleMessage(message) {
  if (message instanceof Error) {
    return message.toString() + ' at: ' + message.stack;
  }

  return message;
}

/**
 * Formatter function.
 * @param  {String[]} options Formatting options.
 * @return {String}           Formatted logging message.
 */
function format(options) {
  return time() + ' [' + options.level.toUpperCase() + ']: ' + options.message;
}

/**
 * Returns date in local format.
 * @return {Date} Current date in ru-Ru locale.
 */
function time() {
  return new Date().toLocaleString('ru-RU');
}

let logger = new WinstonLoggerWrapper(new(winston.Logger)({
  transports: createTransports(settings.logging.transports),
}));

process.on('uncaughtException', (error) => {
  logger.error('Uncaught exception:', error);
});

process.on('unhandledRejection', (error) => {
  logger.error('Unhandled promise rejection:', error);
});

module.exports = logger;
