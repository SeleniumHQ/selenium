using System;
using System.Collections.Concurrent;
using System.Collections.Generic;

namespace OpenQA.Selenium.Internal.Logging
{
    internal class LogManager : ILogManager
    {
        private readonly ConcurrentDictionary<string, ILogger> _loggers = new ConcurrentDictionary<string, ILogger>();

        private readonly IList<ILogHandler> _handlers = new List<ILogHandler>();

        private LogLevel _level;

        public LogManager(LogLevel level, IList<ILogHandler> handlers)
        {
            _level = level;

            _handlers = handlers ?? new List<ILogHandler>();
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

        public ILogManager SetLevel(LogLevel level)
        {
            _level = level;

            return this;
        }

        public ILogManager AddHandler(ILogHandler handler)
        {
            if (handler is null)
            {
                throw new ArgumentNullException(nameof(handler));
            }

            _handlers.Add(handler);

            return this;
        }
    }
}
