// <copyright file="RemoteWebDriver.cs" company="WebDriver Committers">
// Licensed to the Software Freedom Conservancy (SFC) under one
// or more contributor license agreements. See the NOTICE file
// distributed with this work for additional information
// regarding copyright ownership. The SFC licenses this file
// to you under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
// </copyright>

using OpenQA.Selenium.DevTools;
using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.IO;
using System.IO.Compression;
using System.Linq;
using System.Threading.Tasks;

namespace OpenQA.Selenium.Remote
{
    /// <summary>
    /// Provides a way to use the driver through
    /// </summary>
    /// /// <example>
    /// <code>
    /// [TestFixture]
    /// public class Testing
    /// {
    ///     private IWebDriver driver;
    ///     <para></para>
    ///     [SetUp]
    ///     public void SetUp()
    ///     {
    ///         driver = new RemoteWebDriver(new Uri("http://127.0.0.1:4444/wd/hub"),new FirefoxOptions());
    ///     }
    ///     <para></para>
    ///     [Test]
    ///     public void TestGoogle()
    ///     {
    ///         driver.Navigate().GoToUrl("http://www.google.co.uk");
    ///         /*
    ///         *   Rest of the test
    ///         */
    ///     }
    ///     <para></para>
    ///     [TearDown]
    ///     public void TearDown()
    ///     {
    ///         driver.Quit();
    ///     }
    /// }
    /// </code>
    /// </example>
    public class RemoteWebDriver : WebDriver, IDevTools, IHasDownloads
    {
        /// <summary>
        /// The name of the Selenium grid remote DevTools end point capability.
        /// </summary>
        public readonly string RemoteDevToolsEndPointCapabilityName = "se:cdp";

        /// <summary>
        /// The name of the Selenium remote DevTools version capability.
        /// </summary>
        public readonly string RemoteDevToolsVersionCapabilityName = "se:cdpVersion";

        private const string DefaultRemoteServerUrl = "http://127.0.0.1:4444/wd/hub";

        private DevToolsSession devToolsSession;

        /// <summary>
        /// Initializes a new instance of the <see cref="RemoteWebDriver"/> class. This constructor defaults proxy to http://127.0.0.1:4444/wd/hub
        /// </summary>
        /// <param name="options">An <see cref="DriverOptions"/> object containing the desired capabilities of the browser.</param>
        public RemoteWebDriver(DriverOptions options)
            : this(ConvertOptionsToCapabilities(options))
        {
        }

        /// <summary>
        /// Initializes a new instance of the <see cref="RemoteWebDriver"/> class. This constructor defaults proxy to http://127.0.0.1:4444/wd/hub
        /// </summary>
        /// <param name="capabilities">An <see cref="ICapabilities"/> object containing the desired capabilities of the browser.</param>
        public RemoteWebDriver(ICapabilities capabilities)
            : this(new Uri(DefaultRemoteServerUrl), capabilities)
        {
        }

        /// <summary>
        /// Initializes a new instance of the <see cref="RemoteWebDriver"/> class. This constructor defaults proxy to http://127.0.0.1:4444/wd/hub
        /// </summary>
        /// <param name="remoteAddress">URI containing the address of the WebDriver remote server (e.g. http://127.0.0.1:4444/wd/hub).</param>
        /// <param name="options">An <see cref="DriverOptions"/> object containing the desired capabilities of the browser.</param>
        public RemoteWebDriver(Uri remoteAddress, DriverOptions options)
            : this(remoteAddress, ConvertOptionsToCapabilities(options))
        {
        }

        /// <summary>
        /// Initializes a new instance of the <see cref="RemoteWebDriver"/> class
        /// </summary>
        /// <param name="remoteAddress">URI containing the address of the WebDriver remote server (e.g. http://127.0.0.1:4444/wd/hub).</param>
        /// <param name="capabilities">An <see cref="ICapabilities"/> object containing the desired capabilities of the browser.</param>
        public RemoteWebDriver(Uri remoteAddress, ICapabilities capabilities)
            : this(remoteAddress, capabilities, RemoteWebDriver.DefaultCommandTimeout)
        {
        }

        /// <summary>
        /// Initializes a new instance of the <see cref="RemoteWebDriver"/> class using the specified remote address, desired capabilities, and command timeout.
        /// </summary>
        /// <param name="remoteAddress">URI containing the address of the WebDriver remote server (e.g. http://127.0.0.1:4444/wd/hub).</param>
        /// <param name="capabilities">An <see cref="ICapabilities"/> object containing the desired capabilities of the browser.</param>
        /// <param name="commandTimeout">The maximum amount of time to wait for each command.</param>
        public RemoteWebDriver(Uri remoteAddress, ICapabilities capabilities, TimeSpan commandTimeout)
            : this(new HttpCommandExecutor(remoteAddress, commandTimeout), capabilities)
        {
        }

