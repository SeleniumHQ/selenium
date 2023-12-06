using System;
using System.IO;

namespace OpenQA.Selenium.Internal.Logging
{
    public class FileLogHandler : ILogHandler, IDisposable
    {
        private const string DEFAULT_FILE_NAME = "Selenium.WebDriver.log";

        // performance trick to avoid expensive Enum.ToString() with fixed length
        private static readonly string[] _levels = { "TRACE", "DEBUG", " INFO", " WARN", "ERROR" };

        private FileStream _fileStream;
        private StreamWriter _streamWriter;

        // this is global object for locking writing to the disk
        // probably we can lock writing per file path
        private readonly static object _lockObj = new object();
        private bool _isDisposed;

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

        public void Handle(LogEvent logEvent)
        {
            lock (_lockObj)
            {
                _streamWriter.WriteLine($"{logEvent.Timestamp:HH:mm:ss.fff} {_levels[(int)logEvent.Level]} {logEvent.IssuedBy.Name}: {logEvent.Message}");
            }
        }

        public void Dispose()
        {
            Dispose(true);
            GC.SuppressFinalize(this);
        }

        protected virtual void Dispose(bool disposing)
        {
            if (!_isDisposed)
            {
                if (disposing)
                {
                    _streamWriter?.Dispose();
                    _streamWriter = null;
                    _fileStream?.Dispose();
                    _fileStream = null;
                }

                _isDisposed = true;
            }
        }
    }
}
