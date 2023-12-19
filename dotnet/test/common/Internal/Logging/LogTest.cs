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
            Log.SetLevel(LogEventLevel.Info).Handlers.Add(testLogHandler);

            logger.Info("test message");

            Assert.That(testLogHandler.Events, Has.Count.EqualTo(1));

            var logEvent = testLogHandler.Events[0];
            Assert.That(logEvent.Level, Is.EqualTo(LogEventLevel.Info));
            Assert.That(logEvent.Message, Is.EqualTo("test message"));
            Assert.That(logEvent.IssuedBy, Is.EqualTo(typeof(LogTest)));
            Assert.That(logEvent.Timestamp, Is.EqualTo(DateTimeOffset.Now).Within(100).Milliseconds);
        }

        [TestCase(LogEventLevel.Trace)]
        [TestCase(LogEventLevel.Debug)]
        [TestCase(LogEventLevel.Info)]
        [TestCase(LogEventLevel.Warn)]
        [TestCase(LogEventLevel.Error)]
        public void LoggerShouldEmitEventWithProperLevel(LogEventLevel level)
        {
            Log.SetLevel(level).Handlers.Add(testLogHandler);

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
            Log.SetLevel(LogEventLevel.Info).Handlers.Add(testLogHandler);

            logger.Trace("test message");

            Assert.That(testLogHandler.Events, Has.Count.EqualTo(0));
        }

        [Test]
        public void ShouldGetProperLogger()
        {
            Log.SetLevel(LogEventLevel.Info);

            var logger = Log.GetLogger<LogTest>();

            Assert.That(logger.Issuer, Is.EqualTo(typeof(LogTest)));
            Assert.That(logger.Level, Is.EqualTo(LogEventLevel.Info));
        }

        [Test]
        public void ShouldCacheLogger()
        {
            var logger1 = Log.GetLogger<LogTest>();
            var logger2 = Log.GetLogger<LogTest>();

            Assert.That(logger1, Is.SameAs(logger2));
        }

        [Test]
        public void ShouldCreateContext()
        {
            Log.SetLevel(LogEventLevel.Info);

            using var context = Log.CreateContext();

            var logger = context.GetLogger<LogTest>();

            Assert.That(logger.Level, Is.EqualTo(LogEventLevel.Info));
        }

        [Test]
        public void ShouldCreateContextWithCustomLevel()
        {
            Log.SetLevel(LogEventLevel.Info);

            using var context = Log.CreateContext(LogEventLevel.Warn);

            var logger = context.GetLogger<LogTest>();

            Assert.That(logger.Level, Is.EqualTo(LogEventLevel.Warn));
        }

        [Test]
        public void ShouldCreateContextWithNullLogHandlers()
        {
            var context = new LogContext(LogEventLevel.Info, null, null, handlers: null);

            Assert.That(context.Handlers, Is.Empty);
        }

        [Test]
        public void ContextShouldChangeLevel()
        {
            Log.SetLevel(LogEventLevel.Info);

            using var context = Log.CreateContext();

            context.SetLevel(LogEventLevel.Warn);

            var logger = context.GetLogger<LogTest>();

            Assert.That(logger.Level, Is.EqualTo(LogEventLevel.Warn));
        }

        [Test]
        public void ShouldCreateContextWithCustomHandler()
        {
            Log.SetLevel(LogEventLevel.Info);

            using var context = Log.CreateContext().Handlers.Add(testLogHandler);

            var logger = context.GetLogger<LogTest>();

            logger.Info("test message");

            Assert.That(testLogHandler.Events, Has.Count.EqualTo(1));
        }

        [Test]
        public void ShouldCreateSubContext()
        {
            Log.SetLevel(LogEventLevel.Info);

            using var context = Log.CreateContext();

            Assert.That(Log.CurrentContext, Is.SameAs(context));

            using var subContext = context.CreateContext();

            Assert.That(Log.CurrentContext, Is.SameAs(subContext));

            var logger = subContext.GetLogger<LogTest>();

            Assert.That(logger.Level, Is.EqualTo(LogEventLevel.Info));
        }

        [Test]
        public void ShouldCreateSubContextFromCurrentContext()
        {
            Log.SetLevel(LogEventLevel.Info);

            using var context = Log.CreateContext();

            Assert.That(Log.CurrentContext, Is.SameAs(context));

            using var subContext = Log.CreateContext();

            Assert.That(Log.CurrentContext, Is.SameAs(subContext));

            var logger = subContext.GetLogger<LogTest>();

            Assert.That(logger.Level, Is.EqualTo(LogEventLevel.Info));
        }

        [Test]
        public void ShouldCapturePreviousContextWhenCurrentFinishes()
        {
            using var globalContext = Log.CurrentContext;

            using (var subContext = Log.CreateContext())
            {
                Assert.That(Log.CurrentContext, Is.SameAs(subContext));
            }

            Assert.That(Log.CurrentContext, Is.SameAs(globalContext));
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
