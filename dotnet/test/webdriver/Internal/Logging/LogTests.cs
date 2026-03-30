// <copyright file="LogTests.cs" company="Selenium Committers">
// Licensed to the Software Freedom Conservancy (SFC) under one
// or more contributor license agreements.  See the NOTICE file
// distributed with this work for additional information
// regarding copyright ownership.  The SFC licenses this file
// to you under the Apache License, Version 2.0 (the
// "License"); you may not use this file except in compliance
// with the License.  You may obtain a copy of the License at
//
//   http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing,
// software distributed under the License is distributed on an
// "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
// KIND, either express or implied.  See the License for the
// specific language governing permissions and limitations
// under the License.
// </copyright>

using OpenQA.Selenium.Internal.Logging;

namespace OpenQA.Selenium.Tests.Internal.Logging;

public class LogTests
{
    private TestLogHandler testLogHandler;
    private ILogger logger;

    private void ResetGlobalLog()
    {
        Log.SetLevel(LogEventLevel.Info);
        Log.Handlers.Clear().Handlers.Add(new TextWriterHandler(Console.Error));
    }

    [SetUp]
    public void SetUp()
    {
        ResetGlobalLog();

        testLogHandler = new TestLogHandler();
        logger = Log.GetLogger<LogTests>();
    }

    [TearDown]
    public void TearDown()
    {
        ResetGlobalLog();
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
        Assert.That(logEvent.IssuedBy, Is.EqualTo(typeof(LogTests)));
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

        var logger = Log.GetLogger<LogTests>();

        Assert.That(logger.Issuer, Is.EqualTo(typeof(LogTests)));
        Assert.That(logger.Level, Is.EqualTo(LogEventLevel.Info));
    }

    [Test]
    public void ShouldCacheLogger()
    {
        var logger1 = Log.GetLogger<LogTests>();
        var logger2 = Log.GetLogger<LogTests>();

        Assert.That(logger1, Is.SameAs(logger2));
    }

    [Test]
    public void ShouldCreateContext()
    {
        Log.SetLevel(LogEventLevel.Info);

        using var context = Log.CreateContext();

        var logger = context.GetLogger<LogTests>();

        Assert.That(logger.Level, Is.EqualTo(LogEventLevel.Info));
    }

    [Test]
    public void ShouldCreateContextWithCustomLevel()
    {
        Log.SetLevel(LogEventLevel.Info);

        using var context = Log.CreateContext(LogEventLevel.Warn);

        var logger = context.GetLogger<LogTests>();

        Assert.That(logger.Level, Is.EqualTo(LogEventLevel.Warn));
    }

    [Test]
    public void ShouldCreateContextWithNullLogHandlers()
    {
        var context = new LogContext(LogEventLevel.Info, null, null, null, handlers: null);

        Assert.That(context.Handlers, Is.Empty);
    }

    [Test]
    public void ContextShouldChangeLevel()
    {
        Log.SetLevel(LogEventLevel.Info);

        using var context = Log.CreateContext();

        context.SetLevel(LogEventLevel.Warn);

        var logger = context.GetLogger<LogTests>();

        Assert.That(logger.Level, Is.EqualTo(LogEventLevel.Warn));
    }

    [Test]
    public void ContextShouldEmitMessages()
    {
        using var context = Log.CreateContext(LogEventLevel.Trace).Handlers.Add(testLogHandler);

        logger.Trace("test message");

        Assert.That(testLogHandler.Events.Count, Is.EqualTo(1));
    }

    [Test]
    public void ShouldCreateContextWithCustomHandler()
    {
        Log.SetLevel(LogEventLevel.Info);

        using var context = Log.CreateContext().Handlers.Add(testLogHandler);

        var logger = context.GetLogger<LogTests>();

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

        var logger = subContext.GetLogger<LogTests>();

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

        var logger = subContext.GetLogger<LogTests>();

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

    [Test]
    public void ShouldThrowIfTruncationLengthIsNegative()
    {
        Assert.Throws<ArgumentOutOfRangeException>(() =>
            Log.CreateContext().WithTruncation(-1)
        );
    }

    [Test]
    public void ShouldTruncateLongMessage()
    {
        var longMessage = new string('a', 150);
        var expectedMessage = new string('a', 37) + "...[truncated 50 chars]..." + new string('a', 37);

        using var context = Log.CreateContext().WithTruncation(100).Handlers.Add(testLogHandler);

        logger.Info(longMessage);

        Assert.That(testLogHandler.Events, Has.Count.EqualTo(1));
        Assert.That(testLogHandler.Events[0].Message, Is.EqualTo(expectedMessage));
    }

    [Test]
    public void ShouldNotTruncateShortMessage()
    {
        var shortMessage = new string('a', 50);

        using var context = Log.CreateContext().WithTruncation(100).Handlers.Add(testLogHandler);

        logger.Info(shortMessage);

        Assert.That(testLogHandler.Events, Has.Count.EqualTo(1));
        Assert.That(testLogHandler.Events[0].Message, Is.EqualTo(shortMessage));
    }

    [Test]
    public void ShouldNotTruncateShortMessageIfMarkerIsLongerThanMaxLength()
    {
        var shortMessage = new string('a', 10);

        using var context = Log.CreateContext().WithTruncation(5).Handlers.Add(testLogHandler);

        logger.Info(shortMessage);

        Assert.That(testLogHandler.Events, Has.Count.EqualTo(1));
        Assert.That(testLogHandler.Events[0].Message, Is.EqualTo(shortMessage));
    }

    [Test]
    public void ShouldNotTruncateWhenDisabled()
    {
        var longMessage = new string('a', 5000);

        using var context = Log.CreateContext()
            .WithTruncation(length: null).Handlers.Add(testLogHandler);

        logger.Info(longMessage);

        Assert.That(testLogHandler.Events, Has.Count.EqualTo(1));
        Assert.That(testLogHandler.Events[0].Message, Is.EqualTo(longMessage));
    }
}

internal class TestLogHandler : ILogHandler
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
