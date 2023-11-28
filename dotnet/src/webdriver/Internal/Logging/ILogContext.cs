using System;

namespace OpenQA.Selenium.Internal.Logging
{
    public interface ILogContext : IDisposable
    {
        ILogContext CreateContext();

        ILogContext CreateContext(LogEventLevel minimumLevel);

        ILogger GetLogger<T>();

        ILogger GetLogger(Type type);

        void EmitMessage(ILogger logger, LogEventLevel level, string message);

        ILogContext SetMinimumLevel(LogEventLevel level);

        ILogContext WithHandler(ILogHandler handler);
    }
}
