using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Linq;

namespace OpenQA.Selenium.Internal.Logging
{
    internal class LogContext : ILogContext
    {
        protected ConcurrentDictionary<Type, ILogger> _loggers;

        protected LogEventLevel _level;

        protected ILogContext _parentLogContext;

        public LogContext(LogEventLevel level, ILogContext parentLogContext, ConcurrentDictionary<Type, ILogger> loggers)
        {
            _level = level;

            _parentLogContext = parentLogContext;

            _loggers = loggers;

            if (parentLogContext != null && parentLogContext.Handlers != null)
            {
                Handlers = new List<ILogHandler>(parentLogContext.Handlers.Select(h => h.Clone()));
            }
            else
            {
                Handlers = new List<ILogHandler>();
            }
        }

        public ILogContext CreateContext()
        {
            return new LogContext(_level, this, _loggers);
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
            if (Handlers != null && level >= logger.Level && level >= _level)
            {
                var logEvent = new LogEvent(logger.Issuer, DateTime.Now, level, message);

                foreach (var handler in Handlers)
                {
                    handler.Handle(logEvent);
                }
            }

            _parentLogContext?.EmitMessage(logger, level, message);
        }

        public LogEventLevel Level
        {
            get
            {
                return _level;
            }
            set
            {
                _level = value;

                if (_loggers != null)
                {
                    foreach (var logger in _loggers.Values)
                    {
                        logger.Level = _level;
                    }
                }
            }
        }

        public IList<ILogHandler> Handlers { get; internal set; }

        public void Dispose()
        {
            Log.CurrentContext = _parentLogContext;
        }
    }
}
