using System;
using System.IO;

namespace OpenQA.Selenium.Internal.Logging
{
    public class FileLogHandler : ILogHandler, IDisposable
    {
        private const string DEFAULT_FILE_NAME = "Selenium.WebDriver.log";

        // performance trick to avoid expensive Enum.ToString() with fixed length
        private static readonly string[] _levels = { "TRACE", "DEBUG", " INFO", " WARN", "ERROR" };

        private readonly FileStream _fileStream;
        private readonly StreamWriter _streamWriter;

        private readonly object _lockObj = new object();

        public FileLogHandler()
            : this(DEFAULT_FILE_NAME)
        {

        }

        public FileLogHandler(string path)
        {
            _fileStream = File.Open(path, FileMode.OpenOrCreate, FileAccess.Write, FileShare.Read);
            _fileStream.Seek(0, SeekOrigin.End);
            _streamWriter = new StreamWriter(_fileStream, System.Text.Encoding.UTF8)
            {
                AutoFlush = true
            };
        }

        public ILogHandler Clone()
        {
            return this;
        }

        public void Handle(LogEvent logEvent)
        {
            lock (_lockObj)
            {
                _streamWriter.WriteLine($"{logEvent.Timestamp:HH:mm:ss.fff} {_levels[(int)logEvent.Level]} {logEvent.IssuedBy.Name}: {logEvent.Message}");
            }
        }

        public void Dispose()
        {
            _streamWriter.Dispose();
            _fileStream.Dispose();
        }
    }
}
