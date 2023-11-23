using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Linq;

namespace OpenQA.Selenium.Internal.Logging
{
    internal class LogContext : ILogContext
    {
        protected readonly ConcurrentDictionary<Type, ILogger> _loggers = new ConcurrentDictionary<Type, ILogger>();

        protected readonly IList<ILogHandler> _handlers;

        protected LogEventLevel _level;

        public LogContext(LogEventLevel level, IList<ILogHandler> handlers)
        {
            _level = level;

            if (handlers != null)
            {
                _handlers = new List<ILogHandler>(handlers);
            }
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

            return _loggers.GetOrAdd(type, _ => new Logger(type, _level));
        }

        public void LogMessage(ILogger logger, LogEventLevel level, string message)
        {
            if (_handlers != null && logger.Level >= level && logger.Level >= _level)
            {
                var logEvent = new LogEvent(logger.Issuer, DateTime.Now, level, message);

                foreach (var handler in _handlers)
                {
                    handler.Handle(logEvent);
                }
            }
        }

        public ILogContext SetLevel(LogEventLevel level)
        {
            _level = level;

            return this;
        }

        public ILogContext AddHandler(ILogHandler handler)
        {
            if (handler is null)
            {
                throw new ArgumentNullException(nameof(handler));
            }

            _handlers.Add(handler);

            return this;
        }

        public object Clone()
        {
            return new LogContext(_level, _handlers?.ToList());
        }
    }
}
