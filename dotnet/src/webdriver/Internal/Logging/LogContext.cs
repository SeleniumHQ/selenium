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

        protected LogLevel _level;

        public LogContext(LogLevel level, IList<ILogHandler> handlers)
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

            return _loggers.GetOrAdd(type, _ => new Logger(_level));
        }

        public ILogger GetLogger(string name)
        {
            return GetLogger(Type.GetType(name));
        }

        public void LogMessage(LogLevel level, string message)
        {
            if (_handlers != null)
            {
                if (level >= _level)
                {
                    var logMessage = new LogMessage(DateTime.Now, level, message);

                    foreach (var handler in _handlers)
                    {
                        handler.Handle(logMessage);
                    }
                }
            }
        }

        public virtual ILogContext SetLevel(LogLevel level)
        {
            _level = level;

            return this;
        }

        public virtual ILogContext AddHandler(ILogHandler handler)
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
