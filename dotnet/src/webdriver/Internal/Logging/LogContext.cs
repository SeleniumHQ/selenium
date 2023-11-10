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

        protected Level _level;

        public LogContext(Level level, IList<ILogHandler> handlers)
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

        public void LogMessage(LogEvent message)
        {
            if (_handlers != null)
            {
                if (message.Level >= _level)
                {
                    foreach (var handler in _handlers)
                    {
                        handler.Handle(message);
                    }
                }
            }
        }

        public ILogContext SetLevel(Level level)
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
