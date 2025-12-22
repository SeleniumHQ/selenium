/**
 * @license
 * Copyright The Closure Library Authors.
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Basic strippable logging definitions.
 * @see http://go/closurelogging
 */

goog.provide('goog.log');
goog.provide('goog.log.Level');
goog.provide('goog.log.LogBuffer');
goog.provide('goog.log.LogRecord');
goog.provide('goog.log.Logger');

goog.require('goog.asserts');
goog.require('goog.debug');


/**
 * A message value that can be handled by a goog.log.Logger.
 *
 * Functions are treated like callbacks, but are only called when the event's
 * log level is enabled. This is useful for logging messages that are expensive
 * to construct.
 *
 * @typedef {string|function(): string}
 */
goog.log.Loggable;

/** @define {boolean} Whether logging is enabled. */
goog.log.ENABLED = goog.define('goog.log.ENABLED', goog.debug.LOGGING_ENABLED);

/** @const */
goog.log.ROOT_LOGGER_NAME = '';


// TODO(user): Make goog.log.Level an enum.
/**
 * The goog.log.Level class defines a set of standard logging levels that
 * can be used to control logging output.  The logging goog.log.Level objects
 * are ordered and are specified by ordered integers.  Enabling logging
 * at a given level also enables logging at all higher levels.
 * <p>
 * Clients should normally use the predefined goog.log.Level constants such
 * as goog.log.Level.SEVERE.
 * <p>
 * The levels in descending order are:
 * <ul>
 * <li>SEVERE (highest value)
 * <li>WARNING
 * <li>INFO
 * <li>CONFIG
 * <li>FINE
 * <li>FINER
 * <li>FINEST  (lowest value)
 * </ul>
 * In addition there is a level OFF that can be used to turn
 * off logging, and a level ALL that can be used to enable
 * logging of all messages.
 *
 * @final
 */
goog.log.Level = class Level {
  /**
   * @param {string} name The name of the level.
   * @param {number} value The numeric value of the level.
   */
  constructor(name, value) {
    /**
     * The name of the level
     * @type {string}
     * @const
     */
    this.name = name;

    /**
     * The numeric value of the level
     * @type {number}
     */
    this.value = value;
  }

  /**
   * @return {string} String representation of the logger level.
   * @override
   */
  toString() {
    return this.name;
  }
};


/**
 * OFF is a special level that can be used to turn off logging.
 * This level is initialized to <CODE>Infinity</CODE>.
 * @type {!goog.log.Level}
 */
goog.log.Level.OFF = new goog.log.Level('OFF', Infinity);


/**
 * SHOUT is a message level for extra debugging loudness.
 * This level is initialized to <CODE>1200</CODE>.
 * @type {!goog.log.Level}
 */
goog.log.Level.SHOUT = new goog.log.Level('SHOUT', 1200);


/**
 * SEVERE is a message level indicating a serious failure.
 * This level is initialized to <CODE>1000</CODE>.
 * @type {!goog.log.Level}
 */
goog.log.Level.SEVERE = new goog.log.Level('SEVERE', 1000);


/**
 * WARNING is a message level indicating a potential problem.
 * This level is initialized to <CODE>900</CODE>.
 * @type {!goog.log.Level}
 */
goog.log.Level.WARNING = new goog.log.Level('WARNING', 900);


/**
 * INFO is a message level for informational messages.
 * This level is initialized to <CODE>800</CODE>.
 * @type {!goog.log.Level}
 */
goog.log.Level.INFO = new goog.log.Level('INFO', 800);


/**
 * CONFIG is a message level for static configuration messages.
 * This level is initialized to <CODE>700</CODE>.
 * @type {!goog.log.Level}
 */
goog.log.Level.CONFIG = new goog.log.Level('CONFIG', 700);


/**
 * FINE is a message level providing tracing information.
 * This level is initialized to <CODE>500</CODE>.
 * @type {!goog.log.Level}
 */
