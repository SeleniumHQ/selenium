using System;
using System.Collections.Concurrent;
using System.Linq;
using System.Threading;

namespace OpenQA.Selenium.Internal.Logging
{
    public static class Log
    {
        private static LogLevel _level = LogLevel.None;

        private static readonly ConcurrentBag<ILogHandler> _handlers = new ConcurrentBag<ILogHandler>();

        private static readonly AsyncLocal<ILogManager> _ambientLogManager = new AsyncLocal<ILogManager>();

        private static readonly ILogManager _globalLogManager = new LogManager(_level, _handlers.ToList());

        public static ILogManager Instance
        {
            get
            {
                if (_ambientLogManager.Value is null)
                {
                    lock (_ambientLogManager)
                    {
                        if (_ambientLogManager.Value is null)
                        {
                            _ambientLogManager.Value = CreateLogManager();
                        }
                    }
                }

                return _ambientLogManager.Value;
            }
        }

        private static ILogManager CreateLogManager()
        {
            return new LogManager(_level, _handlers.ToList());
        }

        public static ILogger GetLogger<T>()
        {
            return GetLogger(typeof(T));
        }

        public static ILogger GetLogger(Type type)
        {
            if (type == null)
            {
                throw new ArgumentNullException(nameof(type));
            }

            return GetLogger(type.FullName);
        }

        public static ILogger GetLogger(string name)
        {
            return Instance.GetLogger(name);
        }

        public static ILogManager SetLevel(LogLevel level)
        {
            Console.WriteLine($"Setting log level to {level}");

            if (_ambientLogManager.Value is null)
            {
                Console.WriteLine($"Setting global log level to {level}");
                return _globalLogManager.SetLevel(level);
            }

            return Instance.SetLevel(level);
        }

        public static ILogManager AddHandler(ILogHandler handler)
        {
            Console.WriteLine($"Adding log handler {handler}");
            if (_ambientLogManager.Value is null)
            {
                Console.WriteLine($"Adding global log handler {handler}");
                _handlers.Add(handler);

                return _globalLogManager.AddHandler(handler);
            }

            return Instance.AddHandler(handler);
        }
    }
}
