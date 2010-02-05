using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.Globalization;
using System.IO;

using OpenQA.Selenium.Internal;
using OpenQA.Selenium.Remote;

namespace OpenQA.Selenium.Chrome
{
    /// <summary>
    /// Provides a mechanism to write tests against Chrome
    /// </summary>
    /// <example>
    /// <code>
    /// [TestFixture]
    /// public class Testing
    /// {
    ///     private IWebDriver driver;
    ///     <para></para>
    ///     [SetUp]
    ///     public void SetUp()
    ///     {
    ///         driver = new ChromeDriver();
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
    public class ChromeDriver : IWebDriver, ISearchContext, IJavaScriptExecutor,
      IFindsById, IFindsByClassName, IFindsByLinkText, IFindsByPartialLinkText, IFindsByName, IFindsByTagName,
      IFindsByXPath, IFindsByCssSelector
    {
        private const int MaxStartRetries = 5;
        private ChromeCommandExecutor executor;
        private ChromeBinary chromeBinary;
        
        #region Constructors
        /// <summary>
        /// Initializes a new instance of the ChromeDriver class with the required extension loaded, and has it connect to a new ChromeCommandExecutor on its port
        /// </summary>
        public ChromeDriver()
            : this(new ChromeProfile(), new ChromeExtension())
        {
        }

        /// <summary>
        /// Initializes a new instance of the ChromeDriver class using the specified profile and extension.
        /// </summary>
        /// <param name="profile">The profile to use.</param>
        /// <param name="extension">The extension to use.</param>
        private ChromeDriver(ChromeProfile profile, ChromeExtension extension)
        {
            chromeBinary = new ChromeBinary(profile, extension);
            executor = new ChromeCommandExecutor();
            StartClient();
        }
        #endregion

        #region Properties
        /// <summary>
        /// Gets or sets the Url of the page
        /// </summary>
        public string Url
        {
            get { return Execute(DriverCommand.GetCurrentUrl).Value.ToString(); }
            set { Execute(DriverCommand.Get, value); }
        }

        /// <summary>
        /// Gets the page source of the page under test
        /// </summary>
        public string PageSource
        {
            get { return Execute(DriverCommand.GetPageSource).Value.ToString(); }
        }

        /// <summary>
        /// Gets the title of the page
        /// </summary>
        public string Title
        {
            get { return Execute(DriverCommand.GetTitle).Value.ToString(); }
        }
        #endregion

        #region public methods
        /// <summary>
        /// Executes a passed command using the current ChromeCommandExecutor
        /// </summary>
        /// <param name="driverCommand">command to execute</param>
        /// <param name="parameters">parameters of command being executed</param>
        /// <returns>response to the command (a Response wrapping a null value if none)</returns>
        public ChromeResponse Execute(DriverCommand driverCommand, params object[] parameters)
        {
            ChromeCommand command = new ChromeCommand(
                new SessionId(
                    "[No sessionId]"),
                new Context("[No context]"),
                driverCommand,
                parameters);
            ChromeResponse commandResponse = null;
            try
            {
                commandResponse = executor.Execute(command);
            }
            catch (NotSupportedException nse)
            {
                string message = nse.Message.ToLower();
                if (message.Contains("cannot toggle a") || message.Contains("cannot unselect a single element select"))
                {
                    throw new NotImplementedException();
                }

                throw;
            }
            catch (Exception)
            {
                // Exceptions may leave the extension hung, or in an
                // inconsistent state, so we restart Chrome
                StopClient();
                StartClient();
            }

            return commandResponse;
        }
        
        /// <summary>
        /// Close the Browser
        /// </summary>
        public void Close()
        {
            Execute(DriverCommand.Close);
        }

        /// <summary>
        /// Find the element on the page
        /// </summary>
        /// <param name="by">By mechanism</param>
        /// <returns>A object of the Element</returns>
        public IWebElement FindElement(By by)
        {
            return by.FindElement(this);
        }

        /// <summary>
        /// Finds the elements using the By Mechanism
        /// </summary>
        /// <param name="by">By Mechanism</param>
        /// <returns>A collection of Web Elements</returns>
        public ReadOnlyCollection<IWebElement> FindElements(By by)
        {
            return by.FindElements(this);
        }

        /// <summary>
        /// Gets the Window Handle
        /// </summary>
        /// <returns>returns a string with the window handle</returns>
        public string GetWindowHandle()
        {
            return Execute(DriverCommand.GetCurrentWindowHandle).Value.ToString();
        }

        /// <summary>
        /// Gets the Window Handle
        /// </summary>
        /// <returns>returns a collection of string with the window handle</returns>
        public ReadOnlyCollection<string> GetWindowHandles()
        {
            object[] windowHandles = (object[]) Execute(DriverCommand.GetWindowHandles).Value;
            List<string> setOfHandles = new List<string>();
            foreach (string windowHandle in windowHandles)
            {
                setOfHandles.Add(windowHandle);
            }

            return setOfHandles.AsReadOnly();
        }

        /// <summary>
        /// Gives access to setting options on the browser
        /// </summary>
        /// <returns>Options instance</returns>
        public IOptions Manage()
        {
            return new ChromeOptions(this);
        }

        /// <summary>
        /// Gives access to navigating within the test
        /// </summary>
        /// <returns>Navigation instance</returns>
        public INavigation Navigate()
        {
            return new ChromeNavigation(this);
        }

        /// <summary>
        /// Causes the test to end and close the browser
        /// </summary>
        public void Quit()
        {
            try
            {
                Execute(DriverCommand.Quit);
            }
            finally
            {
                StopClient();
            }
        }

        /// <summary>
        /// Gives access to switch to another element
        /// </summary>
        /// <returns>Target locator object</returns>
        public ITargetLocator SwitchTo()
        {
            return new ChromeTargetLocator(this);
        }

        /// <summary>
        /// Execute JavaScript on the page
        /// </summary>
        /// <param name="script">JavaScript to be executed</param>
        /// <param name="args">Arguments needed for the script</param>
        /// <returns>The response from the call</returns>
        public object ExecuteScript(string script, params object[] args)
        {
            object[] convertedArgs = ConvertArgumentsToJavaScriptObjects(args);
            ChromeResponse response = Execute(DriverCommand.ExecuteScript, script, convertedArgs);
            object result = ParseJavaScriptReturnValue(response.Value);
            return result;
        }
        
        /// <summary>
        /// Indicates whether the browser is javascript enabled
        /// </summary>
        /// <returns>A value indicating if it enabled</returns>
        public bool IsJavascriptEnabled()
        {
            return true;
        }

        /// <summary>
        /// Finds the first element matching the specified id.
        /// </summary>
        /// <param name="id">The id to match.</param>
        /// <returns>The first <see cref="IWebElement"/> matching the criteria.</returns>
        public IWebElement FindElementById(string id)
        {
            return GetElementFrom(Execute(DriverCommand.FindElement, "id", id));
        }

        /// <summary>
        /// Finds all elements matching the specified id.
        /// </summary>
        /// <param name="id">The id to match.</param>
        /// <returns>A <see cref="ReadOnlyCollection{T}"/> containing all
        /// <see cref="IWebElement">IWebElements</see> matching the criteria.</returns>
        public ReadOnlyCollection<IWebElement> FindElementsById(string id)
        {
            return GetElementsFrom(Execute(DriverCommand.FindElements, "id", id));
        }

        /// <summary>
        /// Finds the first element matching the specified CSS class.
        /// </summary>
        /// <param name="className">The CSS class to match.</param>
        /// <returns>The first <see cref="IWebElement"/> matching the criteria.</returns>
        public IWebElement FindElementByClassName(string className)
        {
            return GetElementFrom(Execute(DriverCommand.FindElement, "class name", className));
        }

        /// <summary>
        /// Finds all elements matching the specified CSS class.
        /// </summary>
        /// <param name="className">The CSS class to match.</param>
        /// <returns>A <see cref="ReadOnlyCollection{T}"/> containing all
        /// <see cref="IWebElement">IWebElements</see> matching the criteria.</returns>
        public ReadOnlyCollection<IWebElement> FindElementsByClassName(string className)
        {
            return GetElementsFrom(Execute(DriverCommand.FindElements, "class name", className));
        }

        /// <summary>
        /// Finds the first element matching the specified link text.
        /// </summary>
        /// <param name="linkText">The link text to match.</param>
        /// <returns>The first <see cref="IWebElement"/> matching the criteria.</returns>
        public IWebElement FindElementByLinkText(string linkText)
        {
            return GetElementFrom(Execute(DriverCommand.FindElement, "link text", linkText));
        }

        /// <summary>
        /// Finds all elements matching the specified link text.
        /// </summary>
        /// <param name="linkText">The link text to match.</param>
        /// <returns>A <see cref="ReadOnlyCollection{T}"/> containing all
        /// <see cref="IWebElement">IWebElements</see> matching the criteria.</returns>
        public ReadOnlyCollection<IWebElement> FindElementsByLinkText(string linkText)
        {
            return GetElementsFrom(Execute(DriverCommand.FindElements, "link text", linkText));
        }

        /// <summary>
        /// Finds the first element matching the specified name.
        /// </summary>
        /// <param name="name">The name to match.</param>
        /// <returns>The first <see cref="IWebElement"/> matching the criteria.</returns>
        public IWebElement FindElementByName(string name)
        {
            return GetElementFrom(Execute(DriverCommand.FindElement, "name", name));
        }

        /// <summary>
        /// Finds all elements matching the specified name.
        /// </summary>
        /// <param name="name">The name to match.</param>
        /// <returns>A <see cref="ReadOnlyCollection{T}"/> containing all
        /// <see cref="IWebElement">IWebElements</see> matching the criteria.</returns>
        public ReadOnlyCollection<IWebElement> FindElementsByName(string name)
        {
            return GetElementsFrom(Execute(DriverCommand.FindElements, "name", name));
        }

        /// <summary>
        /// Finds the first element matching the specified tag name.
        /// </summary>
        /// <param name="tagName">The tag name to match.</param>
        /// <returns>The first <see cref="IWebElement"/> matching the criteria.</returns>
        public IWebElement FindElementByTagName(string tagName)
        {
            return GetElementFrom(Execute(DriverCommand.FindElement, "tag name", tagName));
        }

        /// <summary>
        /// Finds all elements matching the specified tag name.
        /// </summary>
        /// <param name="tagName">The tag name to match.</param>
        /// <returns>A <see cref="ReadOnlyCollection{T}"/> containing all
        /// <see cref="IWebElement">IWebElements</see> matching the criteria.</returns>
        public ReadOnlyCollection<IWebElement> FindElementsByTagName(string tagName)
        {
            return GetElementsFrom(Execute(DriverCommand.FindElements, "tag name", tagName));
        }

        /// <summary>
        /// Finds an element by xpath
        /// </summary>
        /// <param name="xpath">xpath to element</param>
        /// <returns>The element found</returns>
        public IWebElement FindElementByXPath(string xpath)
        {
            return GetElementFrom(Execute(DriverCommand.FindElement, "xpath", xpath));
        }

        /// <summary>
        /// Finds all elements that match the xpath
        /// </summary>
        /// <param name="xpath">Xpath to element</param>
        /// <returns>A collection of elements</returns>
        public ReadOnlyCollection<IWebElement> FindElementsByXPath(string xpath)
        {
            return GetElementsFrom(Execute(DriverCommand.FindElements, "xpath", xpath));
        }

        /// <summary>
        /// Finds the first element matching the specified partial link text.
        /// </summary>
        /// <param name="partialLinkText">The partial link text to match.</param>
        /// <returns>The first <see cref="IWebElement"/> matching the criteria.</returns>
        public IWebElement FindElementByPartialLinkText(string partialLinkText)
        {
            return GetElementFrom(Execute(DriverCommand.FindElement, "partial link text", partialLinkText));
        }

        /// <summary>
        /// Finds all elements matching the specified partial link text.
        /// </summary>
        /// <param name="partialLinkText">The partial link text to match.</param>
        /// <returns>A <see cref="ReadOnlyCollection{T}"/> containing all
        /// <see cref="IWebElement">IWebElements</see> matching the criteria.</returns>
        public ReadOnlyCollection<IWebElement> FindElementsByPartialLinkText(string partialLinkText)
        {
            return GetElementsFrom(Execute(DriverCommand.FindElements, "partial link text", partialLinkText));
        }

        /// <summary>
        /// Finds the first element that matches the CSS Selector
        /// </summary>
        /// <param name="cssSelector">CSS Selector</param>
        /// <returns>A Web Element</returns>
        public IWebElement FindElementByCssSelector(string cssSelector)
        {
            return GetElementFrom(Execute(DriverCommand.FindElement, "css", cssSelector));
        }

        /// <summary>
        /// Finds all the elements that match the CSS Selection
        /// </summary>
        /// <param name="cssSelector">CSS Selector</param>
        /// <returns>A collection of elements that match</returns>
        public ReadOnlyCollection<IWebElement> FindElementsByCssSelector(string cssSelector)
        {
            return GetElementsFrom(Execute(DriverCommand.FindElements, "css", cssSelector));
        }

        /// <summary>
        /// Gets the element from the response coming back from Chrome
        /// </summary>
        /// <param name="response">The Chrome Response</param>
        /// <returns>A Web Element if the Item is found</returns>
        /// <exception cref="NoSuchElementException">Thrown if the item isn't found</exception>
        public IWebElement GetElementFrom(ChromeResponse response)
        {
            if (response != null)
            {
                object result = response.Value;
                object[] elements = (object[])result;
                return new ChromeWebElement(this, (string)elements[0]);
            }

            throw new NoSuchElementException();
        }

        /// <summary>
        /// Gets the elements from the response coming back from Chrome
        /// </summary>
        /// <param name="response">The Chrome Response</param>
        /// <returns>A readonlycollection of WebElement</returns>
        public ReadOnlyCollection<IWebElement> GetElementsFrom(ChromeResponse response)
        {
            List<IWebElement> elements = new List<IWebElement>();
            object[] result = response.Value as object[];
            if (result != null)
            {
                foreach (object element in result)
                {
                    elements.Add(new ChromeWebElement(this, (string)element));
                }
            }

            return new ReadOnlyCollection<IWebElement>(elements);
        }

        /// <summary>
        /// Finds all Child elements of an Element
        /// </summary>
        /// <param name="parent">Parent element</param>
        /// <param name="by">By Mechanism</param>
        /// <param name="search">Search String</param>
        /// <returns>Collection of elements that meet the criteria</returns>
        public ReadOnlyCollection<IWebElement> FindChildElements(ChromeWebElement parent, string by, string search)
        {
            return GetElementsFrom(Execute(DriverCommand.FindChildElements, parent, by, search));
        }

        #region IDisposable Members
        /// <summary>
        /// Dispose of the browser. Not currently implemented
        /// </summary>
        public void Dispose()
        {
            throw new NotImplementedException();
        }

        #endregion

        #endregion

        #region Protected Methods
        /// <summary>
        /// By default will try to load Chrome from system property
        /// webdriver.chrome.bin and the extension from
        /// webdriver.chrome.extensiondir.  If the former fails, will try to guess the
        /// path to Chrome.  If the latter fails, will try to unzip from the JAR we 
        /// hope we're in.  If these fail, throws exceptions.
        /// </summary>
        protected void StartClient()
        {
            int retries = MaxStartRetries;
            while (retries > 0 && !executor.HasClient)
            {
                StopClient();
                try
                {
                    executor.StartListening();
                    chromeBinary.Start(GetServerUrl());
                }
                catch (IOException e)
                {
                    throw new WebDriverException("Could not start client", e);
                }

                if (!executor.HasClient)
                {
                    // In case this attempt fails, we increment how long we wait before sending a command
                    chromeBinary.IncrementStartWaitInterval(1);
                }

                retries--;
            }

            // The last one attempt succeeded, so we reduce back to that time
            // chromeBinary.IncrementBackoffBy(-1);
            if (!executor.HasClient)
            {
                StopClient();
                throw new FatalChromeException("Cannot create chrome driver");
            }
        }

        /// <summary>
        /// Kills the started Chrome process and ChromeCommandExecutor if they exist
        /// </summary>
        protected void StopClient()
        {
            chromeBinary.Kill();
            executor.StopListening();
        }

        /// <summary>
        /// Get the Server URL of the Chrome Server
        /// </summary>
        /// <returns>Server for Chrome Commands</returns>
        protected string GetServerUrl()
        {
            return "http://localhost:" + executor.Port + "/chromeCommandExecutor";
        }
        #endregion

        #region Private Methods
        private static object ConvertObjectToJavaScriptObject(object arg)
        {
            ChromeWebElement argAsElement = arg as ChromeWebElement;
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
                converted.Add("value", argAsElement.ElementId);
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

        private object ParseJavaScriptReturnValue(object responseValue)
        {
            object returnValue = null;

            Dictionary<string, object> result = responseValue as Dictionary<string, object>;
            object[] resultAsArray = responseValue as object[];
            if (result != null)
            {
                string type = (string)result["type"];
                if (type != "NULL")
                {
                    if (type == "ELEMENT")
                    {
                        string[] parts = result["value"].ToString().Split(new string[] { "/" }, StringSplitOptions.None);
                        string elementId = parts[parts.Length - 1];
                        ChromeWebElement element = new ChromeWebElement(this, elementId);
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
            }
            else if (resultAsArray != null)
            {
                List<object> returnList = new List<object>();
                foreach (object item in resultAsArray)
                {
                    returnList.Add(ParseJavaScriptReturnValue(item));
                }

                returnValue = returnList;
            }

            return returnValue;
        }
        #endregion

        // TODO(AndreNogueira): implement
        // public <X> X getScreenshotAs(OutputType<X> target) {
        //  return target.convertFromBase64Png(Execute(DriverCommand.Screenshot).Value.ToString());
        // }

        /// <summary>
        /// Provides a mechanism to add options to the browser
        /// </summary>
        private class ChromeOptions : IOptions
        {
            private ChromeDriver instance;

            /// <summary>
            /// Initializes a new instance of the ChromeOptions class
            /// </summary>
            /// <param name="instance">Driver currently in use</param>
            public ChromeOptions(ChromeDriver instance)
            {
                this.instance = instance;
            }

            /// <summary>
            /// Gets or sets the speed of commands in Chrome. Not yet supported
            /// </summary>
            public Speed Speed
            {
                get { throw new NotImplementedException("Not yet supported in Chrome"); }
                set { throw new NotImplementedException("Not yet supported in Chrome"); }
            }

            /// <summary>
            /// Adds a cookie to the browser
            /// </summary>
            /// <param name="cookie">Instance of the cookie you wish to add</param>
            public void AddCookie(Cookie cookie)
            {
                // The extension expects a cookie as a JSON object, but as a string value
                // which will be reparsed on the extension side.
                Dictionary<string, object> cookieRepresentation = new Dictionary<string, object>();
                cookieRepresentation.Add("name", cookie.Name);
                cookieRepresentation.Add("value", cookie.Value);
                cookieRepresentation.Add("secure", cookie.Secure.ToString().ToLowerInvariant());

                if (!string.IsNullOrEmpty(cookie.Path))
                {
                    cookieRepresentation.Add("path", cookie.Path);
                }
                else
                {
                    cookieRepresentation.Add("path", string.Empty);
                }

                if (!string.IsNullOrEmpty(cookie.Domain))
                {
                    cookieRepresentation.Add("domain", cookie.Domain);
                }
                else
                {
                    cookieRepresentation.Add("domain", string.Empty);
                }

                if (cookie.Expiry != null)
                {
                    string dateValue = cookie.Expiry.Value.ToUniversalTime().ToString("ddd MM/dd/yyyy hh:mm:ss UTC", CultureInfo.InvariantCulture);
                    cookieRepresentation.Add("expiry", dateValue);
                }

                Execute(DriverCommand.AddCookie, new object[] { cookieRepresentation });
            }

            /// <summary>
            /// Delete all the Cookies
            /// </summary>
            public void DeleteAllCookies()
            {
                Execute(DriverCommand.DeleteAllCookies);
            }

            /// <summary>
            /// Delete a cookie by passing in a cookie object
            /// </summary>
            /// <param name="cookie">The cookie to be deleted</param>
            public void DeleteCookie(Cookie cookie)
            {
                Execute(DriverCommand.DeleteCookie, cookie.Name);
            }

            /// <summary>
            /// Delete a cookie by passing in the name
            /// </summary>
            /// <param name="name">Name of the cookie to be deleted</param>
            public void DeleteCookieNamed(string name)
            {
                Execute(DriverCommand.DeleteCookie, name);
            }

            /// <summary>
            /// Gets all the cookies available
            /// </summary>
            /// <returns>A readonly list of cookies</returns>
            public ReadOnlyCollection<Cookie> GetCookies()
            {
                List<Cookie> cookieList = new List<Cookie>();
                object[] result = Execute(DriverCommand.GetAllCookies).Value as object[];
                if (result != null)
                {
                    foreach (object rawCookie in result)
                    {
                        Dictionary<string, object> cookie = rawCookie as Dictionary<string, object>;
                        if (rawCookie != null)
                        {
                            string name = cookie["name"].ToString();
                            string value = cookie["value"].ToString();
                            cookieList.Add(new Cookie(name, value));
                        }
                    }
                }

                return new ReadOnlyCollection<Cookie>(cookieList);
            }

            /// <summary>
            /// Get a cookie by name
            /// </summary>
            /// <param name="name">Name of the cookie</param>
            /// <returns>A Cookie object if found else null</returns>
            public Cookie GetCookieNamed(string name)
            {
                // return (Cookie)Execute(DriverCommand.GetCookie, name).Value;
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
            /// Execute commands on the browser
            /// </summary>
            /// <param name="command">Command to be executed</param>
            /// <param name="arg">Any commands that the command requires</param>
            /// <returns>A response from Chrome</returns>
            public ChromeResponse Execute(DriverCommand command, params object[] arg)
            {
                return instance.Execute(command, arg);
            }
        }

        /// <summary>
        /// Provides a way to navigate
        /// </summary>
        private class ChromeNavigation : INavigation
        {
            private ChromeDriver instance;

            /// <summary>
            /// Initializes a new instance of the ChromeNavigation class
            /// </summary>
            /// <param name="instance">Driver currently in use</param>
            public ChromeNavigation(ChromeDriver instance)
            {
                this.instance = instance;
            }

            /// <summary>
            /// Make the browser go back
            /// </summary>
            public void Back()
            {
                Execute(DriverCommand.GoBack);
            }

            /// <summary>
            /// Make the browser go forward
            /// </summary>
            public void Forward()
            {
                Execute(DriverCommand.GoForward);
            }

            /// <summary>
            /// Navigate to the URL
            /// </summary>
            /// <param name="url">Server under test URL</param>
            public void GoToUrl(string url)
            {
                instance.Url = url;
            }

            /// <summary>
            /// Navigate to the URL
            /// </summary>
            /// <param name="url">Server under test URL</param>
            public void GoToUrl(Uri url)
            {
                if (url == null)
                {
                    throw new ArgumentNullException("url", "URL to go to cannot be null.");
                }

                instance.Url = url.AbsoluteUri;
            }

            /// <summary>
            /// Refresh the Browser
            /// </summary>
            public void Refresh()
            {
                Execute(DriverCommand.Refresh);
            }

            /// <summary>
            /// Execute commands on the browser
            /// </summary>
            /// <param name="command">Command to be executed</param>
            /// <param name="arg">Any commands that the command requires</param>
            /// <returns>A response from Chrome</returns>
            public ChromeResponse Execute(DriverCommand command, params object[] arg)
            {
                return instance.Execute(command, arg);
            }
        }

        /// <summary>
        /// Provides a mechanism to find targets on the page
        /// </summary>
        private class ChromeTargetLocator : ITargetLocator
        {
            private ChromeDriver instance;

            /// <summary>
            /// Initializes a new instance of the ChromeTargetLocator class
            /// </summary>
            /// <param name="instance">Driver currently in use</param>
            public ChromeTargetLocator(ChromeDriver instance)
            {
                this.instance = instance;
            }

            /// <summary>
            /// Finds the active element on the page
            /// </summary>
            /// <returns>The element on the page</returns>
            public IWebElement ActiveElement()
            {
                return instance.GetElementFrom(Execute(DriverCommand.GetActiveElement));
            }

            /// <summary>
            /// Finds the default content on the page
            /// </summary>
            /// <returns>The element on the page</returns>
            public IWebDriver DefaultContent()
            {
                Execute(DriverCommand.SwitchToDefaultContent);
                return instance;
            }

            /// <summary>
            /// Switch to a frame
            /// </summary>
            /// <param name="frameIndex">Name of the frame you want to switch to</param>
            /// <returns>The object of the frame</returns>
            public IWebDriver Frame(int frameIndex)
            {
                Execute(DriverCommand.SwitchToFrameByIndex, frameIndex);
                return instance;
            }

            /// <summary>
            /// Switch to a frame
            /// </summary>
            /// <param name="frameName">Name of the frame you want to switch to</param>
            /// <returns>The object of the frame</returns>
            public IWebDriver Frame(string frameName)
            {
                if (frameName == null)
                {
                    throw new ArgumentNullException();
                }

                Execute(DriverCommand.SwitchToFrameByName, frameName);
                return instance;
            }

            /// <summary>
            /// Switch to a window by name
            /// </summary>
            /// <param name="windowName">Name of the window</param>
            /// <returns>Window element</returns>
            public IWebDriver Window(string windowName)
            {
                Execute(DriverCommand.SwitchToWindow, windowName);
                return instance;
            }

            /// <summary>
            /// Execute commands on the browser
            /// </summary>
            /// <param name="command">Command to be executed</param>
            /// <param name="arg">Any commands that the command requires</param>
            /// <returns>A response from Chrome</returns>
            public ChromeResponse Execute(DriverCommand command, params object[] arg)
            {
                return instance.Execute(command, arg);
            }
        }
    }
}