goog.log.Level.FINE = new goog.log.Level('FINE', 500);


/**
 * FINER indicates a fairly detailed tracing message.
 * This level is initialized to <CODE>400</CODE>.
 * @type {!goog.log.Level}
 */
goog.log.Level.FINER = new goog.log.Level('FINER', 400);

/**
 * FINEST indicates a highly detailed tracing message.
 * This level is initialized to <CODE>300</CODE>.
 * @type {!goog.log.Level}
 */

goog.log.Level.FINEST = new goog.log.Level('FINEST', 300);


/**
 * ALL indicates that all messages should be logged.
 * This level is initialized to <CODE>0</CODE>.
 * @type {!goog.log.Level}
 */
goog.log.Level.ALL = new goog.log.Level('ALL', 0);


/**
 * The predefined levels.
 * @type {!Array<!goog.log.Level>}
 * @final
 */
goog.log.Level.PREDEFINED_LEVELS = [
  goog.log.Level.OFF, goog.log.Level.SHOUT, goog.log.Level.SEVERE,
  goog.log.Level.WARNING, goog.log.Level.INFO, goog.log.Level.CONFIG,
  goog.log.Level.FINE, goog.log.Level.FINER, goog.log.Level.FINEST,
  goog.log.Level.ALL
];


/**
 * A lookup map used to find the level object based on the name or value of
 * the level object.
 * @type {?Object}
 * @private
 */
goog.log.Level.predefinedLevelsCache_ = null;


/**
 * Creates the predefined levels cache and populates it.
 * @private
 */
goog.log.Level.createPredefinedLevelsCache_ = function() {
  goog.log.Level.predefinedLevelsCache_ = {};
  for (let i = 0, level; level = goog.log.Level.PREDEFINED_LEVELS[i]; i++) {
    goog.log.Level.predefinedLevelsCache_[level.value] = level;
    goog.log.Level.predefinedLevelsCache_[level.name] = level;
  }
};


/**
 * Gets the predefined level with the given name.
 * @param {string} name The name of the level.
 * @return {!goog.log.Level|null} The level, or null if none found.
 */
goog.log.Level.getPredefinedLevel = function(name) {
  if (!goog.log.Level.predefinedLevelsCache_) {
    goog.log.Level.createPredefinedLevelsCache_();
  }

  return goog.log.Level.predefinedLevelsCache_[name] || null;
};


/**
 * Gets the highest predefined level <= #value.
 * @param {number} value goog.log.Level value.
 * @return {!goog.log.Level|null} The level, or null if none found.
 */
goog.log.Level.getPredefinedLevelByValue = function(value) {
  if (!goog.log.Level.predefinedLevelsCache_) {
    goog.log.Level.createPredefinedLevelsCache_();
  }

  if (value in /** @type {!Object} */ (goog.log.Level.predefinedLevelsCache_)) {
    return goog.log.Level.predefinedLevelsCache_[value];
  }

  for (let i = 0; i < goog.log.Level.PREDEFINED_LEVELS.length; ++i) {
    let level = goog.log.Level.PREDEFINED_LEVELS[i];
    if (level.value <= value) {
      return level;
    }
  }
  return null;
};


/** @interface */
goog.log.Logger = class Logger {
  /**
   * Gets the name of the Logger.
   * @return {string}
   * @public
   */
  getName() {}
};


/**
 * Only for compatibility with goog.debug.Logger.Level, which is how many users
 * access Level.
 * TODO(user): Remove these definitions.
 * @final
 */
goog.log.Logger.Level = goog.log.Level;


/**
 * A buffer for log records. The purpose of this is to improve
 * logging performance by re-using old objects when the buffer becomes full and
 * to eliminate the need for each app to implement their own log buffer. The
 * disadvantage to doing this is that log handlers cannot maintain references to
 * log records and expect that they are not overwriten at a later point.
 * @final
 */
