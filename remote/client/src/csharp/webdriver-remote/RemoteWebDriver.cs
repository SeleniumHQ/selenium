using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.Globalization;

using Newtonsoft.Json;
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
    public class RemoteWebDriver : IWebDriver, ISearchContext, IJavaScriptExecutor, IFindsById, IFindsByClassName, IFindsByLinkText, IFindsByName, IFindsByTagName, IFindsByXPath, IFindsByPartialLinkText
    {
        private ICommandExecutor executor;
        private ICapabilities capabilities;
        private SessionId sessionId;

        /// <summary>
        /// Initializes a new instance of the RemoteWebDriver class
        /// </summary>
        /// <param name="commandExecutor">Executor of commands</param>
        /// <param name="desiredCapabilities">DesiredCapabilites of the Browser needed</param>
        public RemoteWebDriver(ICommandExecutor commandExecutor, ICapabilities desiredCapabilities)
        {
            executor = commandExecutor;
            StartClient();
            StartSession(desiredCapabilities);
        }

        /// <summary>
        /// Initializes a new instance of the RemoteWebDriver class. This constructor defaults proxy to http://127.0.0.1:4444/wd/hub
        /// </summary>
        /// <param name="desiredCapabilities">DesiredCapabilites of the Browser needed</param>
        public RemoteWebDriver(ICapabilities desiredCapabilities)
            : this(new Uri("http://127.0.0.1:4444/wd/hub"), desiredCapabilities)
        {
        }

        /// <summary>
        /// Initializes a new instance of the RemoteWebDriver class
        /// </summary>
        /// <param name="remoteAddress">Uri of where the Server e.g. http://127.0.0.1:4444/wd/hub</param>
        /// <param name="desiredCapabilities">DesiredCapabilites of the Browser needed</param>
        public RemoteWebDriver(Uri remoteAddress, ICapabilities desiredCapabilities)
            : this(new HttpCommandExecutor(remoteAddress), desiredCapabilities)
        {
        }

        #region IWebDriver Members

        /// <summary>
        /// Gets or sets the URL the browser is currently displaying.
        /// </summary>
        /// <seealso cref="IWebDriver.Url"/>
        /// <seealso cref="INavigation.GoToUrl(System.String)"/>
        /// <seealso cref="INavigation.GoToUrl(System.Uri)"/>
        public string Url
        {
            get
            {
                Response commandResponse = Execute(DriverCommand.GetCurrentUrl, null);
                return commandResponse.Value.ToString();
            }

            set
            {
                if (value == null)
                {
                    throw new ArgumentNullException("value", "Argument 'url' cannot be null.");
                }

                Execute(DriverCommand.Get, new object[] { value });
            }
        }

        /// <summary>
        /// Gets the title of the current browser window.
        /// </summary>
        public string Title
        {
            get
            {
                Response commandResponse = Execute(DriverCommand.GetTitle, null);
                object returnedTitle = commandResponse.Value.ToString();
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
                Response commandResponse = Execute(DriverCommand.GetPageSource, null);
                return commandResponse.Value.ToString();
            }
        }

        /// <summary>
        /// Gets the capabilities that the RemoteWebDriver instance is currently using
        /// </summary>
        public ICapabilities Capabilities
        {
            get { return capabilities; }
        }

        /// <summary>
        /// Finds the first element in the page that matches the <see cref="By"/> object
        /// </summary>
        /// <param name="by">By mechanism to find the object</param>
        /// <returns>IWebElement object so that you can interction that object</returns>
        /// <example>
        /// <code>
        /// IWebDriver driver = new InternetExplorerDriver();
        /// IWebElement elem = driver.FindElement(By.Name("q"));
        /// </code>
        /// </example>
        public IWebElement FindElement(By by)
        {
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
            return by.FindElements(this);
        }

        /// <summary>
        /// Closes the Browser
        /// </summary>
        public void Close()
        {
            Execute(DriverCommand.Close, null);
        }

        /// <summary>
        /// Close the Browser and Dispose of WebDriver
        /// </summary>
        public void Quit()
        {
            try
            {
                Execute(DriverCommand.Quit, null);
            }
            finally
            {
                Dispose();
            }
        }

        /// <summary>
        /// Method For getting an object to set the Speen
        /// </summary>
        /// <returns>Returns an IOptions object that allows the driver to set the speed and cookies and getting cookies</returns>
        /// <seealso cref="InternetExplorerOptions(IWebDriver driver)"/>
        /// <example>
        /// <code>
        /// IWebDriver driver = new InternetExplorerDriver();
        /// driver.Manage().GetCookies();
        /// </code>
        /// </example>
        public IOptions Manage()
        {
            return new RemoteWebDriverOptions(this);
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
            return new RemoteNavigation(this);
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
        /// Method for returning a collection of WindowHandles that the driver has access to
        /// </summary>
        /// <returns>Returns a ReadOnlyCollection of Window Handles</returns>
        /// <example>
        /// IWebDriver driver = new InternetExplorerDriver();
        /// ReadOnlyCollection<![CDATA[<string>]]> windowNames = driver.GetWindowHandles();
        /// </example>
        public ReadOnlyCollection<string> GetWindowHandles()
        {
            Response commandResponse = Execute(DriverCommand.GetWindowHandles, null);
            object[] handles = (object[])commandResponse.Value;
            List<string> handleList = new List<string>();
            foreach (object handle in handles)
            {
                handleList.Add(handle.ToString());
            }

            return new ReadOnlyCollection<string>(handleList);
        }

        /// <summary>
        /// Returns the Name of Window that the driver is working in
        /// </summary>
        /// <returns>Returns the name of the Window</returns>
        /// <example>
        /// IWebDriver driver = new InternetExplorerDriver();
        /// string windowName = driver.GetWindowHandles();
        /// </example>
        public string GetWindowHandle()
        {
            Response commandResponse = Execute(DriverCommand.GetCurrentWindowHandle, null);
            return commandResponse.Value.ToString();
        }

        #region IJavaScriptExecutor Members

        /// <summary>
        /// Executes JavaScript in the context of the currently selected frame or window
        /// </summary>
        /// <param name="script">The JavaScript code to execute.</param>
        /// <param name="args">The arguments to the script.</param>
        /// <returns>The value returned by the script.</returns>
        public object ExecuteScript(string script, object[] args)
        {
            if (!Capabilities.IsJavaScriptEnabled)
            {
                throw new NotSupportedException("You must be using an underlying instance of WebDriver that supports executing javascript");
            }

            // Escape the quote marks
            script = script.Replace("\"", "\\\"");

            object[] convertedArgs = ConvertArgumentsToJavaScriptObjects(args);

            Command command;
            if (convertedArgs != null && convertedArgs.Length > 0)
            {
                command = new Command(sessionId, new Context("foo"), DriverCommand.ExecuteScript, new object[] { script, convertedArgs });
            }
            else
            {
                command = new Command(sessionId, new Context("foo"), DriverCommand.ExecuteScript, new object[] { script, new object[] { } });
            }

            Response commandResponse = new Response();
            try
            {
                commandResponse = executor.Execute(command);
            }
            catch (System.Net.WebException e)
            {
                commandResponse.IsError = true;
                commandResponse.Value = e;
            }

            if (commandResponse.IsError)
            {
                UnpackAndThrowOnError(commandResponse.Value);
            }

            return ParseJavaScriptReturnValue(commandResponse.Value);
        }
        #endregion

        #region IFindsById Members
        /// <summary>
        /// Finds the first element in the page that matches the ID supplied
        /// </summary>
        /// <param name="id">ID of the element</param>
        /// <returns>IWebElement object so that you can interction that object</returns>
        /// <example>
        /// <code>
        /// IWebDriver driver = new RemoteWebDriver(DesiredCapabilities.Firefox());
        /// IWebElement elem = driver.FindElementById("id")
        /// </code>
        /// </example>
        public IWebElement FindElementById(string id)
        {
            Response commandResponse = Execute(DriverCommand.FindElement, new object[] { "id", id });
            return GetElementFromResponse(commandResponse);
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
            Response commandResponse = Execute(DriverCommand.FindElements, new object[] { "id", id });
            return GetElementsFromResponse(commandResponse);
        }

        #endregion

        #region IFindsByClassName Members
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
            Response commandResponse = Execute(DriverCommand.FindElement, new object[] { "class name", className });
            return GetElementFromResponse(commandResponse);
        }

        /// <summary>
        /// Finds a list of elements that match the classname supplied
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
            Response commandResponse = Execute(DriverCommand.FindElements, new object[] { "class name", className });
            return GetElementsFromResponse(commandResponse);
        }

        #endregion

        #region IFindsByLinkText Members
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
            Response commandResponse = Execute(DriverCommand.FindElement, new object[] { "link text", linkText });
            return GetElementFromResponse(commandResponse);
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
            Response commandResponse = Execute(DriverCommand.FindElements, new object[] { "link text", linkText });
            return GetElementsFromResponse(commandResponse);
        }

        #endregion

        #region IFindsByPartialLinkText Members
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
            Response commandResponse = Execute(DriverCommand.FindElement, new object[] { "partial link text", partialLinkText });
            return GetElementFromResponse(commandResponse);
        }

        /// <summary>
        /// Finds a list of elements that match the classname supplied
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
            Response commandResponse = Execute(DriverCommand.FindElements, new object[] { "partial link text", partialLinkText });
            return GetElementsFromResponse(commandResponse);
        }

        #endregion

        #region IFindsByName Members
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
            Response commandResponse = Execute(DriverCommand.FindElement, new object[] { "name", name });
            return GetElementFromResponse(commandResponse);
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
            Response commandResponse = Execute(DriverCommand.FindElements, new object[] { "name", name });
            return GetElementsFromResponse(commandResponse);
        }

        #endregion

        #region IFindsByTagName Members

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
            Response commandResponse = Execute(DriverCommand.FindElement, new object[] { "tag name", tagName });
            return GetElementFromResponse(commandResponse);
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
            Response commandResponse = Execute(DriverCommand.FindElements, new object[] { "tag name", tagName });
            return GetElementsFromResponse(commandResponse);
        }

        #endregion

        #region IFindsByXPath Members

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
            Response commandResponse = Execute(DriverCommand.FindElement, new object[] { "xpath", xpath });
            return GetElementFromResponse(commandResponse);
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
            Response commandResponse = Execute(DriverCommand.FindElements, new object[] { "xpath", xpath });
            return GetElementsFromResponse(commandResponse);
        }

        #endregion
        #endregion

        #region IDisposable Members

        /// <summary>
        /// Dispose the RemoteWebDriver Instance
        /// </summary>
        public void Dispose()
        {
            Dispose(true);
            GC.SuppressFinalize(this);
        }

        #endregion

        #region Internal Methods
        /// <summary>
        /// Executes commands with the driver 
        /// </summary>
        /// <param name="driverCommandToExecute">Command that needs executing</param>
        /// <param name="parameters">Parameters needed for the command</param>
        /// <returns>WebDriver Response</returns>
        internal Response Execute(DriverCommand driverCommandToExecute, object[] parameters)
        {
            Command commandToExecute = new Command(sessionId, new Context("foo"), driverCommandToExecute, parameters);

            Response commandResponse = new Response();

            try
            {
                commandResponse = executor.Execute(commandToExecute);
                AmendElementValueIfNecessary(commandResponse);
            }
            catch (System.Net.WebException e)
            {
                commandResponse.IsError = true;
                commandResponse.Value = e;
            }

            if (commandResponse.IsError)
            {
                UnpackAndThrowOnError(commandResponse.Value);
            }

            return commandResponse;
        }

        /// <summary>
        /// Find the element in the response
        /// </summary>
        /// <param name="response">Reponse from the browser</param>
        /// <returns>Element from the page</returns>
        internal IWebElement GetElementFromResponse(Response response)
        {
            IWebElement element = null;
            ReadOnlyCollection<IWebElement> elements = GetElementsFromResponse(response);
            if (elements.Count > 0)
            {
                element = elements[0];
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
            object[] urls = (object[])response.Value;
            foreach (object url in urls)
            {
                // We cheat here, because we know that the URL for an element ends with its ID.
                // This is lazy and bad. We should, instead, go to each of the URLs in turn.
                string[] parts = url.ToString().Split(new string[] { "/" }, StringSplitOptions.RemoveEmptyEntries);
                RemoteWebElement element = CreateRemoteWebElement();
                element.Id = parts[parts.Length - 1];
                toReturn.Add(element);
            }

            return new ReadOnlyCollection<IWebElement>(toReturn);
        }
        #endregion

        #region Protected Members
        /// <summary>
        /// Stops the client from running
        /// </summary>
        /// <param name="disposing">if its in the process of disposing</param>
        protected virtual void Dispose(bool disposing)
        {
            sessionId = null;
            StopClient();
        }

        /// <summary>
        /// Starts a session with the driver
        /// </summary>
        /// <param name="desiredCapabilities">Capabilities of the browser</param>
        protected void StartSession(ICapabilities desiredCapabilities)
        {
            Response response = Execute(DriverCommand.NewSession, new object[] { desiredCapabilities });

            Dictionary<string, object> rawCapabilities = (Dictionary<string, object>)response.Value;
            string browser = (string)rawCapabilities["browserName"];
            string version = (string)rawCapabilities["version"];
            Platform platform;
            if (rawCapabilities.ContainsKey("operatingSystem"))
            {
                platform = new Platform((PlatformType)Enum.Parse(typeof(PlatformType), (string)rawCapabilities["operatingSystem"], true));
            }
            else
            {
                platform = new Platform((PlatformType)Enum.Parse(typeof(PlatformType), (string)rawCapabilities["platform"], true));
            }

            DesiredCapabilities returnedCapabilities = new DesiredCapabilities(browser, version, platform);
            returnedCapabilities.IsJavaScriptEnabled = (bool)rawCapabilities["javascriptEnabled"];
            capabilities = returnedCapabilities;
            sessionId = new SessionId(response.SessionId);
        }

        /// <summary>
        /// Start the client
        /// </summary>
        protected virtual void StartClient()
        {
        }

        /// <summary>
        /// Stop the client
        /// </summary>
        protected virtual void StopClient()
        {
        }
        #endregion

        #region Private methods
        private static object ConvertObjectToJavaScriptObject(object arg)
        {
            RemoteWebElement argAsElement = arg as RemoteWebElement;
            Dictionary<string, object> converted = new Dictionary<string, object>();

            if (arg is string)
            {
                converted.Add("type", "STRING");
                converted.Add("value", arg);
            }
            else if (arg is float || arg is double || arg is int || arg is long)
            {
                converted.Add("type", "NUMBER");
                converted.Add("value", arg);
            }
            else if (arg is bool)
            {
                converted.Add("type", "BOOLEAN");
                converted.Add("value", arg);
            }
            else if (argAsElement != null)
            {
                converted.Add("type", "ELEMENT");
                converted.Add("value", argAsElement.Id);
            }
            else
            {
                throw new ArgumentException("Argument is of an illegal type" + arg.ToString(), "arg");
            }

            return converted;
        }

        private static object[] ConvertArgumentsToJavaScriptObjects(object[] args)
        {
            for (int i = 0; i < args.Length; i++)
            {
                args[i] = ConvertObjectToJavaScriptObject(args[i]);
            }

            return args;
        }

        private static void UnpackAndThrowOnError(object error)
        {
            // The exception object is wrapped so it appears as a JSON string. Parse
            // the JSON string into an object first, then we can assemble the correct
            // exception.
            string errorString = error.ToString();
            ErrorResponse errorResponseObject;
            if (errorString.StartsWith("{", StringComparison.OrdinalIgnoreCase))
            {
                errorResponseObject = JsonConvert.DeserializeObject<ErrorResponse>(errorString);
            }
            else
            {
                errorResponseObject = new ErrorResponse { Message = errorString, ClassName = "." };
            }

            if (errorResponseObject != null)
            {
                // TODO: I don't like this approach overmuch. It's too dependent on
                // class name, and only supports the Java server. Will need to be
                // refactored to support other remote server implementations.
                // Assume we have a class member to the Java exception
                string errorMessage = errorResponseObject.Message;
                string errorClass = errorResponseObject.ClassName;
                string[] classNameParts = errorClass.Split(new string[] { "." }, StringSplitOptions.None);
                string className = classNameParts[classNameParts.Length - 1];
                if (className == "NoSuchElementException")
                {
                    throw new NoSuchElementException(errorMessage);
                }
                else if (className == "NoSuchFrameException")
                {
                    throw new NoSuchFrameException(errorMessage);
                }
                else if (className == "StaleElementReferenceException")
                {
                    throw new StaleElementReferenceException(errorMessage);
                }
                else if (className == "ElementNotVisibleException")
                {
                    throw new ElementNotVisibleException(errorMessage);
                }
                else if (className == "UnsupportedOperationException")
                {
                    if (errorMessage.Contains("toggle"))
                    {
                        throw new NotImplementedException(errorMessage);
                    }

                    throw new NotSupportedException(errorMessage);
                }
                else if (className == "WebDriverException")
                {
                    if (errorMessage.Contains("switch to frame"))
                    {
                        throw new InvalidOperationException(errorMessage);
                    }

                    throw new WebDriverException(errorMessage);
                }
                else if (className == "UnexpectedJavascriptExecutionException")
                {
                    throw new InvalidOperationException(errorMessage);
                }
                else if (className == "TimedOutException")
                {
                    throw new TimeoutException(errorMessage);
                }
                else if (className == "NoSuchWindowException")
                {
                    throw new NoSuchWindowException(errorMessage);
                }
                else
                {
                    throw new InvalidOperationException(errorMessage);
                }
            }
            else
            {
                throw new WebDriverException("Unexpected error. " + errorString);
            }
        }

        private object ParseJavaScriptReturnValue(object responseValue)
        {
            object returnValue = null;

            Dictionary<string, object> result = (Dictionary<string, object>)responseValue;

            string type = (string)result["type"];
            if (type != "NULL")
            {
                if (type == "ELEMENT")
                {
                    string[] parts = result["value"].ToString().Split(new string[] { "/" }, StringSplitOptions.None);
                    RemoteWebElement element = CreateRemoteWebElement();
                    element.Id = parts[parts.Length - 1];
                    returnValue = element;
                }
                else if (result["value"] is double)
                {
                    double resultValue = (double)result["value"];
                    long longValue;
                    bool isLong = long.TryParse(resultValue.ToString(CultureInfo.InvariantCulture), out longValue);
                    if (isLong)
                    {
                        returnValue = longValue;
                    }
                    else
                    {
                        returnValue = resultValue;
                    }
                }
                else
                {
                    returnValue = result["value"];
                }
            }

            return returnValue;
        }

        private void AmendElementValueIfNecessary(Response commandResponse)
        {
            if (!(commandResponse.Value is RemoteWebElement))
            {
                return;
            }

            // Ensure that the parent is set properly
            RemoteWebElement existingElement = (RemoteWebElement)commandResponse.Value;
            existingElement.Parent = this;

            if (!Capabilities.IsJavaScriptEnabled)
            {
                return;
            }

            if (!(commandResponse.Value is RenderedRemoteWebElement))
            {
                return; // Good, nothing to do}
            }

            RenderedRemoteWebElement replacement = new RenderedRemoteWebElement();
            replacement.Id = existingElement.Id;
            replacement.Parent = this;

            commandResponse.Value = replacement;
        }

        private RemoteWebElement CreateRemoteWebElement()
        {
            RemoteWebElement toReturn;
            if (capabilities.IsJavaScriptEnabled)
            {
                toReturn = new RenderedRemoteWebElement();
            }
            else
            {
                toReturn = new RemoteWebElement();
            }

            toReturn.Parent = this;
            return toReturn;
        }
        #endregion
        /// <summary>
        /// Provides a mechanism for setting options needed for the driver during the test.
        /// </summary>
        private class RemoteWebDriverOptions : IOptions
        {
            private RemoteWebDriver driver;

            /// <summary>
            /// Initializes a new instance of the RemoteWebDriverOptions class
            /// </summary>
            /// <param name="driver">Instance of the driver currently in use</param>
            public RemoteWebDriverOptions(RemoteWebDriver driver)
            {
                this.driver = driver;
            }

            /// <summary>
            /// Gets or sets the speed with which actions are executed in the browser.
            /// </summary>
            public Speed Speed
            {
                get
                {
                    Response response = driver.Execute(DriverCommand.GetSpeed, null);

                    return Speed.FromString(response.Value.ToString());
                }

                set
                {
                    driver.Execute(DriverCommand.SetSpeed, new object[] { value.Description.ToUpper(CultureInfo.InvariantCulture) });
                }
            }

            /// <summary>
            /// Method for creating a cookie in the browser
            /// </summary>
            /// <param name="cookie"><seealso cref="Cookie(string name, string value, string domain, string path, DateTime? expiry)"/> that represents a cookie in the browser</param>
            public void AddCookie(Cookie cookie)
            {
                driver.Execute(DriverCommand.AddCookie, new object[] { cookie });
            }

            /// <summary>
            /// Delete the cookie by passing in the name of the cookie
            /// </summary>
            /// <param name="name">The name of the cookie that is in the browser</param>
            public void DeleteCookieNamed(string name)
            {
                Dictionary<string, object> parameters = new Dictionary<string, object>();
                parameters.Add("name", name);
                driver.Execute(DriverCommand.DeleteCookie, new object[] { parameters });
            }

            /// <summary>
            /// Delete a cookie in the browser by passing in a copy of a cookie
            /// </summary>
            /// <param name="cookie">An object that represents a copy of the cookie that needs to be deleted</param>
            public void DeleteCookie(Cookie cookie)
            {
                DeleteCookieNamed(cookie.Name);
            }

            /// <summary>
            /// Delete All Cookies that are present in the browser
            /// </summary>
            public void DeleteAllCookies()
            {
                driver.Execute(DriverCommand.DeleteAllCookies, null);
            }

            /// <summary>
            /// Method for returning a getting a cookie by name
            /// </summary>
            /// <param name="name">name of the cookie that needs to be returned</param>
            /// <returns>A Cookie from the name</returns>
            public Cookie GetCookieNamed(string name)
            {
                Cookie cookieToReturn = null;
                ReadOnlyCollection<Cookie> allCookies = GetCookies();
                foreach (Cookie currentCookie in allCookies)
                {
                    if (name.Equals(currentCookie.Name))
                    {
                        cookieToReturn = currentCookie;
                        break;
                    }
                }

                return cookieToReturn;
            }

            /// <summary>
            /// Method for getting a Collection of Cookies that are present in the browser
            /// </summary>
            /// <returns>ReadOnlyCollection of Cookies in the browser</returns>
            public ReadOnlyCollection<Cookie> GetCookies()
            {
                List<Cookie> toReturn = new List<Cookie>();
                object returned = driver.Execute(DriverCommand.GetAllCookies, null).Value;

                try
                {
                    object[] cookies = returned as object[];
                    if (cookies != null)
                    {
                        foreach (object rawCookie in cookies)
                        {
                            Dictionary<string, object> cookie = rawCookie as Dictionary<string, object>;
                            if (rawCookie != null)
                            {
                                string name = cookie["name"].ToString();
                                string value = cookie["value"].ToString();
                                string path = cookie["path"].ToString();
                                string domain = cookie["domain"].ToString();
                                bool secure = bool.Parse(cookie["secure"].ToString());
                                toReturn.Add(new ReturnedCookie(name, value, domain, path, null, secure, new Uri(driver.Url)));
                            }
                        }
                    }

                    return new ReadOnlyCollection<Cookie>(toReturn);
                }
                catch (Exception e)
                {
                    throw new WebDriverException("Unexpected problem getting cookies", e);
                }
            }
        }

        /// <summary>
        /// Provides a mechanism for Navigating with the driver.
        /// </summary>
        private class RemoteNavigation : INavigation
        {
            private RemoteWebDriver driver;

            /// <summary>
            /// Initializes a new instance of the RemoteNavigation class
            /// </summary>
            /// <param name="driver">Driver in use</param>
            public RemoteNavigation(RemoteWebDriver driver)
            {
                this.driver = driver;
            }

            /// <summary>
            /// Move the browser back
            /// </summary>
            public void Back()
            {
                driver.Execute(DriverCommand.GoBack, null);
            }

            /// <summary>
            /// Move the browser forward
            /// </summary>
            public void Forward()
            {
                driver.Execute(DriverCommand.GoForward, null);
            }

            /// <summary>
            /// Navigate to a url for your test
            /// </summary>
            /// <param name="url">String of where you want the browser to go to</param>
            public void GoToUrl(string url)
            {
                driver.Url = url;
            }

            /// <summary>
            /// Navigate to a url for your test
            /// </summary>
            /// <param name="url">Uri object of where you want the browser to go to</param>
            public void GoToUrl(Uri url)
            {
                if (url == null)
                {
                    throw new ArgumentNullException("url", "URL cannot be null.");
                }

                driver.Url = url.ToString();
            }

            /// <summary>
            /// Refresh the browser
            /// </summary>
            public void Refresh()
            {
                driver.Execute(DriverCommand.Refresh, null);
            }
        }

        /// <summary>
        /// Provides a mechanism for finding elements on the page with locators.
        /// </summary>
        private class RemoteTargetLocator : ITargetLocator
        {
            private RemoteWebDriver driver;

            /// <summary>
            /// Initializes a new instance of the RemoteTargetLocator class
            /// </summary>
            /// <param name="driver">The driver that is currently in use</param>
            public RemoteTargetLocator(RemoteWebDriver driver)
            {
                this.driver = driver;
            }

            /// <summary>
            /// Move to a different frame using its index
            /// </summary>
            /// <param name="frameIndex">The index of the </param>
            /// <returns>A WebDriver instance that is currently in use</returns>
            public IWebDriver Frame(int frameIndex)
            {
                Dictionary<string, object> parameters = new Dictionary<string, object>();
                parameters.Add("id", frameIndex);
                driver.Execute(DriverCommand.SwitchToFrame, new object[] { parameters });
                return driver;
            }

            /// <summary>
            /// Move to different frame using its name
            /// </summary>
            /// <param name="frameName">name of the frame</param>
            /// <returns>A WebDriver instance that is currently in use</returns>
            public IWebDriver Frame(string frameName)
            {
                if (frameName == null)
                {
                    throw new ArgumentNullException("frameName", "Frame name cannot be null");
                }

                Dictionary<string, object> parameters = new Dictionary<string, object>();
                parameters.Add("id", frameName);
                driver.Execute(DriverCommand.SwitchToFrame, new object[] { parameters });
                return driver;
            }

            /// <summary>
            /// Change to the Window by passing in the name
            /// </summary>
            /// <param name="windowName">name of the window that you wish to move to</param>
            /// <returns>A WebDriver instance that is currently in use</returns>
            public IWebDriver Window(string windowName)
            {
                Dictionary<string, object> parameters = new Dictionary<string, object>();
                parameters.Add("name", windowName);
                driver.Execute(DriverCommand.SwitchToWindow, new object[] { parameters });
                return driver;
            }

            /// <summary>
            /// Change the active frame to the default 
            /// </summary>
            /// <returns>Element of the default</returns>
            public IWebDriver DefaultContent()
            {
                Dictionary<string, object> parameters = new Dictionary<string, object>();
                parameters.Add("id", null);
                driver.Execute(DriverCommand.SwitchToFrame, new object[] { parameters });
                return driver;
            }

            /// <summary>
            /// Finds the active element on the page and returns it
            /// </summary>
            /// <returns>Element that is active</returns>
            public IWebElement ActiveElement()
            {
                Response response = driver.Execute(DriverCommand.GetActiveElement, null);
                return driver.GetElementFromResponse(response);
            }
        }
    }
}