        /// <summary>
        /// Initializes a new instance of the <see cref="RemoteWebDriver"/> class
        /// </summary>
        /// <param name="commandExecutor">An <see cref="ICommandExecutor"/> object which executes commands for the driver.</param>
        /// <param name="capabilities">An <see cref="ICapabilities"/> object containing the desired capabilities of the browser.</param>
        public RemoteWebDriver(ICommandExecutor commandExecutor, ICapabilities capabilities)
            : base(commandExecutor, capabilities)
        {
        }

        /// <summary>
        /// Gets a value indicating whether a DevTools session is active.
        /// </summary>
        public bool HasActiveDevToolsSession
        {
            get { return this.devToolsSession != null; }
        }

        /// <summary>
        /// Finds the first element in the page that matches the ID supplied
        /// </summary>
        /// <param name="id">ID of the element</param>
        /// <returns>IWebElement object so that you can interact with that object</returns>
        /// <example>
        /// <code>
        /// IWebDriver driver = new RemoteWebDriver(new FirefoxOptions());
        /// IWebElement elem = driver.FindElementById("id")
        /// </code>
        /// </example>
        public IWebElement FindElementById(string id)
        {
            return this.FindElement("css selector", "#" + By.EscapeCssSelector(id));
        }

        /// <summary>
        /// Finds the first element in the page that matches the ID supplied
        /// </summary>
        /// <param name="id">ID of the Element</param>
        /// <returns>ReadOnlyCollection of Elements that match the object so that you can interact that object</returns>
        /// <example>
        /// <code>
        /// IWebDriver driver = new RemoteWebDriver(new FirefoxOptions());
        /// ReadOnlyCollection<![CDATA[<IWebElement>]]> elem = driver.FindElementsById("id")
        /// </code>
        /// </example>
        public ReadOnlyCollection<IWebElement> FindElementsById(string id)
        {
            string selector = By.EscapeCssSelector(id);
            if (string.IsNullOrEmpty(selector))
            {
                // Finding multiple elements with an empty ID will return
                // an empty list. However, finding by a CSS selector of '#'
                // throws an exception, even in the multiple elements case,
                // which means we need to short-circuit that behavior.
                return new List<IWebElement>().AsReadOnly();
            }

            return this.FindElements("css selector", "#" + selector);
        }

        /// <summary>
        /// Finds the first element in the page that matches the CSS Class supplied
        /// </summary>
        /// <param name="className">className of the</param>
        /// <returns>IWebElement object so that you can interact that object</returns>
        /// <example>
        /// <code>
        /// IWebDriver driver = new RemoteWebDriver(new FirefoxOptions());
        /// IWebElement elem = driver.FindElementByClassName("classname")
        /// </code>
        /// </example>
        public IWebElement FindElementByClassName(string className)
        {
            string selector = By.EscapeCssSelector(className);
            if (selector.Contains(" "))
            {
                // Finding elements by class name with whitespace is not allowed.
                // However, converting the single class name to a valid CSS selector
                // by prepending a '.' may result in a still-valid, but incorrect
                // selector. Thus, we short-ciruit that behavior here.
                throw new InvalidSelectorException("Compound class names not allowed. Cannot have whitespace in class name. Use CSS selectors instead.");
            }

            return this.FindElement("css selector", "." + selector);
        }

        /// <summary>
        /// Finds a list of elements that match the class name supplied
        /// </summary>
        /// <param name="className">CSS class Name on the element</param>
        /// <returns>ReadOnlyCollection of IWebElement object so that you can interact with those objects</returns>
        /// <example>
        /// <code>
        /// IWebDriver driver = new RemoteWebDriver(new FirefoxOptions());
        /// ReadOnlyCollection<![CDATA[<IWebElement>]]> elem = driver.FindElementsByClassName("classname")
        /// </code>
        /// </example>
        public ReadOnlyCollection<IWebElement> FindElementsByClassName(string className)
        {
            string selector = By.EscapeCssSelector(className);
            if (selector.Contains(" "))
            {
                // Finding elements by class name with whitespace is not allowed.
                // However, converting the single class name to a valid CSS selector
                // by prepending a '.' may result in a still-valid, but incorrect
                // selector. Thus, we short-ciruit that behavior here.
                throw new InvalidSelectorException("Compound class names not allowed. Cannot have whitespace in class name. Use CSS selectors instead.");
            }

            return this.FindElements("css selector", "." + selector);
        }