goog.log.LogBuffer = class LogBuffer {
  /**
   * @param {number=} capacity The capacity of this LogBuffer instance.
   */
  constructor(capacity) {
    /**
     * The buffer's capacity.
     * @type {number}
     * @private
     */
    this.capacity_ =
        typeof capacity === 'number' ? capacity : goog.log.LogBuffer.CAPACITY;

    /**
     * The array to store the records.
     * @type {!Array<!goog.log.LogRecord|undefined>}
     * @private
     */
    this.buffer_;

    /**
     * The index of the most recently added record, or -1 if there are no
     * records.
     * @type {number}
     * @private
     */
    this.curIndex_;

    /**
     * Whether the buffer is at capacity.
     * @type {boolean}
     * @private
     */
    this.isFull_;

    this.clear();
  }


  /**
   * Adds a log record to the buffer, possibly overwriting the oldest record.
   * @param {!goog.log.Level} level One of the level identifiers.
   * @param {string} msg The string message.
   * @param {string} loggerName The name of the source logger.
   * @return {!goog.log.LogRecord} The log record.
   */
  addRecord(level, msg, loggerName) {
    if (!this.isBufferingEnabled()) {
      return new goog.log.LogRecord(level, msg, loggerName);
    }
    const curIndex = (this.curIndex_ + 1) % this.capacity_;
    this.curIndex_ = curIndex;
    if (this.isFull_) {
      const ret = this.buffer_[curIndex];
      ret.reset(level, msg, loggerName);
      return ret;
    }
    this.isFull_ = curIndex == this.capacity_ - 1;
    return this.buffer_[curIndex] =
               new goog.log.LogRecord(level, msg, loggerName);
  }

  /**
   * Calls the given function for each buffered log record, starting with the
   * oldest one.
   * TODO(user): Make this a [Symbol.iterator] once all usages of
   * goog.debug.LogBuffer can be deleted.
   * @param {!goog.log.LogRecordHandler} func The function to call.
   */
  forEachRecord(func) {
    const buffer = this.buffer_;
    // Corner case: no records.
    if (!buffer[0]) {
      return;
    }
    const curIndex = this.curIndex_;
    let i = this.isFull_ ? curIndex : -1;
    do {
      i = (i + 1) % this.capacity_;
      func(/** @type {!goog.log.LogRecord} */ (buffer[i]));
    } while (i !== curIndex);
  }

  /**
   * @return {boolean} Whether the log buffer is enabled.
   */
  isBufferingEnabled() {
    return this.capacity_ > 0;
  }

  /**
   * @return {boolean} Return whether the log buffer is full.
   */
  isFull() {
    return this.isFull_;
  }

  /**
   * Removes all buffered log records.
   */
  clear() {
    this.buffer_ = new Array(this.capacity_);
    this.curIndex_ = -1;
    this.isFull_ = false;
  }
};


/**
 * @type {!goog.log.LogBuffer|undefined}
 * @private
 */
goog.log.LogBuffer.instance_;


/**
 * @define {number} The number of log records to buffer. 0 means disable
 * buffering.
 */
goog.log.LogBuffer.CAPACITY = goog.define('goog.debug.LogBuffer.CAPACITY', 0);


/**
 * A static method that always returns the same instance of goog.log.LogBuffer.
 * @return {!goog.log.LogBuffer} The goog.log.LogBuffer singleton instance.
 */
goog.log.LogBuffer.getInstance = function() {
  if (!goog.log.LogBuffer.instance_) {
    goog.log.LogBuffer.instance_ =
        new goog.log.LogBuffer(goog.log.LogBuffer.CAPACITY);
  }
  return goog.log.LogBuffer.instance_;
};


/**
 * Whether the log buffer is enabled.
 * @return {boolean}
 */
goog.log.LogBuffer.isBufferingEnabled = function() {
  return goog.log.LogBuffer.getInstance().isBufferingEnabled();
};


/**
 * LogRecord objects are used to pass logging requests between the logging
 * framework and individual log handlers. These objects should not be
 * constructed or reset by application code.
 */
