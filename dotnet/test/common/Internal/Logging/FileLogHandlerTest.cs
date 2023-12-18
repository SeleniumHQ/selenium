using NUnit.Framework;
using System;
using System.IO;

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
    }
}
