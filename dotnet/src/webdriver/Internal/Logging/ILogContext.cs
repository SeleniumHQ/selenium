using System;
using System.Collections.Generic;

namespace OpenQA.Selenium.Internal.Logging
{
    public interface ILogContext : IDisposable
    {
        ILogContext CreateContext();

        ILogger GetLogger<T>();

        ILogger GetLogger(Type type);

        void EmitMessage(ILogger logger, LogEventLevel level, string message);

        LogEventLevel Level { get; set; }

        IList<ILogHandler> Handlers { get; }
    }
}
