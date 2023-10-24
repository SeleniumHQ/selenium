using System;
using System.Threading;

namespace OpenQA.Selenium.Internal.Logging
{
    public static class Log
    {
        private static readonly ILogContext _globalLogContext = new LogContext(LogLevel.None, Array.Empty<ILogHandler>());

        private static readonly AsyncLocal<ILogContext> _ambientLogContext = new AsyncLocal<ILogContext>();

        private static object _logContextLock = new object();

        public static ILogContext Context
        {
            get
            {
                if (_ambientLogContext.Value is null)
                {
                    lock (_logContextLock)
                    {
                        if (_ambientLogContext.Value is null)
                        {
                            _ambientLogContext.Value = (ILogContext)_globalLogContext.Clone();
                        }
                    }
                }

                return _ambientLogContext.Value;
            }
        }

        public static ILogger GetLogger<T>()
        {
            return _globalLogContext.GetLogger(typeof(T));
        }

        public static ILogger GetLogger(Type type)
        {
            return _globalLogContext.GetLogger(type);
        }

        public static ILogger GetLogger(string name)
        {
            return _globalLogContext.GetLogger(name);
        }

        public static ILogContext SetLevel(LogLevel level)
        {
            return _globalLogContext.SetLevel(level);
        }

        public static ILogContext AddHandler(ILogHandler handler)
        {
            return _globalLogContext.AddHandler(handler);
        }
    }
}