        /// <summary>
        /// Finds the first of elements that match the link text supplied
        /// </summary>
        /// <param name="linkText">Link text of element </param>
        /// <returns>IWebElement object so that you can interact that object</returns>
        /// <example>
        /// <code>
        /// IWebDriver driver = new RemoteWebDriver(new FirefoxOptions());
        /// IWebElement elem = driver.FindElementsByLinkText("linktext")
        /// </code>
        /// </example>
        public IWebElement FindElementByLinkText(string linkText)
        {
            return this.FindElement("link text", linkText);
        }

        /// <summary>
        /// Finds a list of elements that match the link text supplied
        /// </summary>
        /// <param name="linkText">Link text of element</param>
        /// <returns>ReadOnlyCollection<![CDATA[<IWebElement>]]> object so that you can interact with those objects</returns>
        /// <example>
        /// <code>
        /// IWebDriver driver = new RemoteWebDriver(new FirefoxOptions());
        /// ReadOnlyCollection<![CDATA[<IWebElement>]]> elem = driver.FindElementsByClassName("classname")
        /// </code>
        /// </example>
        public ReadOnlyCollection<IWebElement> FindElementsByLinkText(string linkText)
        {
            return this.FindElements("link text", linkText);
        }

        /// <summary>
        /// Finds the first of elements that match the part of the link text supplied
        /// </summary>
        /// <param name="partialLinkText">part of the link text</param>
        /// <returns>IWebElement object so that you can interact that object</returns>
        /// <example>
        /// <code>
        /// IWebDriver driver = new RemoteWebDriver(new FirefoxOptions());
        /// IWebElement elem = driver.FindElementsByPartialLinkText("partOfLink")
        /// </code>
        /// </example>
        public IWebElement FindElementByPartialLinkText(string partialLinkText)
        {
            return this.FindElement("partial link text", partialLinkText);
        }

        /// <summary>
        /// Finds a list of elements that match the class name supplied
        /// </summary>
        /// <param name="partialLinkText">part of the link text</param>
        /// <returns>ReadOnlyCollection<![CDATA[<IWebElement>]]> objects so that you can interact that object</returns>
        /// <example>
        /// <code>
        /// IWebDriver driver = new RemoteWebDriver(new FirefoxOptions());
        /// ReadOnlyCollection<![CDATA[<IWebElement>]]> elem = driver.FindElementsByPartialLinkText("partOfTheLink")
        /// </code>
        /// </example>
        public ReadOnlyCollection<IWebElement> FindElementsByPartialLinkText(string partialLinkText)
        {
            return this.FindElements("partial link text", partialLinkText);
        }

        /// <summary>
        /// Finds the first of elements that match the name supplied
        /// </summary>
        /// <param name="name">Name of the element on the page</param>
        /// <returns>IWebElement object so that you can interact that object</returns>
        /// <example>
        /// <code>
        /// IWebDriver driver = new RemoteWebDriver(new FirefoxOptions());
        /// elem = driver.FindElementsByName("name")
        /// </code>
        /// </example>
        public IWebElement FindElementByName(string name)
        {
            return this.FindElement("css selector", "*[name=\"" + name + "\"]");
        }

        /// <summary>
        /// Finds a list of elements that match the name supplied
        /// </summary>
        /// <param name="name">Name of element</param>
        /// <returns>ReadOnlyCollect of IWebElement objects so that you can interact that object</returns>
        /// <example>
        /// <code>
        /// IWebDriver driver = new RemoteWebDriver(new FirefoxOptions());
        /// ReadOnlyCollection<![CDATA[<IWebElement>]]> elem = driver.FindElementsByName("name")
        /// </code>
        /// </example>
        public ReadOnlyCollection<IWebElement> FindElementsByName(string name)
        {
            return this.FindElements("css selector", "*[name=\"" + name + "\"]");
        }

        /// <summary>
        /// Finds the first of elements that match the DOM Tag supplied
        /// </summary>
        /// <param name="tagName">DOM tag Name of the element being searched</param>
        /// <returns>IWebElement object so that you can interact that object</returns>
        /// <example>
        /// <code>
        /// IWebDriver driver = new RemoteWebDriver(new FirefoxOptions());
        /// IWebElement elem = driver.FindElementsByTagName("tag")
        /// </code>
        /// </example>
        public IWebElement FindElementByTagName(string tagName)
        {
            return this.FindElement("css selector", tagName);
        }

