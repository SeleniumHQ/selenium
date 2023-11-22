using System;
using System.Threading;

namespace OpenQA.Selenium.Internal.Logging
{
    internal class LogContextManager
    {
        private readonly ILogContext _globalLogContext = new LogContext(LogEventLevel.None, Array.Empty<ILogHandler>());

        private readonly AsyncLocal<ILogContext> _currentAmbientLogContext = new AsyncLocal<ILogContext>();

        public ILogContext GlobalContext
        {
            get { return _globalLogContext; }
        }

        public ILogContext CurrentContext
        {
            get
            {
                if (_currentAmbientLogContext.Value is null)
                {
                    return _globalLogContext;
                }
                else
                {
                    return _currentAmbientLogContext.Value;
                }
            }
            set
            {
                _currentAmbientLogContext.Value = value;
            }
        }
    }
}
