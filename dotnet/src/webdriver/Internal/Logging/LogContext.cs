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

        public LogContext(LogEventLevel level, ILogContext parentLogContext, ConcurrentDictionary<Type, ILogger> loggers, IList<ILogHandler> handlers)
        {
            _level = level;

            _parentLogContext = parentLogContext;

            _loggers = loggers;

            Handlers = handlers ?? new List<ILogHandler>();
        }

        public ILogContext CreateContext()
        {
            ConcurrentDictionary<Type, ILogger> loggers = null;

            if (_loggers != null)
            {
                loggers = new ConcurrentDictionary<Type, ILogger>(_loggers.Select(l => new KeyValuePair<Type, ILogger>(l.Key, new Logger(l.Value.Issuer, l.Value.Level))));
            }

            IList<ILogHandler> handlers = null;

            if (Handlers != null)
            {
                handlers = new List<ILogHandler>(Handlers.Select(h => h.Clone()));
            }
            else
            {
                handlers = new List<ILogHandler>();
            }

            return new LogContext(_level, this, loggers, handlers);
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
            if (Handlers != null && level >= _level && level >= GetLogger(logger.Issuer).Level)
            {
                var logEvent = new LogEvent(logger.Issuer, DateTime.Now, level, message);

                foreach (var handler in Handlers)
                {
                    handler.Handle(logEvent);
                }
            }
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
