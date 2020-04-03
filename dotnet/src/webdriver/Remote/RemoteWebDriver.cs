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

using System;
using System.Collections;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.Globalization;
using System.Text.RegularExpressions;
using OpenQA.Selenium.Html5;
using OpenQA.Selenium.Interactions;
using OpenQA.Selenium.Internal;

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
    ///         driver = new RemoteWebDriver(new Uri("http://127.0.0.1:4444/wd/hub"),DesiredCapabilities.InternetExplorer());
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
    public class RemoteWebDriver : IWebDriver, ISearchContext, IJavaScriptExecutor, IFindsById, IFindsByClassName, IFindsByLinkText, IFindsByName, IFindsByTagName, IFindsByXPath, IFindsByPartialLinkText, IFindsByCssSelector, IFindsElement, ITakesScreenshot, IHasCapabilities, IHasWebStorage, IHasLocationContext, IHasApplicationCache, IAllowsFileDetection, IHasSessionId, IActionExecutor
    {
        /// <summary>
        /// The default command timeout for HTTP requests in a RemoteWebDriver instance.
        /// </summary>
        protected static readonly TimeSpan DefaultCommandTimeout = TimeSpan.FromSeconds(60);

        private const string DefaultRemoteServerUrl = "http://127.0.0.1:4444/wd/hub";

        private ICommandExecutor executor;
        private ICapabilities capabilities;
        private SessionId sessionId;
        private IWebStorage storage;
        private IApplicationCache appCache;
        private ILocationContext locationContext;
        private IFileDetector fileDetector = new DefaultFileDetector();
        private RemoteWebElementFactory elementFactory;

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
        /// <param name="desiredCapabilities">An <see cref="ICapabilities"/> object containing the desired capabilities of the browser.</param>
        public RemoteWebDriver(ICapabilities desiredCapabilities)
            : this(new Uri(DefaultRemoteServerUrl), desiredCapabilities)
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
        /// <param name="desiredCapabilities">An <see cref="ICapabilities"/> object containing the desired capabilities of the browser.</param>
        public RemoteWebDriver(Uri remoteAddress, ICapabilities desiredCapabilities)
            : this(remoteAddress, desiredCapabilities, RemoteWebDriver.DefaultCommandTimeout)
        {
        }

        /// <summary>
        /// Initializes a new instance of the <see cref="RemoteWebDriver"/> class using the specified remote address, desired capabilities, and command timeout.
        /// </summary>
        /// <param name="remoteAddress">URI containing the address of the WebDriver remote server (e.g. http://127.0.0.1:4444/wd/hub).</param>
        /// <param name="desiredCapabilities">An <see cref="ICapabilities"/> object containing the desired capabilities of the browser.</param>
        /// <param name="commandTimeout">The maximum amount of time to wait for each command.</param>
        public RemoteWebDriver(Uri remoteAddress, ICapabilities desiredCapabilities, TimeSpan commandTimeout)
            : this(new HttpCommandExecutor(remoteAddress, commandTimeout), desiredCapabilities)
        {
        }

        /// <summary>
        /// Initializes a new instance of the <see cref="RemoteWebDriver"/> class
        /// </summary>
        /// <param name="commandExecutor">An <see cref="ICommandExecutor"/> object which executes commands for the driver.</param>
        /// <param name="desiredCapabilities">An <see cref="ICapabilities"/> object containing the desired capabilities of the browser.</param>
        public RemoteWebDriver(ICommandExecutor commandExecutor, ICapabilities desiredCapabilities)
        {
            this.executor = commandExecutor;
            this.StartClient();
            this.StartSession(desiredCapabilities);
            this.elementFactory = new RemoteWebElementFactory(this);

            if (this.capabilities.HasCapability(CapabilityType.SupportsApplicationCache))
            {
                object appCacheCapability = this.capabilities.GetCapability(CapabilityType.SupportsApplicationCache);
                if (appCacheCapability is bool && (bool)appCacheCapability)
                {
                    this.appCache = new RemoteApplicationCache(this);
                }
            }

            if (this.capabilities.HasCapability(CapabilityType.SupportsLocationContext))
            {
                object locationContextCapability = this.capabilities.GetCapability(CapabilityType.SupportsLocationContext);
                if (locationContextCapability is bool && (bool)locationContextCapability)
                {
                    this.locationContext = new RemoteLocationContext(this);
                }
            }

            if (this.capabilities.HasCapability(CapabilityType.SupportsWebStorage))
            {
                object webContextCapability = this.capabilities.GetCapability(CapabilityType.SupportsWebStorage);
                if (webContextCapability is bool && (bool)webContextCapability)
                {
                    this.storage = new RemoteWebStorage(this);
                }
            }

            if ((this as ISupportsLogs) != null)
            {
                // Only add the legacy log commands if the driver supports
                // retrieving the logs via the extension end points.
                this.CommandExecutor.CommandInfoRepository.TryAddCommand(DriverCommand.GetAvailableLogTypes, new CommandInfo(CommandInfo.GetCommand, "/session/{sessionId}/se/log/types"));
                this.CommandExecutor.CommandInfoRepository.TryAddCommand(DriverCommand.GetLog, new CommandInfo(CommandInfo.PostCommand, "/session/{sessionId}/se/log"));
            }

        }

        /// <summary>
        /// Gets or sets the URL the browser is currently displaying.
        /// </summary>
        /// <seealso cref="IWebDriver.Url"/>
        /// <seealso cref="INavigation.GoToUrl(string)"/>
        /// <seealso cref="INavigation.GoToUrl(System.Uri)"/>
        public string Url
        {
            get
            {
                Response commandResponse = this.Execute(DriverCommand.GetCurrentUrl, null);
                return commandResponse.Value.ToString();
            }

            set
            {
                if (value == null)
                {
                    throw new ArgumentNullException("value", "Argument 'url' cannot be null.");
                }

                Dictionary<string, object> parameters = new Dictionary<string, object>();
                parameters.Add("url", value);
                this.Execute(DriverCommand.Get, parameters);
            }
        }

        /// <summary>
        /// Gets the title of the current browser window.
        /// </summary>
        public string Title
        {
            get
            {
                Response commandResponse = this.Execute(DriverCommand.GetTitle, null);
                object returnedTitle = commandResponse != null ? commandResponse.Value : string.Empty;
                return returnedTitle.ToString();
            }
        }

        /// <summary>
        /// Gets the source of the page last loaded by the browser.
        /// </summary>
        public string PageSource
        {
            get
            {
                string pageSource = string.Empty;
                Response commandResponse = this.Execute(DriverCommand.GetPageSource, null);
                pageSource = commandResponse.Value.ToString();
                return pageSource;
            }
        }

        /// <summary>
        /// Gets the current window handle, which is an opaque handle to this
        /// window that uniquely identifies it within this driver instance.
        /// </summary>
        public string CurrentWindowHandle
        {
            get
            {
                Response commandResponse = this.Execute(DriverCommand.GetCurrentWindowHandle, null);
                return commandResponse.Value.ToString();
            }
        }

        /// <summary>
        /// Gets the window handles of open browser windows.
        /// </summary>
        public ReadOnlyCollection<string> WindowHandles
        {
            get
            {
                Response commandResponse = this.Execute(DriverCommand.GetWindowHandles, null);
                object[] handles = (object[])commandResponse.Value;
                List<string> handleList = new List<string>();
                foreach (object handle in handles)
                {
                    handleList.Add(handle.ToString());
                }

                return handleList.AsReadOnly();
            }
        }

        /// <summary>
        /// Gets a value indicating whether web storage is supported for this driver.
        /// </summary>
        public bool HasWebStorage
        {
            get { return this.storage != null; }
        }

        /// <summary>
        /// Gets an <see cref="IWebStorage"/> object for managing web storage.
        /// </summary>
        public IWebStorage WebStorage
        {
            get
            {
                if (this.storage == null)
                {
                    throw new InvalidOperationException("Driver does not support manipulating HTML5 web storage. Use the HasWebStorage property to test for the driver capability");
                }

                return this.storage;
            }
        }

        /// <summary>
        /// Gets a value indicating whether manipulating the application cache is supported for this driver.
        /// </summary>
        public bool HasApplicationCache
        {
            get { return this.appCache != null; }
        }

        /// <summary>
        /// Gets an <see cref="IApplicationCache"/> object for managing application cache.
        /// </summary>
        public IApplicationCache ApplicationCache
        {
            get
            {
                if (this.appCache == null)
                {
                    throw new InvalidOperationException("Driver does not support manipulating the HTML5 application cache. Use the HasApplicationCache property to test for the driver capability");
                }

                return this.appCache;
            }
        }

        /// <summary>
        /// Gets a value indicating whether manipulating geolocation is supported for this driver.
        /// </summary>
        public bool HasLocationContext
        {
            get { return this.locationContext != null; }
        }

        /// <summary>
        /// Gets an <see cref="ILocationContext"/> object for managing browser location.
        /// </summary>
        public ILocationContext LocationContext
        {
            get
            {
                if (this.locationContext == null)
                {
                    throw new InvalidOperationException("Driver does not support setting HTML5 geolocation information. Use the HasLocationContext property to test for the driver capability");
                }

                return this.locationContext;
            }
        }

        /// <summary>
        /// Gets the capabilities that the RemoteWebDriver instance is currently using
        /// </summary>
        public ICapabilities Capabilities
        {
            get { return this.capabilities; }
        }

        /// <summary>
        /// Gets or sets the <see cref="IFileDetector"/> responsible for detecting
        /// sequences of keystrokes representing file paths and names.
        /// </summary>
        public virtual IFileDetector FileDetector
        {
            get
            {
                return this.fileDetector;
            }

            set
            {
                if (value == null)
                {
                    throw new ArgumentNullException("value", "FileDetector cannot be null");
                }

                this.fileDetector = value;
            }
        }

        /// <summary>
        /// Gets the <see cref="SessionId"/> for the current session of this driver.
        /// </summary>
        public SessionId SessionId
        {
            get { return this.sessionId; }
        }

        /// <summary>
        /// Gets a value indicating whether this object is a valid action executor.
        /// </summary>
        public bool IsActionExecutor
        {
            get { return true; }
        }

        /// <summary>
        /// Gets the <see cref="ICommandExecutor"/> which executes commands for this driver.
        /// </summary>
        protected ICommandExecutor CommandExecutor
        {
            get { return this.executor; }
        }

        /// <summary>
        /// Gets or sets the factory object used to create instances of <see cref="RemoteWebElement"/>
        /// or its subclasses.
        /// </summary>
        protected RemoteWebElementFactory ElementFactory
        {
            get { return this.elementFactory; }
            set { this.elementFactory = value; }
        }

        /// <summary>
        /// Finds the first element in the page that matches the <see cref="By"/> object
        /// </summary>
        /// <param name="by">By mechanism to find the object</param>
        /// <returns>IWebElement object so that you can interact with that object</returns>
        /// <example>
        /// <code>
        /// IWebDriver driver = new InternetExplorerDriver();
        /// IWebElement elem = driver.FindElement(By.Name("q"));
        /// </code>
        /// </example>
        public IWebElement FindElement(By by)
        {
            if (by == null)
            {
                throw new ArgumentNullException("by", "by cannot be null");
            }

            return by.FindElement(this);
        }

        /// <summary>
        /// Finds the elements on the page by using the <see cref="By"/> object and returns a ReadOnlyCollection of the Elements on the page
        /// </summary>
        /// <param name="by">By mechanism to find the element</param>
        /// <returns>ReadOnlyCollection of IWebElement</returns>
        /// <example>
        /// <code>
        /// IWebDriver driver = new InternetExplorerDriver();
        /// ReadOnlyCollection<![CDATA[<IWebElement>]]> classList = driver.FindElements(By.ClassName("class"));
        /// </code>
        /// </example>
        public ReadOnlyCollection<IWebElement> FindElements(By by)
        {
            if (by == null)
            {
                throw new ArgumentNullException("by", "by cannot be null");
            }

            return by.FindElements(this);
        }

        /// <summary>
        /// Closes the Browser
        /// </summary>
        public void Close()
        {
            this.Execute(DriverCommand.Close, null);
        }

        /// <summary>
        /// Close the Browser and Dispose of WebDriver
        /// </summary>
        public void Quit()
        {
            this.Dispose();
        }

        /// <summary>
        /// Method For getting an object to set the Speed
        /// </summary>
        /// <returns>Returns an IOptions object that allows the driver to set the speed and cookies and getting cookies</returns>
        /// <seealso cref="IOptions"/>
        /// <example>
        /// <code>
        /// IWebDriver driver = new InternetExplorerDriver();
        /// driver.Manage().GetCookies();
        /// </code>
        /// </example>
        public IOptions Manage()
        {
            return new RemoteOptions(this);
        }

        /// <summary>
        /// Method to allow you to Navigate with WebDriver
        /// </summary>
        /// <returns>Returns an INavigation Object that allows the driver to navigate in the browser</returns>
        /// <example>
        /// <code>
        ///     IWebDriver driver = new InternetExplorerDriver();
        ///     driver.Navigate().GoToUrl("http://www.google.co.uk");
        /// </code>
        /// </example>
        public INavigation Navigate()
        {
            return new RemoteNavigator(this);
        }

        /// <summary>
        /// Method to give you access to switch frames and windows
        /// </summary>
        /// <returns>Returns an Object that allows you to Switch Frames and Windows</returns>
        /// <example>
        /// <code>
        /// IWebDriver driver = new InternetExplorerDriver();
        /// driver.SwitchTo().Frame("FrameName");
        /// </code>
        /// </example>
        public ITargetLocator SwitchTo()
        {
            return new RemoteTargetLocator(this);
        }

        /// <summary>
        /// Executes JavaScript in the context of the currently selected frame or window
        /// </summary>
        /// <param name="script">The JavaScript code to execute.</param>
        /// <param name="args">The arguments to the script.</param>
        /// <returns>The value returned by the script.</returns>
        public object ExecuteScript(string script, params object[] args)
        {
            return this.ExecuteScriptCommand(script, DriverCommand.ExecuteScript, args);
        }

        /// <summary>
        /// Executes JavaScript asynchronously in the context of the currently selected frame or window.
        /// </summary>
        /// <param name="script">The JavaScript code to execute.</param>
        /// <param name="args">The arguments to the script.</param>
        /// <returns>The value returned by the script.</returns>
        public object ExecuteAsyncScript(string script, params object[] args)
        {
            return this.ExecuteScriptCommand(script, DriverCommand.ExecuteAsyncScript, args);
        }

        /// <summary>
        /// Finds the first element in the page that matches the ID supplied
        /// </summary>
        /// <param name="id">ID of the element</param>
        /// <returns>IWebElement object so that you can interact with that object</returns>
        /// <example>
        /// <code>
        /// IWebDriver driver = new RemoteWebDriver(DesiredCapabilities.Firefox());
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
        /// IWebDriver driver = new RemoteWebDriver(DesiredCapabilities.Firefox());
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
        /// IWebDriver driver = new RemoteWebDriver(DesiredCapabilities.Firefox());
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
        /// IWebDriver driver = new RemoteWebDriver(DesiredCapabilities.Firefox());
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
        /// IWebDriver driver = new RemoteWebDriver(DesiredCapabilities.Firefox());
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
        /// IWebDriver driver = new RemoteWebDriver(DesiredCapabilities.Firefox());
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
        /// IWebDriver driver = new RemoteWebDriver(DesiredCapabilities.Firefox());
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
        /// IWebDriver driver = new RemoteWebDriver(DesiredCapabilities.Firefox());
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
        /// IWebDriver driver = new RemoteWebDriver(DesiredCapabilities.Firefox());
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
        /// IWebDriver driver = new RemoteWebDriver(DesiredCapabilities.Firefox());
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
        /// IWebDriver driver = new RemoteWebDriver(DesiredCapabilities.Firefox());
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
        /// IWebDriver driver = new RemoteWebDriver(DesiredCapabilities.Firefox());
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
        /// IWebDriver driver = new RemoteWebDriver(DesiredCapabilities.Firefox());
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
        /// IWebDriver driver = new RemoteWebDriver(DesiredCapabilities.Firefox());
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
        /// Finds an element matching the given mechanism and value.
        /// </summary>
        /// <param name="mechanism">The mechanism by which to find the element.</param>
        /// <param name="value">The value to use to search for the element.</param>
        /// <returns>The first <see cref="IWebElement"/> matching the given criteria.</returns>
        public virtual IWebElement FindElement(string mechanism, string value)
        {
            Dictionary<string, object> parameters = new Dictionary<string, object>();
            parameters.Add("using", mechanism);
            parameters.Add("value", value);
            Response commandResponse = this.Execute(DriverCommand.FindElement, parameters);
            return this.GetElementFromResponse(commandResponse);
        }

        /// <summary>
        /// Finds all elements matching the given mechanism and value.
        /// </summary>
        /// <param name="mechanism">The mechanism by which to find the elements.</param>
        /// <param name="value">The value to use to search for the elements.</param>
        /// <returns>A collection of all of the <see cref="IWebElement">IWebElements</see> matching the given criteria.</returns>
        public virtual ReadOnlyCollection<IWebElement> FindElements(string mechanism, string value)
        {
            Dictionary<string, object> parameters = new Dictionary<string, object>();
            parameters.Add("using", mechanism);
            parameters.Add("value", value);
            Response commandResponse = this.Execute(DriverCommand.FindElements, parameters);
            return this.GetElementsFromResponse(commandResponse);
        }

        /// <summary>
        /// Gets a <see cref="Screenshot"/> object representing the image of the page on the screen.
        /// </summary>
        /// <returns>A <see cref="Screenshot"/> object containing the image.</returns>
        public Screenshot GetScreenshot()
        {
            // Get the screenshot as base64.
            Response screenshotResponse = this.Execute(DriverCommand.Screenshot, null);
            string base64 = screenshotResponse.Value.ToString();

            // ... and convert it.
            return new Screenshot(base64);
        }

        /// <summary>
        /// Dispose the RemoteWebDriver Instance
        /// </summary>
        public void Dispose()
        {
            this.Dispose(true);
            GC.SuppressFinalize(this);
        }

        /// <summary>
        /// Performs the specified list of actions with this action executor.
        /// </summary>
        /// <param name="actionSequenceList">The list of action sequences to perform.</param>
        public void PerformActions(IList<ActionSequence> actionSequenceList)
        {
            if (actionSequenceList == null)
            {
                throw new ArgumentNullException("actionSequenceList", "List of action sequences must not be null");
            }

            List<object> objectList = new List<object>();
            foreach (ActionSequence sequence in actionSequenceList)
            {
                objectList.Add(sequence.ToDictionary());
            }

            Dictionary<string, object> parameters = new Dictionary<string, object>();
            parameters["actions"] = objectList;
            this.Execute(DriverCommand.Actions, parameters);
        }

        /// <summary>
        /// Resets the input state of the action executor.
        /// </summary>
        public void ResetInputState()
        {
            this.Execute(DriverCommand.CancelActions, null);
        }

        /// <summary>
        /// Executes commands with the driver
        /// </summary>
        /// <param name="driverCommandToExecute">Command that needs executing</param>
        /// <param name="parameters">Parameters needed for the command</param>
        /// <returns>WebDriver Response</returns>
        internal Response InternalExecute(string driverCommandToExecute, Dictionary<string, object> parameters)
        {
            return this.Execute(driverCommandToExecute, parameters);
        }

        /// <summary>
        /// Find the element in the response
        /// </summary>
        /// <param name="response">Response from the browser</param>
        /// <returns>Element from the page</returns>
        internal IWebElement GetElementFromResponse(Response response)
        {
            if (response == null)
            {
                throw new NoSuchElementException();
            }

            RemoteWebElement element = null;
            Dictionary<string, object> elementDictionary = response.Value as Dictionary<string, object>;
            if (elementDictionary != null)
            {
                element = this.elementFactory.CreateElement(elementDictionary);
            }

            return element;
        }

        /// <summary>
        /// Finds the elements that are in the response
        /// </summary>
        /// <param name="response">Response from the browser</param>
        /// <returns>Collection of elements</returns>
        internal ReadOnlyCollection<IWebElement> GetElementsFromResponse(Response response)
        {
            List<IWebElement> toReturn = new List<IWebElement>();
            object[] elements = response.Value as object[];
            if (elements != null)
            {
                foreach (object elementObject in elements)
                {
                    Dictionary<string, object> elementDictionary = elementObject as Dictionary<string, object>;
                    if (elementDictionary != null)
                    {
                        RemoteWebElement element = this.elementFactory.CreateElement(elementDictionary);
                        toReturn.Add(element);
                    }
                }
            }

            return toReturn.AsReadOnly();
        }

        /// <summary>
        /// Stops the client from running
        /// </summary>
        /// <param name="disposing">if its in the process of disposing</param>
        protected virtual void Dispose(bool disposing)
        {
            try
            {
                this.Execute(DriverCommand.Quit, null);
            }
            catch (NotImplementedException)
            {
            }
            catch (InvalidOperationException)
            {
            }
            catch (WebDriverException)
            {
            }
            finally
            {
                this.StopClient();
                this.sessionId = null;
            }
        }

        /// <summary>
        /// Starts a session with the driver
        /// </summary>
        /// <param name="desiredCapabilities">Capabilities of the browser</param>
        protected void StartSession(ICapabilities desiredCapabilities)
        {
            Dictionary<string, object> parameters = new Dictionary<string, object>();

            // If the object passed into the RemoteWebDriver constructor is a
            // RemoteSessionSettings object, it is expected that all intermediate
            // and end nodes are compliant with the W3C WebDriver Specification,
            // and therefore will already contain all of the appropriate values
            // for establishing a session.
            RemoteSessionSettings remoteSettings = desiredCapabilities as RemoteSessionSettings;
            if (remoteSettings == null)
            {
                Dictionary<string, object> matchCapabilities = this.GetCapabilitiesDictionary(desiredCapabilities);

                List<object> firstMatchCapabilitiesList = new List<object>();
                firstMatchCapabilitiesList.Add(matchCapabilities);

                Dictionary<string, object> specCompliantCapabilitiesDictionary = new Dictionary<string, object>();
                specCompliantCapabilitiesDictionary["firstMatch"] = firstMatchCapabilitiesList;

                parameters.Add("capabilities", specCompliantCapabilitiesDictionary);
            }
            else
            {
                parameters.Add("capabilities", remoteSettings.ToDictionary());
            }

            Response response = this.Execute(DriverCommand.NewSession, parameters);

            Dictionary<string, object> rawCapabilities = response.Value as Dictionary<string, object>;
            if (rawCapabilities == null)
            {
                string errorMessage = string.Format(CultureInfo.InvariantCulture, "The new session command returned a value ('{0}') that is not a valid JSON object.", response.Value);
                throw new WebDriverException(errorMessage);
            }

            ReturnedCapabilities returnedCapabilities = new ReturnedCapabilities(rawCapabilities);
            this.capabilities = returnedCapabilities;
            this.sessionId = new SessionId(response.SessionId);
        }

        /// <summary>
        /// Gets the capabilities as a dictionary.
        /// </summary>
        /// <param name="capabilitiesToConvert">The dictionary to return.</param>
        /// <returns>A Dictionary consisting of the capabilities requested.</returns>
        /// <remarks>This method is only transitional. Do not rely on it. It will be removed
        /// once browser driver capability formats stabilize.</remarks>
        protected virtual Dictionary<string, object> GetCapabilitiesDictionary(ICapabilities capabilitiesToConvert)
        {
            Dictionary<string, object> capabilitiesDictionary = new Dictionary<string, object>();
            IHasCapabilitiesDictionary capabilitiesObject = capabilitiesToConvert as IHasCapabilitiesDictionary;
            foreach (KeyValuePair<string, object> entry in capabilitiesObject.CapabilitiesDictionary)
            {
                if (CapabilityType.IsSpecCompliantCapabilityName(entry.Key))
                {
                    capabilitiesDictionary.Add(entry.Key, entry.Value);
                }
            }

            return capabilitiesDictionary;
        }

        /// <summary>
        /// Executes a command with this driver .
        /// </summary>
        /// <param name="driverCommandToExecute">A <see cref="DriverCommand"/> value representing the command to execute.</param>
        /// <param name="parameters">A <see cref="Dictionary{K, V}"/> containing the names and values of the parameters of the command.</param>
        /// <returns>A <see cref="Response"/> containing information about the success or failure of the command and any data returned by the command.</returns>
        protected virtual Response Execute(string driverCommandToExecute, Dictionary<string, object> parameters)
        {
            Command commandToExecute = new Command(this.sessionId, driverCommandToExecute, parameters);

            Response commandResponse;

            try
            {
                commandResponse = this.executor.Execute(commandToExecute);
            }
            catch (System.Net.WebException e)
            {
                commandResponse = new Response
                {
                    Status = WebDriverResult.UnhandledError,
                    Value = e
                };
            }

            if (commandResponse.Status != WebDriverResult.Success)
            {
                UnpackAndThrowOnError(commandResponse);
            }

            return commandResponse;
        }

        /// <summary>
        /// Starts the command executor, enabling communication with the browser.
        /// </summary>
        protected virtual void StartClient()
        {
        }

        /// <summary>
        /// Stops the command executor, ending further communication with the browser.
        /// </summary>
        protected virtual void StopClient()
        {
        }

        /// <summary>
        /// Executes JavaScript in the context of the currently selected frame or window using a specific command.
        /// </summary>
        /// <param name="script">The JavaScript code to execute.</param>
        /// <param name="commandName">The name of the command to execute.</param>
        /// <param name="args">The arguments to the script.</param>
        /// <returns>The value returned by the script.</returns>
        protected object ExecuteScriptCommand(string script, string commandName, params object[] args)
        {
            object[] convertedArgs = ConvertArgumentsToJavaScriptObjects(args);

            Dictionary<string, object> parameters = new Dictionary<string, object>();
            parameters.Add("script", script);

            if (convertedArgs != null && convertedArgs.Length > 0)
            {
                parameters.Add("args", convertedArgs);
            }
            else
            {
                parameters.Add("args", new object[] { });
            }

            Response commandResponse = this.Execute(commandName, parameters);
            return this.ParseJavaScriptReturnValue(commandResponse.Value);
        }

        private static object ConvertObjectToJavaScriptObject(object arg)
        {
            IWrapsElement argAsWrapsElement = arg as IWrapsElement;
            IWebElementReference argAsElementReference = arg as IWebElementReference;
            IEnumerable argAsEnumerable = arg as IEnumerable;
            IDictionary argAsDictionary = arg as IDictionary;

            if (argAsElementReference == null && argAsWrapsElement != null)
            {
                argAsElementReference = argAsWrapsElement.WrappedElement as IWebElementReference;
            }

            object converted = null;

            if (arg is string || arg is float || arg is double || arg is int || arg is long || arg is bool || arg == null)
            {
                converted = arg;
            }
            else if (argAsElementReference != null)
            {
                // TODO: Remove "ELEMENT" addition when all remote ends are spec-compliant.
                Dictionary<string, object> elementDictionary = argAsElementReference.ToDictionary();
                elementDictionary.Add(RemoteWebElement.LegacyElementReferencePropertyName, argAsElementReference.ElementReferenceId);
                converted = elementDictionary;
            }
            else if (argAsDictionary != null)
            {
                // Note that we must check for the argument being a dictionary before
                // checking for IEnumerable, since dictionaries also implement IEnumerable.
                // Additionally, JavaScript objects have property names as strings, so all
                // keys will be converted to strings.
                Dictionary<string, object> dictionary = new Dictionary<string, object>();
                foreach (var key in argAsDictionary.Keys)
                {
                    dictionary.Add(key.ToString(), ConvertObjectToJavaScriptObject(argAsDictionary[key]));
                }

                converted = dictionary;
            }
            else if (argAsEnumerable != null)
            {
                List<object> objectList = new List<object>();
                foreach (object item in argAsEnumerable)
                {
                    objectList.Add(ConvertObjectToJavaScriptObject(item));
                }

                converted = objectList.ToArray();
            }
            else
            {
                throw new ArgumentException("Argument is of an illegal type" + arg.ToString(), "arg");
            }

            return converted;
        }

        /// <summary>
        /// Converts the arguments to JavaScript objects.
        /// </summary>
        /// <param name="args">The arguments.</param>
        /// <returns>The list of the arguments converted to JavaScript objects.</returns>
        private static object[] ConvertArgumentsToJavaScriptObjects(object[] args)
        {
            if (args == null)
            {
                return new object[] { null };
            }

            for (int i = 0; i < args.Length; i++)
            {
                args[i] = ConvertObjectToJavaScriptObject(args[i]);
            }

            return args;
        }

        private static void UnpackAndThrowOnError(Response errorResponse)
        {
            // Check the status code of the error, and only handle if not success.
            if (errorResponse.Status != WebDriverResult.Success)
            {
                Dictionary<string, object> errorAsDictionary = errorResponse.Value as Dictionary<string, object>;
                if (errorAsDictionary != null)
                {
                    ErrorResponse errorResponseObject = new ErrorResponse(errorAsDictionary);
                    string errorMessage = errorResponseObject.Message;
                    switch (errorResponse.Status)
                    {
                        case WebDriverResult.NoSuchElement:
                            throw new NoSuchElementException(errorMessage);

                        case WebDriverResult.NoSuchFrame:
                            throw new NoSuchFrameException(errorMessage);

                        case WebDriverResult.UnknownCommand:
                            throw new NotImplementedException(errorMessage);

                        case WebDriverResult.ObsoleteElement:
                            throw new StaleElementReferenceException(errorMessage);

                        case WebDriverResult.ElementClickIntercepted:
                            throw new ElementClickInterceptedException(errorMessage);

                        case WebDriverResult.ElementNotInteractable:
                            throw new ElementNotInteractableException(errorMessage);

                        case WebDriverResult.ElementNotDisplayed:
                            throw new ElementNotVisibleException(errorMessage);

                        case WebDriverResult.InvalidElementState:
                        case WebDriverResult.ElementNotSelectable:
                            throw new InvalidElementStateException(errorMessage);

                        case WebDriverResult.UnhandledError:
                            throw new WebDriverException(errorMessage);

                        case WebDriverResult.NoSuchDocument:
                            throw new NoSuchElementException(errorMessage);

                        case WebDriverResult.Timeout:
                            throw new WebDriverTimeoutException(errorMessage);

                        case WebDriverResult.NoSuchWindow:
                            throw new NoSuchWindowException(errorMessage);

                        case WebDriverResult.InvalidCookieDomain:
                            throw new InvalidCookieDomainException(errorMessage);

                        case WebDriverResult.UnableToSetCookie:
                            throw new UnableToSetCookieException(errorMessage);

                        case WebDriverResult.AsyncScriptTimeout:
                            throw new WebDriverTimeoutException(errorMessage);

                        case WebDriverResult.UnexpectedAlertOpen:
                            // TODO(JimEvans): Handle the case where the unexpected alert setting
                            // has been set to "ignore", so there is still a valid alert to be
                            // handled.
                            string alertText = string.Empty;
                            if (errorAsDictionary.ContainsKey("alert"))
                            {
                                Dictionary<string, object> alertDescription = errorAsDictionary["alert"] as Dictionary<string, object>;
                                if (alertDescription != null && alertDescription.ContainsKey("text"))
                                {
                                    alertText = alertDescription["text"].ToString();
                                }
                            }
                            else if (errorAsDictionary.ContainsKey("data"))
                            {
                                Dictionary<string, object> alertData = errorAsDictionary["data"] as Dictionary<string, object>;
                                if (alertData != null && alertData.ContainsKey("text"))
                                {
                                    alertText = alertData["text"].ToString();
                                }
                            }

                            throw new UnhandledAlertException(errorMessage, alertText);

                        case WebDriverResult.NoAlertPresent:
                            throw new NoAlertPresentException(errorMessage);

                        case WebDriverResult.InvalidSelector:
                            throw new InvalidSelectorException(errorMessage);

                        case WebDriverResult.NoSuchDriver:
                            throw new WebDriverException(errorMessage);

                        case WebDriverResult.InvalidArgument:
                            throw new WebDriverArgumentException(errorMessage);

                        case WebDriverResult.UnexpectedJavaScriptError:
                            throw new JavaScriptException(errorMessage);

                        case WebDriverResult.MoveTargetOutOfBounds:
                            throw new MoveTargetOutOfBoundsException(errorMessage);

                        default:
                            throw new InvalidOperationException(string.Format(CultureInfo.InvariantCulture, "{0} ({1})", errorMessage, errorResponse.Status));
                    }
                }
                else
                {
                    throw new WebDriverException("Unexpected error. " + errorResponse.Value.ToString());
                }
            }
        }

        private static ICapabilities ConvertOptionsToCapabilities(DriverOptions options)
        {
            if (options == null)
            {
                throw new ArgumentNullException("options", "Driver options must not be null");
            }

            return options.ToCapabilities();
        }

        private object ParseJavaScriptReturnValue(object responseValue)
        {
            object returnValue = null;

            Dictionary<string, object> resultAsDictionary = responseValue as Dictionary<string, object>;
            object[] resultAsArray = responseValue as object[];

            if (resultAsDictionary != null)
            {
                if (this.elementFactory.ContainsElementReference(resultAsDictionary))
                {
                    returnValue = this.elementFactory.CreateElement(resultAsDictionary);
                }
                else
                {
                    // Recurse through the dictionary, re-parsing each value.
                    string[] keyCopy = new string[resultAsDictionary.Keys.Count];
                    resultAsDictionary.Keys.CopyTo(keyCopy, 0);
                    foreach (string key in keyCopy)
                    {
                        resultAsDictionary[key] = this.ParseJavaScriptReturnValue(resultAsDictionary[key]);
                    }

                    returnValue = resultAsDictionary;
                }
            }
            else if (resultAsArray != null)
            {
                bool allElementsAreWebElements = true;
                List<object> toReturn = new List<object>();
                foreach (object item in resultAsArray)
                {
                    object parsedItem = this.ParseJavaScriptReturnValue(item);
                    IWebElement parsedItemAsElement = parsedItem as IWebElement;
                    if (parsedItemAsElement == null)
                    {
                        allElementsAreWebElements = false;
                    }

                    toReturn.Add(parsedItem);
                }

                if (toReturn.Count > 0 && allElementsAreWebElements)
                {
                    List<IWebElement> elementList = new List<IWebElement>();
                    foreach (object listItem in toReturn)
                    {
                        IWebElement itemAsElement = listItem as IWebElement;
                        elementList.Add(itemAsElement);
                    }

                    returnValue = elementList.AsReadOnly();
                }
                else
                {
                    returnValue = toReturn.AsReadOnly();
                }
            }
            else
            {
                returnValue = responseValue;
            }

            return returnValue;
        }
    }
}
