using System;
using System.IO;

namespace OpenQA.Selenium.Internal.Logging
{
    public class FileLogHandler : ILogHandler
    {
        private static readonly string[] _levels = { "TRACE", "DEBUG", " INFO", " WARN", "ERROR" };

        private readonly string _path;

        private readonly object _lock = new object();

        public FileLogHandler()
            : this("Selenium.WebDriver.log")
        {

        }

        public FileLogHandler(string path)
        {
            _path = path;
        }

        public ILogHandler Clone()
        {
            return this;
        }

        public void Handle(LogEvent logEvent)
        {
            lock(_lock)
            {
                File.App
            }
        }
    }
}
