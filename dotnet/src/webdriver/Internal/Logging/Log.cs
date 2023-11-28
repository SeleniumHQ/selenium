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

        public static ILogContext SetLevel(LogEventLevel level)
        {
            _logContextManager.GlobalContext.Level = level;

            return _logContextManager.GlobalContext;
        }

        public static ILogContext AddHandler(ILogHandler handler)
        {
            _logContextManager.GlobalContext.Handlers.Add(handler);

            return _logContextManager.GlobalContext;
        }
    }
}