        /// <summary>
        /// Finds a list of elements that match the DOM Tag supplied
        /// </summary>
        /// <param name="tagName">DOM tag Name of element being searched</param>
        /// <returns>IWebElement object so that you can interact that object</returns>
        /// <example>
        /// <code>
        /// IWebDriver driver = new RemoteWebDriver(new FirefoxOptions());
        /// ReadOnlyCollection<![CDATA[<IWebElement>]]> elem = driver.FindElementsByTagName("tag")
        /// </code>
        /// </example>
        public ReadOnlyCollection<IWebElement> FindElementsByTagName(string tagName)
        {
            return this.FindElements("css selector", tagName);
        }

        /// <summary>
        /// Finds the first of elements that match the XPath supplied
        /// </summary>
        /// <param name="xpath">xpath to the element</param>
        /// <returns>IWebElement object so that you can interact that object</returns>
        /// <example>
        /// <code>
        /// IWebDriver driver = new RemoteWebDriver(new FirefoxOptions());
        /// IWebElement elem = driver.FindElementsByXPath("//table/tbody/tr/td/a");
        /// </code>
        /// </example>
        public IWebElement FindElementByXPath(string xpath)
        {
            return this.FindElement("xpath", xpath);
        }

        /// <summary>
        /// Finds a list of elements that match the XPath supplied
        /// </summary>
        /// <param name="xpath">xpath to the element</param>
        /// <returns>ReadOnlyCollection of IWebElement objects so that you can interact that object</returns>
        /// <example>
        /// <code>
        /// IWebDriver driver = new RemoteWebDriver(new FirefoxOptions());
        /// ReadOnlyCollection<![CDATA[<IWebElement>]]> elem = driver.FindElementsByXpath("//tr/td/a")
        /// </code>
        /// </example>
        public ReadOnlyCollection<IWebElement> FindElementsByXPath(string xpath)
        {
            return this.FindElements("xpath", xpath);
        }

        /// <summary>
        /// Finds the first element matching the specified CSS selector.
        /// </summary>
        /// <param name="cssSelector">The CSS selector to match.</param>
        /// <returns>The first <see cref="IWebElement"/> matching the criteria.</returns>
        public IWebElement FindElementByCssSelector(string cssSelector)
        {
            return this.FindElement("css selector", cssSelector);
        }

        /// <summary>
        /// Finds all elements matching the specified CSS selector.
        /// </summary>
        /// <param name="cssSelector">The CSS selector to match.</param>
        /// <returns>A <see cref="ReadOnlyCollection{T}"/> containing all
        /// <see cref="IWebElement">IWebElements</see> matching the criteria.</returns>
        public ReadOnlyCollection<IWebElement> FindElementsByCssSelector(string cssSelector)
        {
            return this.FindElements("css selector", cssSelector);
        }

        /// <summary>
        /// Creates a session to communicate with a browser using a Developer Tools debugging protocol.
        /// </summary>
        /// <returns>The active session to use to communicate with the Developer Tools debugging protocol.</returns>
        public DevToolsSession GetDevToolsSession()
        {
            return GetDevToolsSession(new DevToolsOptions() { ProtocolVersion = DevToolsSession.AutoDetectDevToolsProtocolVersion });
        }

        /// <summary>
        /// Creates a session to communicate with a browser using a Developer Tools debugging protocol.
        /// </summary>
        /// <returns>The active session to use to communicate with the Developer Tools debugging protocol.</returns>
        public DevToolsSession GetDevToolsSession(DevToolsOptions options)
        {
            if (options is null)
            {
                throw new ArgumentNullException(nameof(options));
            }

            if (this.devToolsSession == null)
            {
                if (!this.Capabilities.HasCapability(RemoteDevToolsEndPointCapabilityName))
                {
                    throw new WebDriverException("Cannot find " + RemoteDevToolsEndPointCapabilityName + " capability for driver");
                }

                string debuggerAddress = this.Capabilities.GetCapability(RemoteDevToolsEndPointCapabilityName).ToString();

                if (!options.ProtocolVersion.HasValue || options.ProtocolVersion == DevToolsSession.AutoDetectDevToolsProtocolVersion)
                {
                    if (!this.Capabilities.HasCapability(RemoteDevToolsVersionCapabilityName))
                    {
                        throw new WebDriverException("Cannot find " + RemoteDevToolsVersionCapabilityName + " capability for driver");
                    }

                    string version = this.Capabilities.GetCapability(RemoteDevToolsVersionCapabilityName).ToString();

                    bool versionParsed = int.TryParse(version.Substring(0, version.IndexOf(".")), out int devToolsProtocolVersion);
                    if (!versionParsed)
                    {
                        throw new WebDriverException("Cannot parse protocol version from reported version string: " + version);
                    }

                    options.ProtocolVersion = devToolsProtocolVersion;
                }

                try
                {
                    DevToolsSession session = new DevToolsSession(debuggerAddress, options);
                    Task.Run(async () => await session.StartSession()).GetAwaiter().GetResult();
                    this.devToolsSession = session;
                }
                catch (Exception e)
                {
                    throw new WebDriverException("Unexpected error creating WebSocket DevTools session.", e);
                }
            }

            return this.devToolsSession;
        }

