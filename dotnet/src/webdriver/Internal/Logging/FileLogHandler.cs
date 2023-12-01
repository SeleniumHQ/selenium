using System;
using System.IO;

namespace OpenQA.Selenium.Internal.Logging
{
    public class FileLogHandler : ILogHandler, IDisposable
    {
        private readonly FileStream _writerStream;
        private readonly StreamWriter _writer;

        private readonly static object _lock = new object();

        public FileLogHandler()
            : this("Selenium.WebDriver.log")
        {

        }

        public FileLogHandler(string path)
        {
            _writerStream = File.Open(path, FileMode.OpenOrCreate, FileAccess.Write, FileShare.Read);
            _writerStream.Seek(0, SeekOrigin.End);
            _writer = new StreamWriter(_writerStream, System.Text.Encoding.UTF8)
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
            lock (_lock)
            {
                _writer.WriteLine($"{logEvent.Message}");
            }
        }

        public void Dispose()
        {
            _writer?.Dispose();
            _writerStream?.Dispose();
        }
    }
}
