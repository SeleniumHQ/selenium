
using NUnit.Framework;
using System;
using System.Collections.Generic;

namespace OpenQA.Selenium.Internal.Logging
{
    // mark it as non-parallelizable because of static nature of Log class
    [NonParallelizable]
    internal class LogTest
    {
        private TestLogHandler testLogHandler;

        [SetUp]
        public void SetUp()
        {
            testLogHandler = new TestLogHandler();
        }

        [Test]
        public void LoggerShouldEmitLogEvent()
        {
            Log.SetMinimumLevel(LogEventLevel.Info).WithHandler(testLogHandler);

            var logger = Log.GetLogger<LogTest>();

            logger.Info("test message");

            Assert.That(testLogHandler.Events, Has.Count.EqualTo(1));

            var logEvent = testLogHandler.Events[0];
            Assert.That(logEvent.Level, Is.EqualTo(LogEventLevel.Info));
            Assert.That(logEvent.Message, Is.EqualTo("test message"));
            Assert.That(logEvent.IssuedBy, Is.EqualTo(typeof(LogTest)));
            Assert.That(logEvent.Timestamp, Is.EqualTo(DateTimeOffset.Now).Within(100).Milliseconds);
        }
    }

    class TestLogHandler : ILogHandler
    {
        public ILogHandler Clone()
        {
            return this;
        }

        public void Handle(LogEvent logEvent)
        {
            Events.Add(logEvent);
        }

        public IList<LogEvent> Events { get; internal set; } = new List<LogEvent>();
    }
}