        /// <summary>
        /// Creates a session to communicate with a browser using a specific version of the Developer Tools debugging protocol.
        /// </summary>
        /// <param name="protocolVersion">The specific version of the Developer Tools debugging protocol to use.</param>
        /// <returns>The active session to use to communicate with the Developer Tools debugging protocol.</returns>
        [Obsolete("Use GetDevToolsSession(DevToolsOptions options)")]
        public DevToolsSession GetDevToolsSession(int protocolVersion)
        {
            return GetDevToolsSession(new DevToolsOptions() { ProtocolVersion = protocolVersion });
        }

        /// <summary>
        /// Retrieves the downloadable files.
        /// </summary>
        /// <returns>A read-only list of file names available for download.</returns>
        public IReadOnlyList<string> GetDownloadableFiles()
        {
            var enableDownloads = this.Capabilities.GetCapability(CapabilityType.EnableDownloads);
            if (enableDownloads == null || !(bool)enableDownloads)
            {
                throw new WebDriverException("You must enable downloads in order to work with downloadable files.");
            }

            Response commandResponse = this.Execute(DriverCommand.GetDownloadableFiles, null);
            Dictionary<string, object> value = (Dictionary<string, object>)commandResponse.Value;
            object[] namesArray = (object[])value["names"];
            return namesArray.Select(obj => obj.ToString()).ToList();
        }

        /// <summary>
        /// Downloads a file with the specified file name.
        /// </summary>
        /// <param name="fileName">The name of the file to be downloaded.</param>
        /// <param name="targetDirectory">The target directory where the file should be downloaded to.</param>
        public void DownloadFile(string fileName, string targetDirectory)
        {
            var enableDownloads = this.Capabilities.GetCapability(CapabilityType.EnableDownloads);
            if (enableDownloads == null || !(bool)enableDownloads)
            {
                throw new WebDriverException("You must enable downloads in order to work with downloadable files.");
            }

            Dictionary<string, object> parameters = new Dictionary<string, object>
            {
                { "name", fileName }
            };

            Response commandResponse = this.Execute(DriverCommand.DownloadFile, parameters);
            string contents = ((Dictionary<string, object>)commandResponse.Value)["contents"].ToString();
            byte[] fileData = Convert.FromBase64String(contents);

            Directory.CreateDirectory(targetDirectory);

            using (var memoryReader = new MemoryStream(fileData))
            {
                using (var zipArchive = new ZipArchive(memoryReader, ZipArchiveMode.Read))
                {
                    foreach (ZipArchiveEntry entry in zipArchive.Entries)
                    {
                        string destinationPath = Path.Combine(targetDirectory, entry.FullName);

                        entry.ExtractToFile(destinationPath);
                    }
                }
            }
        }

        /// <summary>
        /// Deletes all downloadable files.
        /// </summary>
        public void DeleteDownloadableFiles()
        {
            var enableDownloads = this.Capabilities.GetCapability(CapabilityType.EnableDownloads);
            if (enableDownloads == null || !(bool)enableDownloads)
            {
                throw new WebDriverException("You must enable downloads in order to work with downloadable files.");
            }

            this.Execute(DriverCommand.DeleteDownloadableFiles, null);
        }

        /// <summary>
        /// Closes a DevTools session.
        /// </summary>
        public void CloseDevToolsSession()
        {
            if (this.devToolsSession != null)
            {
                Task.Run(async () => await this.devToolsSession.StopSession(true)).GetAwaiter().GetResult();
            }
        }

        /// <summary>
        /// Releases all resources associated with this <see cref="RemoteWebDriver"/>.
        /// </summary>
        /// <param name="disposing"><see langword="true"/> if the Dispose method was explicitly called; otherwise, <see langword="false"/>.</param>
        protected override void Dispose(bool disposing)
        {
            if (disposing)
            {
                if (this.devToolsSession != null)
                {
                    this.devToolsSession.Dispose();
                    this.devToolsSession = null;
                }
            }

            base.Dispose(disposing);
        }

        private static ICapabilities ConvertOptionsToCapabilities(DriverOptions options)
        {
            if (options == null)
            {
                throw new ArgumentNullException(nameof(options), "Driver options must not be null");
            }

            return options.ToCapabilities();
        }
    }
}