goog.log.LogRecord = class LogRecord {
  /**
   * @param {?goog.log.Level} level One of the level identifiers.
   * @param {string} msg The string message.
   * @param {string} loggerName The name of the source logger.
   * @param {number=} time Time this log record was created if other than
   *     now. If 0, we use #goog.now.
   * @param {number=} sequenceNumber Sequence number of this log record.
   *     This should only be passed in when restoring a log record from
   *     persistence.
   */
  constructor(level, msg, loggerName, time, sequenceNumber) {
    /**
     * Level of the LogRecord.
     * @type {!goog.log.Level}
     * @private
     */
    this.level_;

    /**
     * Name of the logger that created the record.
     * @type {string}
     * @private
     */
    this.loggerName_;

    /**
     * Message associated with the record
     * @type {string}
     * @private
     */
    this.msg_;

    /**
     * Time the LogRecord was created.
     * @type {number}
     * @private
     */
    this.time_;

    /**
     * Sequence number for the LogRecord. Each record has a unique sequence
     * number that is greater than all log records created before it.
     * @type {number}
     * @private
     */
    this.sequenceNumber_;

    /**
     * Exception associated with the record
     * @type {*}
     * @private
     */
    this.exception_ = undefined;

    this.reset(
        level || goog.log.Level.OFF, msg, loggerName, time, sequenceNumber);
  };

  /**
   * Sets all fields of the log record.
   * @param {!goog.log.Level} level One of the level identifiers.
   * @param {string} msg The string message.
   * @param {string} loggerName The name of the source logger.
   * @param {number=} time Time this log record was created if other than
   *     now. If 0, we use #goog.now.
   * @param {number=} sequenceNumber Sequence number of this log record.
   *     This should only be passed in when restoring a log record from
   *     persistence.
   */
  reset(level, msg, loggerName, time, sequenceNumber) {
    this.time_ = time || goog.now();
    this.level_ = level;
    this.msg_ = msg;
    this.loggerName_ = loggerName;
    this.exception_ = undefined;
    this.sequenceNumber_ = typeof sequenceNumber === 'number' ?
        sequenceNumber :
        goog.log.LogRecord.nextSequenceNumber_;
  };


  /**
   * Gets the source Logger's name.
   *
   * @return {string} source logger name (may be null).
   */
  getLoggerName() {
    return this.loggerName_;
  };


  /**
   * Sets the source Logger's name.
   *
   * @param {string} name The logger name.
   */
  setLoggerName(name) {
    this.loggerName_ = name;
  };


  /**
   * Gets the exception that is part of the log record.
   *
   * @return {*} the exception.
   */
  getException() {
    return this.exception_;
  };


  /**
   * Sets the exception that is part of the log record.
   * @param {*} exception the exception.
   */
  setException(exception) {
    this.exception_ = exception;
  };


  /**
   * Gets the logging message level, for example Level.SEVERE.
   * @return {!goog.log.Level} the logging message level.
   */
  getLevel() {
    return this.level_;
  };


  /**
   * Sets the logging message level, for example Level.SEVERE.
   * @param {!goog.log.Level} level the logging message level.
   */
  setLevel(level) {
    this.level_ = level;
  };


  /**
   * Gets the "raw" log message, before localization or formatting.
   * @return {string} the raw message string.
   */
  getMessage() {
    return this.msg_;
  };


  /**
   * Sets the "raw" log message, before localization or formatting.
   *
   * @param {string} msg the raw message string.
   */
  setMessage(msg) {
    this.msg_ = msg;
  };


  /**
   * Gets event time in milliseconds since 1970.
   * @return {number} event time in millis since 1970.
   */
  getMillis() {
    return this.time_;
  };


  /**
   * Sets event time in milliseconds since 1970.
   * @param {number} time event time in millis since 1970.
   */
  setMillis(time) {
    this.time_ = time;
  };


  /**
   * Gets the sequence number. Sequence numbers are normally assigned when a
   * LogRecord is constructed or reset in incrementally increasing order.
   * @return {number}
   */
  getSequenceNumber() {
    return this.sequenceNumber_;
  };
};


