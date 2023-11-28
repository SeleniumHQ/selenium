namespace OpenQA.Selenium.Internal.Logging
{
    public static class Log
    {
        private static readonly LogContextManager _logContextManager = new LogContextManager();

        public static ILogContext CreateContext()
        {
            var context = _logContextManager.CurrentContext.CreateContext();

            _logContextManager.CurrentContext = context;

            return context;
        }

        public static ILogContext CreateContext(LogEventLevel minimumLevel)
        {
            var context = _logContextManager.CurrentContext.CreateContext(minimumLevel);

            _logContextManager.CurrentContext = context;

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

        public static ILogContext SetMinimumLevel(LogEventLevel level)
        {
            return _logContextManager.CurrentContext.SetMinimumLevel(level);
        }

        public static ILogContext WithHandler(ILogHandler handler)
        {
            return _logContextManager.CurrentContext.WithHandler(handler);
        }
    }
}
