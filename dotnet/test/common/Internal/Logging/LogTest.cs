using NUnit.Framework;
using System;
using System.Collections.Generic;

namespace OpenQA.Selenium.Internal.Logging
{
    public class LogTest
    {
        private TestLogHandler testLogHandler;
        private ILogger logger;

        [SetUp]
        public void SetUp()
        {
            testLogHandler = new TestLogHandler();
            logger = Log.GetLogger<LogTest>();
        }

        [Test]
        public void LoggerShouldEmitEvent()
        {
            Log.SetMinimumLevel(LogEventLevel.Info).WithHandler(testLogHandler);

            logger.Info("test message");

            Assert.That(testLogHandler.Events, Has.Count.EqualTo(1));

            var logEvent = testLogHandler.Events[0];
            Assert.That(logEvent.Level, Is.EqualTo(LogEventLevel.Info));
            Assert.That(logEvent.Message, Is.EqualTo("test message"));
            Assert.That(logEvent.IssuedBy, Is.EqualTo(typeof(LogTest)));
            Assert.That(logEvent.Timestamp, Is.EqualTo(DateTimeOffset.Now).Within(100).Milliseconds);
        }

        [Test]
        [TestCase(LogEventLevel.Trace)]
        [TestCase(LogEventLevel.Debug)]
        [TestCase(LogEventLevel.Info)]
        [TestCase(LogEventLevel.Warn)]
        [TestCase(LogEventLevel.Error)]
        public void LoggerShouldEmitEventWithProperLevel(LogEventLevel level)
        {
            Log.SetMinimumLevel(level).WithHandler(testLogHandler);

            switch (level)
            {
                case LogEventLevel.Trace:
                    logger.Trace("test message");
                    break;
                case LogEventLevel.Debug:
                    logger.Debug("test message");
                    break;
                case LogEventLevel.Info:
                    logger.Info("test message");
                    break;
                case LogEventLevel.Warn:
                    logger.Warn("test message");
                    break;
                case LogEventLevel.Error:
                    logger.Error("test message");
                    break;
            }

            Assert.That(testLogHandler.Events, Has.Count.EqualTo(1));

            Assert.That(testLogHandler.Events[0].Level, Is.EqualTo(level));
        }

        [Test]
        public void LoggerShouldNotEmitEventWhenLevelIsLess()
        {
            Log.SetMinimumLevel(LogEventLevel.Info).WithHandler(testLogHandler);

            logger.Trace("test message");

            Assert.That(testLogHandler.Events, Has.Count.EqualTo(0));
        }

        [Test]
        public void A()
        {
            Log.CurrentContext.
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