/**
 * A sequence counter for assigning increasing sequence numbers to LogRecord
 * objects.
 * @type {number}
 * @private
 */
goog.log.LogRecord.nextSequenceNumber_ = 0;


/**
 * A type that describes a function that handles logs.
 * @typedef {function(!goog.log.LogRecord): ?}
 */
goog.log.LogRecordHandler;


/**
 * A LogRegistryEntry_ contains data about a Logger.
 * @final
 */
goog.log.LogRegistryEntry_ = class LogRegistryEntry_ {
  /**
   * @param {string} name
   * @param {!goog.log.LogRegistryEntry_|null=} parent
   */
  constructor(name, parent = null) {
    /**
     * The minimum log level that a message must be for it to be logged by the
     * Logger corresponding to this LogRegistryEntry_. If null, the parent's
     * log level is used instead.
     * @type {?goog.log.Level}
     */
    this.level = null;

    /**
     * A list of functions that will be called when the Logger corresponding to
     * this LogRegistryEntry_ is used to log a message.
     * @type {!Array<!goog.log.LogRecordHandler>}
     */
    this.handlers = [];

    /**
     * A reference to LogRegistryEntry_ objects that correspond to the direct
     * ancestor of the Logger represented by this LogRegistryEntry_ object
     * (via name, treated as a dot-separated namespace).
     * @type {!goog.log.LogRegistryEntry_|null}
     */
    this.parent = parent || null;

    /**
     * A list of references to LogRegistryEntry_ objects that correspond to the
     * direct descendants of the Logger represented by this LogRegistryEntry_
     * object (via name, treated as a dot-separated namespace).
     * @type {!Array<!goog.log.LogRegistryEntry_>}
     */
    this.children = [];

    /**
     * A reference to the Logger itself.
     * @type {!goog.log.Logger}
     */
    this.logger = /** @type {!goog.log.Logger} */ ({getName: () => name});
  }

  /**
   * Returns the effective level of the logger based on its ancestors' levels.
   * @return {!goog.log.Level} The level.
   */
  getEffectiveLevel() {
    if (this.level) {
      return this.level;
    } else if (this.parent) {
      return this.parent.getEffectiveLevel();
    }
    goog.asserts.fail('Root logger has no level set.');
    return goog.log.Level.OFF;
  };

  /**
   * Calls the log handlers associated with this Logger, followed by those of
   * its parents, etc. until the root Logger's associated log handlers are
   * called.
   * @param {!goog.log.LogRecord} logRecord The log record to pass to each
   *     handler.
   */
  publish(logRecord) {
    let target = this;
    while (target) {
      target.handlers.forEach(handler => {
        handler(logRecord);
      });
      target = target.parent;
    }
  }
};


/**
 * A LogRegistry_ owns references to all loggers, and is responsible for storing
 * all the internal state needed for loggers to operate correctly.
 *
 * @final
 */
