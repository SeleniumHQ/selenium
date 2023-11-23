using System;

namespace OpenQA.Selenium.Internal.Logging
{
    public interface ILogContext : ICloneable
    {
        ILogger GetLogger<T>();

        ILogger GetLogger(Type type);

        void LogMessage(ILogger logger, LogEventLevel level, string message);

        ILogContext SetLevel(LogEventLevel level);

        ILogContext AddHandler(ILogHandler handler);
    }
}
