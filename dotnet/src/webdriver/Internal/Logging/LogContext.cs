using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Linq;

namespace OpenQA.Selenium.Internal.Logging
{
    internal class LogContext : ILogContext
    {
        protected readonly ConcurrentDictionary<string, ILogger> _loggers = new ConcurrentDictionary<string, ILogger>();

        protected readonly ConcurrentBag<ILogHandler> _handlers = new ConcurrentBag<ILogHandler>();

        protected LogLevel _level;

        public LogContext(LogLevel level, IList<ILogHandler> handlers)
        {
            _level = level;

            _handlers = new ConcurrentBag<ILogHandler>(handlers);
        }

        public ILogger GetLogger<T>()
        {
            return GetLogger(typeof(T));
        }

        public ILogger GetLogger(Type type)
        {
            return GetLogger(type.FullName);
        }

        public ILogger GetLogger(string name)
        {
            return _loggers.GetOrAdd(name, _ => new Logger(_level));
        }

        public void LogMessage(LogLevel level, string message)
        {
            if (level >= _level)
            {
                if (_handlers.Count > 0)
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
            return new LogContext(_level, _handlers.ToList());
        }
    }
}