goog.log.LogRegistry_ = class LogRegistry_ {
  constructor() {
    /**
     * Per-log information retained by this LogRegistry_.
     * @type {!Object<string, !goog.log.LogRegistryEntry_>}
     */
    this.entries = {};

    // The root logger.
    const rootLogRegistryEntry =
        new goog.log.LogRegistryEntry_(goog.log.ROOT_LOGGER_NAME);
    rootLogRegistryEntry.level = goog.log.Level.CONFIG;
    this.entries[goog.log.ROOT_LOGGER_NAME] = rootLogRegistryEntry;
  }

  /**
   * Gets the LogRegistry_ entry under the given name, creating the entry if one
   * doesn't already exist.
   * @param {string} name The name to look up.
   * @param {?goog.log.Level=} level If provided, override the default logging
   *     level of the returned Logger with the provided level.
   * @return {!goog.log.LogRegistryEntry_}
   */
  getLogRegistryEntry(name, level) {
    const entry = this.entries[name];
    if (entry) {
      if (level !== undefined) {
        entry.level = level;
      }
      return entry;
    } else {
      // The logger and its associated registry entry needs to be created.

      // Get its parent first.
      const lastDotIndex = name.lastIndexOf('.');
      const parentName = name.slice(0, Math.max(lastDotIndex, 0));
      const parentLogRegistryEntry = this.getLogRegistryEntry(parentName);

      // Now create the new entry, linking it with its parent.
      const logRegistryEntry =
          new goog.log.LogRegistryEntry_(name, parentLogRegistryEntry);
      this.entries[name] = logRegistryEntry;
      parentLogRegistryEntry.children.push(logRegistryEntry);

      if (level !== undefined) {
        logRegistryEntry.level = level;
      }

      return logRegistryEntry;
    }
  }

  /**
   * Get a list of all loggers.
   * @return {!Array<!goog.log.Logger>}
   */
  getAllLoggers() {
    return Object.keys(this.entries)
        .map(loggerName => this.entries[loggerName].logger);
  }
};

/**
 * A static method that always returns the same instance of LogRegistry_.
 * @return {!goog.log.LogRegistry_} The LogRegistry_ singleton instance.
 */
goog.log.LogRegistry_.getInstance = function() {
  if (!goog.log.LogRegistry_.instance_) {
    goog.log.LogRegistry_.instance_ = new goog.log.LogRegistry_();
  }
  return /** @type {!goog.log.LogRegistry_} */ (
      goog.log.LogRegistry_.instance_);
};

/**
 * @type {!goog.log.LogRegistry_|undefined}
 * @private
 */
goog.log.LogRegistry_.instance_;


/**
 * Finds or creates a logger for a named subsystem. If a logger has already been
 * created with the given name it is returned. Otherwise, a new logger is
 * created. If a new logger is created, it will be configured to send logging
 * output to its parent's handlers.
 *
 * @param {string} name A name for the logger. This should be a dot-separated
 *     name and should normally be based on the package name or class name of
 *     the subsystem, such as goog.net.BrowserChannel.
 * @param {?goog.log.Level=} level If provided, override the default logging
 *     level with the provided level. This parameter is deprecated; prefer using
 *     goog.log.setLevel to set the logger's level instead.
 *     TODO(user): Delete this parameter.
 * @return {!goog.log.Logger|null} The named logger, or null if logging is
 *     disabled.
 */
goog.log.getLogger = function(name, level) {
  if (goog.log.ENABLED) {
    const loggerEntry =
        goog.log.LogRegistry_.getInstance().getLogRegistryEntry(name, level);
    return loggerEntry.logger;
  } else {
    return null;
  }
};


/**
 * Returns the root logger.
 *
 * @return {!goog.log.Logger|null} The root logger, or null if logging is
 *     disabled.
 */
goog.log.getRootLogger = function() {
  if (goog.log.ENABLED) {
    const loggerEntry = goog.log.LogRegistry_.getInstance().getLogRegistryEntry(
        goog.log.ROOT_LOGGER_NAME);
    return loggerEntry.logger;
  } else {
    return null;
  }
};


// TODO(johnlenz): try to tighten the types to these functions.
/**
 * Adds a handler to the logger. This doesn't use the event system because
 * we want to be able to add logging to the event system.
 * @param {?goog.log.Logger} logger
 * @param {!goog.log.LogRecordHandler} handler Handler function to
 *     add.
 */
goog.log.addHandler = function(logger, handler) {
  if (goog.log.ENABLED && logger) {
    const loggerEntry = goog.log.LogRegistry_.getInstance().getLogRegistryEntry(
        logger.getName());
    loggerEntry.handlers.push(handler);
  }
};


