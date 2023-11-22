using System;

namespace OpenQA.Selenium.Internal.Logging
{
    public interface ILogContext : ICloneable
    {
        ILogger GetLogger<T>();

        ILogger GetLogger(Type type);

        void LogMessage(LogEvent logEvent);

        ILogContext SetLevel(LogEventLevel level);

        ILogContext AddHandler(ILogHandler handler);
    }
}
