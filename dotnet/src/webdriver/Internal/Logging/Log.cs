namespace OpenQA.Selenium.Internal.Logging
{
    public static class Log
    {
        private static readonly LogContextManager _logContextManager = new LogContextManager();

        public static ILogContext CreateContext()
        {
            var context = (ILogContext)_logContextManager.GlobalContext.Clone();

            _logContextManager.CurrentContext = context;

            return context;
        }

        internal static ILogContext CurrentContext
        {
            get
            {
                return _logContextManager.CurrentContext;
            }
        }

        public static ILogContext SetLevel(LogEventLevel level)
        {
            return _logContextManager.GlobalContext.SetLevel(level);
        }

        public static ILogContext AddHandler(ILogHandler handler)
        {
            return _logContextManager.GlobalContext.AddHandler(handler);
        }
    }
}
