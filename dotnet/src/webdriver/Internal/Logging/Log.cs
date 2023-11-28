using System;

namespace OpenQA.Selenium.Internal.Logging
{
    public static class Log
    {
        private static readonly LogContextManager _logContextManager = new LogContextManager();

        public static ILogContext CreateContext()
        {
            var context = CurrentContext.CreateContext();

            CurrentContext = context;

            return context;
        }

        public static ILogContext CreateContext(LogEventLevel minimumLevel)
        {
            var context = CurrentContext.CreateContext(minimumLevel);

            CurrentContext = context;

            return context;
        }

        internal static ILogContext CurrentContext
        {
            get
            {
                return _logContextManager.CurrentContext;
            }
            set
            {
                _logContextManager.CurrentContext = value;
            }
        }

        internal static ILogger GetLogger<T>()
        {
            return CurrentContext.GetLogger<T>();
        }

        internal static ILogger GetLogger(Type type)
        {
            return CurrentContext.GetLogger(type);
        }

        public static ILogContext SetMinimumLevel(LogEventLevel level)
        {
            return CurrentContext.SetMinimumLevel(level);
        }

        public static ILogContext SetMinimumLevel(Type issuer, LogEventLevel level)
        {
            return CurrentContext.SetMinimumLevel(issuer, level);
        }

        public static ILogContext WithHandler(ILogHandler handler)
        {
            return CurrentContext.WithHandler(handler);
        }
    }
}
