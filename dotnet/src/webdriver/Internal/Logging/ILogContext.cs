using System;

namespace OpenQA.Selenium.Internal.Logging
{
    public interface ILogContext : ICloneable
    {
        ILogger GetLogger<T>();

        ILogger GetLogger(Type type);

        ILogger GetLogger(string name);

        void LogMessage(LogLevel level, string message);

        ILogContext SetLevel(LogLevel level);

        ILogContext AddHandler(ILogHandler handler);
    }
}
