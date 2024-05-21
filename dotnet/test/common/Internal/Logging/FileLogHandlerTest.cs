using NUnit.Framework;
using System;
using System.IO;
using System.Text.RegularExpressions;

namespace OpenQA.Selenium.Internal.Logging
{
    public class FileLogHandlerTest
    {
        [TestCase(null)]
        [TestCase("")]
        public void ShouldNotAcceptIncorrectPath(string path)
        {
            var act = () => new FileLogHandler(path);

            Assert.That(act, Throws.ArgumentException);
        }

        [Test]
        public void ShouldHandleLogEvent()
        {
            var tempFile = Path.GetTempFileName();

            try
            {
                using (var fileLogHandler = new FileLogHandler(tempFile))
                {
                    fileLogHandler.Handle(new LogEvent(typeof(FileLogHandlerTest), DateTimeOffset.Now, LogEventLevel.Info, "test message"));
                }

                Assert.That(File.ReadAllText(tempFile), Does.Contain("test message"));
            }
            finally
            {
                File.Delete(tempFile);
            }
        }

        [Test]
        public void ShouldCreateFileIfDoesNotExist()
        {
            var tempFile = Path.GetTempFileName();

            try
            {
                using (var fileLogHandler = new FileLogHandler(tempFile))
                {
                    fileLogHandler.Handle(new LogEvent(typeof(FileLogHandlerTest), DateTimeOffset.Now, LogEventLevel.Info, "test message"));
                }

                using (var fileLogHandler2 = new FileLogHandler(tempFile))
                {
                    fileLogHandler2.Handle(new LogEvent(typeof(FileLogHandlerTest), DateTimeOffset.Now, LogEventLevel.Info, "test message"));
                }

                Assert.That(Regex.Matches(File.ReadAllText(tempFile), "test message").Count, Is.EqualTo(1));
            }
            finally
            {
                File.Delete(tempFile);
            }
        }

        [Test]
        public void ShouldAppendFileIfExists()
        {
            var tempFilePath = Path.GetTempPath() + "somefile.log";

            try
            {
                using (var fileLogHandler = new FileLogHandler(tempFilePath))
                {
                    fileLogHandler.Handle(new LogEvent(typeof(FileLogHandlerTest), DateTimeOffset.Now, LogEventLevel.Info, "test message"));
                }

                using (var fileLogHandler2 = new FileLogHandler(tempFilePath, overwrite: false))
                {
                    fileLogHandler2.Handle(new LogEvent(typeof(FileLogHandlerTest), DateTimeOffset.Now, LogEventLevel.Info, "test message"));
                }

                Assert.That(Regex.Matches(File.ReadAllText(tempFilePath), "test message").Count, Is.EqualTo(2));
            }
            finally
            {
                File.Delete(tempFilePath);
            }
        }

        [Test]
        public void ShouldOverwriteFileIfExists()
        {
            var tempFile = Path.GetTempFileName();

            try
            {
                using (var fileLogHandler = new FileLogHandler(tempFile, overwrite: true))
                {
                    fileLogHandler.Handle(new LogEvent(typeof(FileLogHandlerTest), DateTimeOffset.Now, LogEventLevel.Info, "test message"));
                }

                Assert.That(Regex.Matches(File.ReadAllText(tempFile), "test message").Count, Is.EqualTo(1));
            }
            finally
            {
                File.Delete(tempFile);
            }
        }

        [Test]
        public void ShouldAppendFileIfDoesNotExist()
        {
            var tempFilePath = Path.GetTempPath() + "somefile.log";

            try
            {
                using (var fileLogHandler = new FileLogHandler(tempFilePath, overwrite: true))
                {
                    fileLogHandler.Handle(new LogEvent(typeof(FileLogHandlerTest), DateTimeOffset.Now, LogEventLevel.Info, "test message"));
                }

                Assert.That(Regex.Matches(File.ReadAllText(tempFilePath), "test message").Count, Is.EqualTo(1));
            }
            finally
            {
                File.Delete(tempFilePath);
            }
        }
    }
}
