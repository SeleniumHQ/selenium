using System.Collections.Generic;
using System.Threading.Tasks;
using NUnit.Framework;
using OpenQA.Selenium.Environment;
using WebDriverBiDi.Log;

namespace OpenQA.Selenium
{
    [TestFixture]
    public class LogsTest : DriverTestFixture
    {
        [TearDown]
        public void TearDownMethod()
        {
            driver.Script().StopMonitoringLogEntries();
        }

        [Test]
        public async Task CanListenToConsoleLog()
        {
            EntryAddedEventArgs eventArgs = null;
            driver.Script().ConsoleMessageHandler += (sender, args) => { eventArgs = args; };
            driver.Url = EnvironmentManager.Instance.UrlBuilder.WhereIs("bidi/logEntryAdded.html");

            await driver.Script().StartMonitoringLogEntries();
            driver.FindElement(By.Id("consoleLog")).Click();

            WaitFor(() => eventArgs != null, "Log messages are empty'");

            Assert.That(eventArgs.Text, Is.EqualTo("Hello, world!"));
            Assert.That(eventArgs.Type, Is.EqualTo("console"));
            Assert.That(eventArgs.Arguments.Count, Is.EqualTo(1));
            Assert.That(eventArgs.Arguments[0].Type, Is.EqualTo("string"));
            Assert.That(eventArgs.Method, Is.EqualTo("log"));
            Assert.That(eventArgs.Level, Is.EqualTo(WebDriverBiDi.Log.LogLevel.Info));
        }

        [Test]
        public async Task CanFilterConsoleLogs()
        {
            EntryAddedEventArgs eventArgs = null;
            driver.Script().ConsoleMessageHandler += (sender, args) =>
            {
                if (args.Level == WebDriverBiDi.Log.LogLevel.Error)
                {
                    eventArgs = args;
                }
            };
            driver.Url = EnvironmentManager.Instance.UrlBuilder.WhereIs("bidi/logEntryAdded.html");

            await driver.Script().StartMonitoringLogEntries();
            driver.FindElement(By.Id("consoleLog")).Click();
            driver.FindElement(By.Id("consoleError")).Click();

            WaitFor(() => eventArgs != null, "Log messages are empty'");

            Assert.That(eventArgs.Text, Is.EqualTo("I am console error"));
            Assert.That(eventArgs.Type, Is.EqualTo("console"));
            Assert.That(eventArgs.Arguments.Count, Is.EqualTo(1));
            Assert.That(eventArgs.Arguments[0].Type, Is.EqualTo("string"));
            Assert.That(eventArgs.Method, Is.EqualTo("error"));
            Assert.That(eventArgs.Level, Is.EqualTo(WebDriverBiDi.Log.LogLevel.Error));
        }

        [Test]
        public async Task CanListenToJavaScriptLog()
        {
            EntryAddedEventArgs eventArgs = null;
            driver.Script().JavaScriptErrorHandler += (sender, args) =>
            {
                eventArgs = args;
            };
            driver.Url = EnvironmentManager.Instance.UrlBuilder.WhereIs("bidi/logEntryAdded.html");

            await driver.Script().StartMonitoringLogEntries();
            driver.FindElement(By.Id("jsException")).Click();

            WaitFor(() => eventArgs != null, "Log messages are empty'");

            Assert.That(eventArgs.Text, Is.EqualTo("Error: Not working"));
            Assert.That(eventArgs.Type, Is.EqualTo("javascript"));
            Assert.That(eventArgs.Level, Is.EqualTo(WebDriverBiDi.Log.LogLevel.Error));
        }

        [Test]
        public async Task CanRetrieveStacktraceForALog()
        {
            EntryAddedEventArgs eventArgs = null;
            driver.Script().JavaScriptErrorHandler += (sender, args) =>
            {
                eventArgs = args;
            };
            driver.Url = EnvironmentManager.Instance.UrlBuilder.WhereIs("bidi/logEntryAdded.html");

            await driver.Script().StartMonitoringLogEntries();
            driver.FindElement(By.Id("logWithStacktrace")).Click();

            WaitFor(() => eventArgs != null, "Log messages are empty'");

            Assert.That(eventArgs.Text, Is.EqualTo("Error: Not working"));
            Assert.That(eventArgs.Type, Is.EqualTo("javascript"));
            Assert.That(eventArgs.Level, Is.EqualTo(WebDriverBiDi.Log.LogLevel.Error));
            Assert.That(eventArgs.StackTrace.CallFrames.Count, Is.GreaterThanOrEqualTo(3));
        }

        [Test]
        public async Task CanListenToLogsWithMultipleConsumers()
        {
            List<EntryAddedEventArgs> eventArgs = new List<EntryAddedEventArgs>();
            driver.Script().ConsoleMessageHandler += (sender, args) =>
            {
                eventArgs.Add(args);
            };

            driver.Script().ConsoleMessageHandler += (sender, args) =>
            {
                eventArgs.Add(args);
            };

            driver.Script().JavaScriptErrorHandler += (sender, args) =>
            {
                eventArgs.Add(args);
            };

            driver.Url = EnvironmentManager.Instance.UrlBuilder.WhereIs("bidi/logEntryAdded.html");

            await driver.Script().StartMonitoringLogEntries();
            driver.FindElement(By.Id("consoleLog")).Click();
            driver.FindElement(By.Id("jsException")).Click();

            WaitFor(() => eventArgs.Count == 3, "Log messages are empty'");

            EntryAddedEventArgs event1 = eventArgs[0];
            EntryAddedEventArgs event2 = eventArgs[1];

            Assert.That(event1.Text, Is.EqualTo("Hello, world!"));
            Assert.That(event1.Type, Is.EqualTo("console"));
            Assert.That(event1.Method, Is.EqualTo("log"));
            Assert.That(event1.Level, Is.EqualTo(WebDriverBiDi.Log.LogLevel.Info));
            Assert.That(event2.Text, Is.EqualTo("Hello, world!"));
            Assert.That(event2.Type, Is.EqualTo("console"));
            Assert.That(event2.Method, Is.EqualTo("log"));
            Assert.That(event2.Level, Is.EqualTo(WebDriverBiDi.Log.LogLevel.Info));
        }
    }
}