/**
 * Removes a handler from the logger. This doesn't use the event system because
 * we want to be able to add logging to the event system.
 * @param {?goog.log.Logger} logger
 * @param {!goog.log.LogRecordHandler} handler Handler function to
 *     remove.
 * @return {boolean} Whether the handler was removed.
 */
goog.log.removeHandler = function(logger, handler) {
  if (goog.log.ENABLED && logger) {
    const loggerEntry = goog.log.LogRegistry_.getInstance().getLogRegistryEntry(
        logger.getName());
    const indexOfHandler = loggerEntry.handlers.indexOf(handler);
    if (indexOfHandler !== -1) {
      loggerEntry.handlers.splice(indexOfHandler, 1);
      return true;
    }
  }
  return false;
};


/**
 * Set the log level specifying which message levels will be logged by this
 * logger. Message levels lower than this value will be discarded.
 * The level value goog.log.Level.OFF can be used to turn off logging. If the
 * new level is null, it means that this node should inherit its level from its
 * nearest ancestor with a specific (non-null) level value.
 *
 * @param {?goog.log.Logger} logger
 * @param {!goog.log.Level|null} level The new level.
 */
goog.log.setLevel = function(logger, level) {
  if (goog.log.ENABLED && logger) {
    const loggerEntry = goog.log.LogRegistry_.getInstance().getLogRegistryEntry(
        logger.getName());
    loggerEntry.level = level;
  }
};


/**
 * Gets the log level specifying which message levels will be logged by this
 * logger. Message levels lower than this value will be discarded.
 * The level value goog.log.Level.OFF can be used to turn off logging. If the
 * level is null, it means that this node should inherit its level from its
 * nearest ancestor with a specific (non-null) level value.
 *
 * @param {?goog.log.Logger} logger
 * @return {!goog.log.Level|null} The level.
 */
goog.log.getLevel = function(logger) {
  if (goog.log.ENABLED && logger) {
    const loggerEntry = goog.log.LogRegistry_.getInstance().getLogRegistryEntry(
        logger.getName());
    return loggerEntry.level;
  }
  return null;
};


/**
 * Returns the effective level of the logger based on its ancestors' levels.
 * @param {?goog.log.Logger} logger
 * @return {!goog.log.Level} The level.
 */
goog.log.getEffectiveLevel = function(logger) {
  if (goog.log.ENABLED && logger) {
    const loggerEntry = goog.log.LogRegistry_.getInstance().getLogRegistryEntry(
        logger.getName());
    return loggerEntry.getEffectiveLevel();
  }
  return goog.log.Level.OFF;
};


/**
 * Checks if a message of the given level would actually be logged by this
 * logger. This check is based on the goog.log.Loggers effective level, which
 * may be inherited from its parent.
 * @param {?goog.log.Logger} logger
 * @param {?goog.log.Level} level The level to check.
 * @return {boolean} Whether the message would be logged.
 */
goog.log.isLoggable = function(logger, level) {
  if (goog.log.ENABLED && logger && level) {
    return level.value >= goog.log.getEffectiveLevel(logger).value;
  }
  return false;
};


/**
 * Gets a list of all loggers.
 * @return {!Array<!goog.log.Logger>}
 */
goog.log.getAllLoggers = function() {
  if (goog.log.ENABLED) {
    return goog.log.LogRegistry_.getInstance().getAllLoggers();
  }
  return [];
};


/**
 * Creates a log record. If the logger is currently enabled for the
 * given message level then the given message is forwarded to all the
 * registered output Handler objects.
 * TODO(user): Delete this method from the public API.
 * @param {?goog.log.Logger} logger
 * @param {?goog.log.Level} level One of the level identifiers.
 * @param {string} msg The message to log.
 * @param {*=} exception An exception associated with the message.
 * @return {!goog.log.LogRecord}
 */
goog.log.getLogRecord = function(logger, level, msg, exception = undefined) {
  const logRecord = goog.log.LogBuffer.getInstance().addRecord(
      level || goog.log.Level.OFF, msg, logger.getName());
  logRecord.setException(exception);
  return logRecord;
};


