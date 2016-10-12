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
    public class RemoteWebDriver : IWebDriver, ISearchContext, IJavaScriptExecutor, IFindsById, IFindsByClassName, IFindsByLinkText, IFindsByName, IFindsByTagName, IFindsByXPath, IFindsByPartialLinkText, IFindsByCssSelector, ITakesScreenshot, IHasInputDevices, IHasCapabilities, IHasWebStorage, IHasLocationContext, IHasApplicationCache, IAllowsFileDetection, IHasSessionId
    {
        /// <summary>
        /// The default command timeout for HTTP requests in a RemoteWebDriver instance.
        /// </summary>
        protected static readonly TimeSpan DefaultCommandTimeout = TimeSpan.FromSeconds(60);
        private ICommandExecutor executor;
        private ICapabilities capabilities;
        private IMouse mouse;
        private IKeyboard keyboard;
        private SessionId sessionId;
        private IWebStorage storage;
        private IApplicationCache appCache;
        private ILocationContext locationContext;
        private IFileDetector fileDetector = new DefaultFileDetector();

        /// <summary>
        /// Initializes a new instance of the <see cref="RemoteWebDriver"/> class. This constructor defaults proxy to http://127.0.0.1:4444/wd/hub
        /// </summary>
        /// <param name="desiredCapabilities">An <see cref="ICapabilities"/> object containing the desired capabilities of the browser.</param>
        public RemoteWebDriver(ICapabilities desiredCapabilities)
            : this(new Uri("http://127.0.0.1:4444/wd/hub"), desiredCapabilities)
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
            this.mouse = new RemoteMouse(this);
            this.keyboard = new RemoteKeyboard(this);

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

                try
                {
                    this.Execute(DriverCommand.Get, parameters);
                }
                catch (WebDriverTimeoutException)
                {
                    // WebDriverTimeoutException is a subclass of WebDriverException,
                    // and should be rethrown instead of caught by the catch block
                    // for WebDriverExceptions.
                    throw;
                }
                catch (WebDriverException)
                {
                    // Catch the exeception, if any. This is consistent with other
                    // drivers, in that no exeception is thrown when going to an
                    // invalid URL.
                }
                catch (InvalidOperationException)
                {
                    // Catch the exeception, if any. This is consistent with other
                    // drivers, in that no exeception is thrown when going to an
                    // invalid URL.
                }
                catch (NotImplementedException)
                {
                    // Chrome throws NotImplementedException if the URL is invalid.
                    // Catch the exeception, if any. This is consistent with other
                    // drivers, in that no exeception is thrown when going to an
                    // invalid URL.
                }
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
        /// Gets an <see cref="IKeyboard"/> object for sending keystrokes to the browser.
        /// </summary>
        public IKeyboard Keyboard
        {
            get { return this.keyboard; }
        }

        /// <summary>
        /// Gets an <see cref="IMouse"/> object for sending mouse commands to the browser.
        /// </summary>
        public IMouse Mouse
        {
            get { return this.mouse; }
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
        /// Gets a value indicating whether or not the driver is compliant with the W3C WebDriver specification.
        /// </summary>
        internal bool IsSpecificationCompliant
        {
            get { return this.CommandExecutor.CommandInfoRepository.SpecificationLevel > 0; }
        }

        /// <summary>
        /// Gets the <see cref="ICommandExecutor"/> which executes commands for this driver.
        /// </summary>
        protected ICommandExecutor CommandExecutor
        {
            get { return this.executor; }
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
            if (this.IsSpecificationCompliant)
            {
                return this.FindElement("css selector", "#" + EscapeCssSelector(id));
            }

            return this.FindElement("id", id);
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
            if (this.IsSpecificationCompliant)
            {
                string selector = EscapeCssSelector(id);
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

            return this.FindElements("id", id);
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
            // Element finding mechanism is not allowed by the W3C WebDriver
            // specification, but rather should be implemented as a function
            // of other finder mechanisms as documented in the spec.
            // Implementation after spec reaches recommendation should be as
            // follows:
            // return this.FindElement("css selector", "." + className);
            if (this.IsSpecificationCompliant)
            {
                string selector = EscapeCssSelector(className);
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

            return this.FindElement("class name", className);
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
            // Element finding mechanism is not allowed by the W3C WebDriver
            // specification, but rather should be implemented as a function
            // of other finder mechanisms as documented in the spec.
            // Implementation after spec reaches recommendation should be as
            // follows:
            // return this.FindElements("css selector", "." + className);
            if (this.IsSpecificationCompliant)
            {
                string selector = EscapeCssSelector(className);
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

            return this.FindElements("class name", className);
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
            // Element finding mechanism is not allowed by the W3C WebDriver
            // specification, but rather should be implemented as a function
            // of other finder mechanisms as documented in the spec.
            // Implementation after spec reaches recommendation should be as
            // follows:
            // return this.FindElement("css selector", "*[name=\"" + name + "\"]");
            if (this.IsSpecificationCompliant)
            {
                return this.FindElement("css selector", "*[name=\"" + name + "\"]");
            }

            return this.FindElement("name", name);
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
            // Element finding mechanism is not allowed by the W3C WebDriver
            // specification, but rather should be implemented as a function
            // of other finder mechanisms as documented in the spec.
            // Implementation after spec reaches recommendation should be as
            // follows:
            // return this.FindElements("css selector", "*[name=\"" + name + "\"]");
            if (this.IsSpecificationCompliant)
            {
                return this.FindElements("css selector", "*[name=\"" + name + "\"]");
            }

            return this.FindElements("name", name);
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
            // Element finding mechanism is not allowed by the W3C WebDriver
            // specification, but rather should be implemented as a function
            // of other finder mechanisms as documented in the spec.
            // Implementation after spec reaches recommendation should be as
            // follows:
            // return this.FindElement("css selector", tagName);
            if (this.IsSpecificationCompliant)
            {
                return this.FindElement("css selector", tagName);
            }

            return this.FindElement("tag name", tagName);
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
            // Element finding mechanism is not allowed by the W3C WebDriver
            // specification, but rather should be implemented as a function
            // of other finder mechanisms as documented in the spec.
            // Implementation after spec reaches recommendation should be as
            // follows:
            // return this.FindElements("css selector", tagName);
            if (this.IsSpecificationCompliant)
            {
                return this.FindElements("css selector", tagName);
            }

            return this.FindElements("tag name", tagName);
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
        /// Escapes invalid characters in a CSS selector.
        /// </summary>
        /// <param name="selector">The selector to escape.</param>
        /// <returns>The selector with invalid characters escaped.</returns>
        internal static string EscapeCssSelector(string selector)
        {
            string escaped = Regex.Replace(selector, @"(['""\\#.:;,!?+<>=~*^$|%&@`{}\-/\[\]\(\)])", @"\$1");
            if (selector.Length > 0 && char.IsDigit(selector[0]))
            {
                escaped = @"\" + (30 + int.Parse(selector.Substring(0, 1), CultureInfo.InvariantCulture)).ToString(CultureInfo.InvariantCulture) + " " + selector.Substring(1);
            }

            return escaped;
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
                // TODO: Remove this "if" logic once the spec is properly updated
                // and remote-end implementations comply.
                string id = string.Empty;
                if (elementDictionary.ContainsKey("element-6066-11e4-a52e-4f735466cecf"))
                {
                    id = (string)elementDictionary["element-6066-11e4-a52e-4f735466cecf"];
                }
                else if (elementDictionary.ContainsKey("ELEMENT"))
                {
                    id = (string)elementDictionary["ELEMENT"];
                }

                element = this.CreateElement(id);
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
            foreach (object elementObject in elements)
            {
                Dictionary<string, object> elementDictionary = elementObject as Dictionary<string, object>;
                if (elementDictionary != null)
                {
                    // TODO: Remove this "if" logic once the spec is properly updated
                    // and remote-end implementations comply.
                    string id = string.Empty;
                    if (elementDictionary.ContainsKey("element-6066-11e4-a52e-4f735466cecf"))
                    {
                        id = (string)elementDictionary["element-6066-11e4-a52e-4f735466cecf"];
                    }
                    else if (elementDictionary.ContainsKey("ELEMENT"))
                    {
                        id = (string)elementDictionary["ELEMENT"];
                    }

                    RemoteWebElement element = this.CreateElement(id);
                    toReturn.Add(element);
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
            DesiredCapabilities capabilitiesObject = desiredCapabilities as DesiredCapabilities;
            Dictionary<string, object> parameters = new Dictionary<string, object>();
            parameters.Add("desiredCapabilities", capabilitiesObject.CapabilitiesDictionary);
            Response response = this.Execute(DriverCommand.NewSession, parameters);

            Dictionary<string, object> rawCapabilities = (Dictionary<string, object>)response.Value;
            DesiredCapabilities returnedCapabilities = new DesiredCapabilities(rawCapabilities);
            this.capabilities = returnedCapabilities;
            this.sessionId = new SessionId(response.SessionId);
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

            Response commandResponse = new Response();

            try
            {
                commandResponse = this.executor.Execute(commandToExecute);
            }
            catch (System.Net.WebException e)
            {
                commandResponse.Status = WebDriverResult.UnhandledError;
                commandResponse.Value = e;
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
        /// Finds an element matching the given mechanism and value.
        /// </summary>
        /// <param name="mechanism">The mechanism by which to find the element.</param>
        /// <param name="value">The value to use to search for the element.</param>
        /// <returns>The first <see cref="IWebElement"/> matching the given criteria.</returns>
        protected IWebElement FindElement(string mechanism, string value)
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
        protected ReadOnlyCollection<IWebElement> FindElements(string mechanism, string value)
        {
            Dictionary<string, object> parameters = new Dictionary<string, object>();
            parameters.Add("using", mechanism);
            parameters.Add("value", value);
            Response commandResponse = this.Execute(DriverCommand.FindElements, parameters);
            return this.GetElementsFromResponse(commandResponse);
        }

        /// <summary>
        /// Creates a <see cref="RemoteWebElement"/> with the specified ID.
        /// </summary>
        /// <param name="elementId">The ID of this element.</param>
        /// <returns>A <see cref="RemoteWebElement"/> with the specified ID.</returns>
        protected virtual RemoteWebElement CreateElement(string elementId)
        {
            RemoteWebElement toReturn = new RemoteWebElement(this, elementId);
            return toReturn;
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
            RemoteWebElement argAsElement = arg as RemoteWebElement;
            IEnumerable argAsEnumerable = arg as IEnumerable;
            IDictionary argAsDictionary = arg as IDictionary;

            if (argAsElement == null && argAsWrapsElement != null)
            {
                argAsElement = argAsWrapsElement.WrappedElement as RemoteWebElement;
            }

            object converted = null;

            if (arg is string || arg is float || arg is double || arg is int || arg is long || arg is bool || arg == null)
            {
                converted = arg;
            }
            else if (argAsElement != null)
            {
                // TODO: Remove addition of 'id' key when spec is changed.
                Dictionary<string, object> elementDictionary = new Dictionary<string, object>();
                elementDictionary.Add("ELEMENT", argAsElement.InternalElementId);
                elementDictionary.Add("element-6066-11e4-a52e-4f735466cecf", argAsElement.InternalElementId);
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

                        case WebDriverResult.ElementNotDisplayed:
                            throw new ElementNotVisibleException(errorMessage);

                        case WebDriverResult.InvalidElementState:
                        case WebDriverResult.ElementNotSelectable:
                            throw new InvalidElementStateException(errorMessage);

                        case WebDriverResult.UnhandledError:
                            throw new InvalidOperationException(errorMessage);

                        case WebDriverResult.NoSuchDocument:
                            throw new NoSuchElementException(errorMessage);

                        case WebDriverResult.Timeout:
                            throw new WebDriverTimeoutException(errorMessage);

                        case WebDriverResult.NoSuchWindow:
                            throw new NoSuchWindowException(errorMessage);

                        case WebDriverResult.InvalidCookieDomain:
                        case WebDriverResult.UnableToSetCookie:
                            throw new WebDriverException(errorMessage);

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

                            throw new UnhandledAlertException(errorMessage, alertText);

                        case WebDriverResult.NoAlertPresent:
                            throw new NoAlertPresentException(errorMessage);

                        case WebDriverResult.InvalidSelector:
                            throw new InvalidSelectorException(errorMessage);

                        case WebDriverResult.NoSuchDriver:
                            throw new WebDriverException(errorMessage);

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

        private object ParseJavaScriptReturnValue(object responseValue)
        {
            object returnValue = null;

            Dictionary<string, object> resultAsDictionary = responseValue as Dictionary<string, object>;
            object[] resultAsArray = responseValue as object[];

            if (resultAsDictionary != null)
            {
                if (resultAsDictionary.ContainsKey("element-6066-11e4-a52e-4f735466cecf"))
                {
                    string id = (string)resultAsDictionary["element-6066-11e4-a52e-4f735466cecf"];
                    RemoteWebElement element = this.CreateElement(id);
                    returnValue = element;
                }
                else if (resultAsDictionary.ContainsKey("ELEMENT"))
                {
                    string id = (string)resultAsDictionary["ELEMENT"];
                    RemoteWebElement element = this.CreateElement(id);
                    returnValue = element;
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
