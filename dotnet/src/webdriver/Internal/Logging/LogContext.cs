using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Linq;

namespace OpenQA.Selenium.Internal.Logging
{
    internal class LogContext : ILogContext
    {
        private ConcurrentDictionary<Type, ILogger> _loggers;

        private IList<ILogHandler> _handlers;

        private LogEventLevel _level;

        private readonly ILogContext _parentLogContext;

        public LogContext(LogEventLevel level, ILogContext parentLogContext, ConcurrentDictionary<Type, ILogger> loggers, IList<ILogHandler> handlers)
        {
            _level = level;

            _parentLogContext = parentLogContext;

            _loggers = loggers;

            _handlers = handlers ?? new List<ILogHandler>();
        }

        public ILogContext CreateContext()
        {
            return CreateContext(_level);
        }

        public ILogContext CreateContext(LogEventLevel minimumLevel)
        {
            ConcurrentDictionary<Type, ILogger> loggers = null;

            if (_loggers != null)
            {
                loggers = new ConcurrentDictionary<Type, ILogger>(_loggers.Select(l => new KeyValuePair<Type, ILogger>(l.Key, new Logger(l.Value.Issuer, minimumLevel))));
            }

            IList<ILogHandler> handlers = null;

            if (_handlers != null)
            {
                handlers = new List<ILogHandler>(_handlers.Select(h => h.Clone()));
            }
            else
            {
                handlers = new List<ILogHandler>();
            }

            return new LogContext(minimumLevel, this, loggers, handlers);
        }

        public ILogger GetLogger<T>()
        {
            return GetLogger(typeof(T));
        }

        public ILogger GetLogger(Type type)
        {
            if (type == null)
            {
                throw new ArgumentNullException(nameof(type));
            }

            if (_loggers is null)
            {
                _loggers = new ConcurrentDictionary<Type, ILogger>();
            }

            return _loggers.GetOrAdd(type, _ => new Logger(type, _level));
        }

        public void EmitMessage(ILogger logger, LogEventLevel level, string message)
        {
            if (_handlers != null && level >= _level && level >= GetLogger(logger.Issuer).Level)
            {
                var logEvent = new LogEvent(logger.Issuer, DateTime.Now, level, message);

                foreach (var handler in _handlers)
                {
                    handler.Handle(logEvent);
                }
            }
        }

        public ILogContext SetMinimumLevel(LogEventLevel level)
        {
            _level = level;

            if (_loggers != null)
            {
                foreach (var logger in _loggers.Values)
                {
                    logger.Level = _level;
                }
            }

            return this;
        }

        public ILogContext WithHandler(ILogHandler handler)
        {
            _handlers.Add(handler);

            return this;
        }

        public void Dispose()
        {
            Log.CurrentContext = _parentLogContext;
        }
    }
}
