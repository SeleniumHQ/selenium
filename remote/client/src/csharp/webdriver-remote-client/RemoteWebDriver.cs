using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.Globalization;
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
        #region Private members
        private ICommandExecutor executor;
        private ICapabilities capabilities;
        private SessionId sessionId;
        #endregion

        #region Constructors
        /// <summary>
        /// Initializes a new instance of the RemoteWebDriver class
        /// </summary>
        /// <param name="commandExecutor">An <see cref="ICommandExecutor"/> object which executes commands for the driver.</param>
        /// <param name="desiredCapabilities">An <see cref="ICapabilities"/> object containing the desired capabilities of the browser.</param>
        public RemoteWebDriver(ICommandExecutor commandExecutor, ICapabilities desiredCapabilities)
        {
            executor = commandExecutor;
            StartClient();
            StartSession(desiredCapabilities);
        }

        /// <summary>
        /// Initializes a new instance of the RemoteWebDriver class. This constructor defaults proxy to http://127.0.0.1:4444/wd/hub
        /// </summary>
        /// <param name="desiredCapabilities">An <see cref="ICapabilities"/> object containing the desired capabilities of the browser.</param>
        public RemoteWebDriver(ICapabilities desiredCapabilities)
            : this(new Uri("http://127.0.0.1:4444/wd/hub"), desiredCapabilities)
        {
        }

        /// <summary>
        /// Initializes a new instance of the RemoteWebDriver class
        /// </summary>
        /// <param name="remoteAddress">URI containing the address of the WebDriver remote server (e.g. http://127.0.0.1:4444/wd/hub).</param>
        /// <param name="desiredCapabilities">An <see cref="ICapabilities"/> object containing the desired capabilities of the browser.</param>
        public RemoteWebDriver(Uri remoteAddress, ICapabilities desiredCapabilities)
            : this(new HttpCommandExecutor(remoteAddress), desiredCapabilities)
        {
        }
        #endregion

        #region IWebDriver Properties
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

                Dictionary<string, object> parameters = new Dictionary<string, object>();
                parameters.Add("url", value);

                try
                {
                    Execute(DriverCommand.Get, parameters);
                }
                catch (WebDriverException)
                {
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
        #endregion

        #region Public properties
        /// <summary>
        /// Gets the capabilities that the RemoteWebDriver instance is currently using
        /// </summary>
        public ICapabilities Capabilities
        {
            get { return capabilities; }
        }

        /// <summary>
        /// Gets a value indicating whether JavaScript is enabled for this browser.
        /// </summary>
        public bool IsJavaScriptEnabled
        {
            get { return capabilities.IsJavaScriptEnabled; }
        }
        #endregion

        #region Protected properties
        /// <summary>
        /// Gets the <see cref="ICommandExecutor"/> which executes commands for this driver.
        /// </summary>
        protected ICommandExecutor CommandExecutor
        {
            get { return executor; }
        }

        /// <summary>
        /// Gets the <see cref="SessionId"/> for the current session of this driver.
        /// </summary>
        protected SessionId SessionId
        {
            get { return sessionId; }
        }
        #endregion

        #region IWebDriver methods
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
        /// <seealso cref="IOptions"/>
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
        #endregion

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

            Response commandResponse = Execute(DriverCommand.ExecuteScript, parameters);
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
            return FindElement("id", id);
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
            return FindElements("id", id);
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
            return FindElement("class name", className);
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
            return FindElements("class name", className);
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
            return FindElement("link text", linkText);
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
            return FindElements("link text", linkText);
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
            return FindElement("partial link text", partialLinkText);
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
            return FindElements("partial link text", partialLinkText);
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
            return FindElement("name", name);
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
            return FindElements("name", name);
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
            return FindElement("tag name", tagName);
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
            return FindElements("tag name", tagName);
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
            return FindElement("xpath", xpath);
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
            return FindElements("xpath", xpath);
        }
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
        internal Response InternalExecute(DriverCommand driverCommandToExecute, Dictionary<string, object> parameters)
        {
            return Execute(driverCommandToExecute, parameters);
        }

        /// <summary>
        /// Find the element in the response
        /// </summary>
        /// <param name="response">Reponse from the browser</param>
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
                string id = (string)elementDictionary["ELEMENT"];
                element = CreateElement(id);
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
                    string id = (string)elementDictionary["ELEMENT"];
                    RemoteWebElement element = CreateElement(id);
                    toReturn.Add(element);
                }
            }

            return toReturn.AsReadOnly();
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
            Dictionary<string, object> parameters = new Dictionary<string, object>();
            parameters.Add("desiredCapabilities", desiredCapabilities);
            Response response = Execute(DriverCommand.NewSession, parameters);

            Dictionary<string, object> rawCapabilities = (Dictionary<string, object>)response.Value;
            DesiredCapabilities returnedCapabilities = new DesiredCapabilities();

            string browser = (string)rawCapabilities["browserName"];
            string version = (string)rawCapabilities["version"];
            
            Platform platform;
            if (rawCapabilities.ContainsKey("platform"))
            {
                platform = new Platform((PlatformType)Enum.Parse(typeof(PlatformType), (string)rawCapabilities["platform"], true));
            }
            else
            {
                platform = new Platform(PlatformType.Any);
            }

            returnedCapabilities.IsJavaScriptEnabled = (bool)rawCapabilities["javascriptEnabled"];
            returnedCapabilities.Platform = platform;
            capabilities = returnedCapabilities;
            sessionId = new SessionId(response.SessionId);
        }

        /// <summary>
        /// Executes a command with this driver .
        /// </summary>
        /// <param name="driverCommandToExecute">A <see cref="DriverCommand"/> value representing the command to execute.</param>
        /// <param name="parameters">A <see cref="Dictionary{K, V}"/> containing the names and values of the parameters of the command.</param>
        /// <returns>A <see cref="Response"/> containing information about the success or failure of the command and any data returned by the command.</returns>
        protected virtual Response Execute(DriverCommand driverCommandToExecute, Dictionary<string, object> parameters)
        {
            Command commandToExecute = new Command(sessionId, driverCommandToExecute, parameters);

            Response commandResponse = new Response();

            try
            {
                commandResponse = executor.Execute(commandToExecute);
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
            Response commandResponse = Execute(DriverCommand.FindElement, parameters);
            return GetElementFromResponse(commandResponse);
        }

        /// <summary>
        /// Finds all elements matching the given mechanism and value.
        /// </summary>
        /// <param name="mechanism">The mechanism by which to find the elements.</param>
        /// <param name="value">The value to use to search for the elements.</param>
        /// <returns>A collection of all of the <see cref="IWebElement">IWebElements</see> matchings the given criteria.</returns>
        protected ReadOnlyCollection<IWebElement> FindElements(string mechanism, string value)
        {
            Dictionary<string, object> parameters = new Dictionary<string, object>();
            parameters.Add("using", mechanism);
            parameters.Add("value", value);
            Response commandResponse = Execute(DriverCommand.FindElements, parameters);
            return GetElementsFromResponse(commandResponse);
        }

        /// <summary>
        /// Creates a <see cref="RemoteWebElement"/> with the specified ID.
        /// </summary>
        /// <param name="elementId">The ID of this element.</param>
        /// <returns>A <see cref="RemoteWebElement"/> with the specified ID.</returns>
        protected virtual RemoteWebElement CreateElement(string elementId)
        {
            RemoteWebElement toReturn;
            if (capabilities.IsJavaScriptEnabled)
            {
                toReturn = new RenderedRemoteWebElement(this, elementId);
            }
            else
            {
                toReturn = new RemoteWebElement(this, elementId);
            }

            return toReturn;
        }
        #endregion

        #region Private methods
        private static object ConvertObjectToJavaScriptObject(object arg)
        {
            RemoteWebElement argAsElement = arg as RemoteWebElement;
            object converted = null;

            if (arg is string || arg is float || arg is double || arg is int || arg is long || arg is bool || arg == null)
            {
                converted = arg;
            }
            else if (argAsElement != null)
            {
                Dictionary<string, object> elementDictionary = new Dictionary<string, object>();
                elementDictionary.Add("ELEMENT", argAsElement.InternalElementId);
                converted = elementDictionary;
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

                        case WebDriverResult.NotImplemented:
                            throw new NotImplementedException(errorMessage);

                        case WebDriverResult.ObsoleteElement:
                            throw new StaleElementReferenceException(errorMessage);

                        case WebDriverResult.ElementNotDisplayed:
                            throw new ElementNotVisibleException(errorMessage);

                        case WebDriverResult.ElementNotEnabled:
                            if (errorMessage.ToLowerInvariant().Contains("toggle") || errorMessage.Contains("single element"))
                            {
                                throw new NotImplementedException(errorMessage);
                            }

                            throw new NotSupportedException(errorMessage);

                        case WebDriverResult.UnhandledError:
                            if (errorMessage.Contains("script"))
                            {
                                throw new InvalidOperationException(errorMessage);
                            }

                            if (errorMessage.Contains("frame"))
                            {
                                throw new NoSuchFrameException(errorMessage);
                            }

                            throw new WebDriverException(errorMessage);

                        case WebDriverResult.ElementNotSelected:
                            throw new NotSupportedException(errorMessage);

                        case WebDriverResult.NoSuchDocument:
                            throw new NoSuchElementException(errorMessage);

                        case WebDriverResult.Timeout:
                            throw new TimeoutException("The driver reported that the command timed out. There may "
                                                       + "be several reasons for this. Check that the destination"
                                                       + "site is in IE's 'Trusted Sites' (accessed from Tools->"
                                                       + "Internet Options in the 'Security' tab) If it is a "
                                                       + "trusted site, then the request may have taken more than"
                                                       + "a minute to finish.");

                        case WebDriverResult.NoSuchWindow:
                            throw new NoSuchWindowException(errorMessage);

                        case WebDriverResult.InvalidCookieDomain:
                        case WebDriverResult.UnableToSetCookie:
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
                if (resultAsDictionary.ContainsKey("ELEMENT"))
                {
                    string id = (string)resultAsDictionary["ELEMENT"];
                    RemoteWebElement element = CreateElement(id);
                    returnValue = element;
                }
                else
                {
                    returnValue = resultAsDictionary;
                }
            }
            else if (resultAsArray != null)
            {
                bool allElementsAreWebElements = true;
                List<object> toReturn = new List<object>();
                foreach (object item in resultAsArray)
                {
                    object parsedItem = ParseJavaScriptReturnValue(item);
                    IWebElement parsedItemAsElement = parsedItem as IWebElement;
                    if (parsedItemAsElement == null)
                    {
                        allElementsAreWebElements = false;
                    }

                    toReturn.Add(parsedItem);
                }

                if (allElementsAreWebElements)
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

            #region IOptions
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
                    Dictionary<string, object> parameters = new Dictionary<string, object>();
                    parameters.Add("speed", value.Description.ToUpperInvariant());
                    driver.Execute(DriverCommand.SetSpeed, parameters);
                }
            }

            /// <summary>
            /// Method for creating a cookie in the browser
            /// </summary>
            /// <param name="cookie"><see cref="Cookie"/> that represents a cookie in the browser</param>
            public void AddCookie(Cookie cookie)
            {
                Dictionary<string, object> parameters = new Dictionary<string, object>();
                parameters.Add("cookie", cookie);
                driver.Execute(DriverCommand.AddCookie, parameters);
            }

            /// <summary>
            /// Delete the cookie by passing in the name of the cookie
            /// </summary>
            /// <param name="name">The name of the cookie that is in the browser</param>
            public void DeleteCookieNamed(string name)
            {
                Dictionary<string, object> parameters = new Dictionary<string, object>();
                parameters.Add("name", name);
                driver.Execute(DriverCommand.DeleteCookie, parameters);
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

                                string path = "/";
                                if (cookie.ContainsKey("path"))
                                {
                                    path = cookie["path"].ToString();
                                }

                                string domain = string.Empty;
                                if (cookie.ContainsKey("domain"))
                                {
                                    domain = cookie["domain"].ToString();
                                }

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

            /// <summary>
            /// Provides access to the timeouts defined for this driver.
            /// </summary>
            /// <returns>An object implementing the <see cref="ITimeouts"/> interface.</returns>
            public ITimeouts Timeouts()
            {
                return new RemoteTimeouts(driver);
            }

            /// <summary>
            /// Defines the interface through which the user can define timeouts.
            /// </summary>
            private class RemoteTimeouts : ITimeouts
            {
                private RemoteWebDriver driver;

                /// <summary>
                /// Initializes a new instance of the RemoteTimeouts class
                /// </summary>
                /// <param name="driver">The driver that is currently in use</param>
                public RemoteTimeouts(RemoteWebDriver driver)
                {
                    this.driver = driver;
                }

                #region ITimeouts Members
                /// <summary>
                /// Specifies the amount of time the driver should wait when searching for an
                /// element if it is not immediately present.
                /// </summary>
                /// <param name="timeToWait">A <see cref="TimeSpan"/> structure defining the amount of time to wait.</param>
                /// <returns>A self reference</returns>
                /// <remarks>
                /// When searching for a single element, the driver should poll the page
                /// until the element has been found, or this timeout expires before throwing
                /// a <see cref="NoSuchElementException"/>. When searching for multiple elements,
                /// the driver should poll the page until at least one element has been found
                /// or this timeout has expired.
                /// <para>
                /// Increasing the implicit wait timeout should be used judiciously as it
                /// will have an adverse effect on test run time, especially when used with
                /// slower location strategies like XPath.
                /// </para>
                /// </remarks>
                public ITimeouts ImplicitlyWait(TimeSpan timeToWait)
                {
                    Dictionary<string, object> parameters = new Dictionary<string, object>();
                    parameters.Add("ms", timeToWait.TotalMilliseconds);
                    Response response = driver.Execute(DriverCommand.ImplicitlyWait, parameters);
                    return this;
                }
                #endregion
            }
            #endregion
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

            #region INavigation members
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
            #endregion
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

            #region ITargetLocator members
            /// <summary>
            /// Move to a different frame using its index
            /// </summary>
            /// <param name="frameIndex">The index of the </param>
            /// <returns>A WebDriver instance that is currently in use</returns>
            public IWebDriver Frame(int frameIndex)
            {
                Dictionary<string, object> parameters = new Dictionary<string, object>();
                parameters.Add("id", frameIndex);
                driver.Execute(DriverCommand.SwitchToFrame, parameters);
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
                driver.Execute(DriverCommand.SwitchToFrame, parameters);
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
                driver.Execute(DriverCommand.SwitchToWindow, parameters);
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
                driver.Execute(DriverCommand.SwitchToFrame, parameters);
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
            #endregion
        }
    }
}
