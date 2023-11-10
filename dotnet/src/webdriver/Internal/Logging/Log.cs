using System;
using System.Threading;

namespace OpenQA.Selenium.Internal.Logging
{
    public static class Log
    {
        private static readonly ILogContext _globalLogContext = new LogContext(Level.None, Array.Empty<ILogHandler>());

        private static readonly AsyncLocal<ILogContext> _ambientLogContext = new AsyncLocal<ILogContext>();

        private static readonly object _logContextLock = new object();

        public static ILogContext ForContext
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

        public static ILogContext SetLevel(Level level)
        {
            return _globalLogContext.SetLevel(level);
        }

        public static ILogContext AddHandler(ILogHandler handler)
        {
            return _globalLogContext.AddHandler(handler);
        }
    }
}