/**
 * Logs a goog.log.LogRecord. If the logger is currently enabled for the
 * given message level then the given message is forwarded to all the
 * registered output Handler objects.
 * TODO(user): Delete this method from the public API.
 * @param {?goog.log.Logger} logger
 * @param {!goog.log.LogRecord} logRecord A log record to log.
 */
goog.log.publishLogRecord = function(logger, logRecord) {
  if (goog.log.ENABLED && logger &&
      goog.log.isLoggable(logger, logRecord.getLevel())) {
    const loggerEntry = goog.log.LogRegistry_.getInstance().getLogRegistryEntry(
        logger.getName());
    loggerEntry.publish(logRecord);
  }
};


/**
 * Logs a message. If the logger is currently enabled for the
 * given message level then the given message is forwarded to all the
 * registered output Handler objects.
 * TODO(user): The level parameter should be made required.
 * @param {?goog.log.Logger} logger
 * @param {?goog.log.Level} level One of the level identifiers.
 * @param {!goog.log.Loggable} msg The message to log.
 * @param {*=} exception An exception associated with the message.
 */
goog.log.log = function(logger, level, msg, exception = undefined) {
  if (goog.log.ENABLED && logger && goog.log.isLoggable(logger, level)) {
    level = level || goog.log.Level.OFF;
    const loggerEntry = goog.log.LogRegistry_.getInstance().getLogRegistryEntry(
        logger.getName());
    // Message callbacks can be useful when a log message is expensive to build.
    if (typeof msg === 'function') {
      msg = msg();
    }
    const logRecord = goog.log.LogBuffer.getInstance().addRecord(
        level, msg, logger.getName());
    logRecord.setException(exception);
    // Publish logs.
    loggerEntry.publish(logRecord);
  }
};


/**
 * Logs a message at the goog.log.Level.SEVERE level.
 * If the logger is currently enabled for the given message level then the
 * given message is forwarded to all the registered output Handler objects.
 * @param {?goog.log.Logger} logger
 * @param {!goog.log.Loggable} msg The message to log.
 * @param {*=} exception An exception associated with the message.
 */
goog.log.error = function(logger, msg, exception = undefined) {
  if (goog.log.ENABLED && logger) {
    goog.log.log(logger, goog.log.Level.SEVERE, msg, exception);
  }
};


/**
 * Logs a message at the goog.log.Level.WARNING level.
 * If the logger is currently enabled for the given message level then the
 * given message is forwarded to all the registered output Handler objects.
 * @param {?goog.log.Logger} logger
 * @param {!goog.log.Loggable} msg The message to log.
 * @param {*=} exception An exception associated with the message.
 */
goog.log.warning = function(logger, msg, exception = undefined) {
  if (goog.log.ENABLED && logger) {
    goog.log.log(logger, goog.log.Level.WARNING, msg, exception);
  }
};


/**
 * Logs a message at the goog.log.Level.INFO level.
 * If the logger is currently enabled for the given message level then the
 * given message is forwarded to all the registered output Handler objects.
 * @param {?goog.log.Logger} logger
 * @param {!goog.log.Loggable} msg The message to log.
 * @param {*=} exception An exception associated with the message.
 */
goog.log.info = function(logger, msg, exception = undefined) {
  if (goog.log.ENABLED && logger) {
    goog.log.log(logger, goog.log.Level.INFO, msg, exception);
  }
};


/**
 * Logs a message at the goog.log.Level.FINE level.
 * If the logger is currently enabled for the given message level then the
 * given message is forwarded to all the registered output Handler objects.
 * @param {?goog.log.Logger} logger
 * @param {!goog.log.Loggable} msg The message to log.
 * @param {*=} exception An exception associated with the message.
 */
goog.log.fine = function(logger, msg, exception = undefined) {
  if (goog.log.ENABLED && logger) {
    goog.log.log(logger, goog.log.Level.FINE, msg, exception);
  }
};
