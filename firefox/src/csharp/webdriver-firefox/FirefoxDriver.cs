/* Copyright notice and license
Copyright 2007-2010 WebDriver committers
Copyright 2007-2010 Google Inc.
Portions copyright 2007 ThoughtWorks, Inc

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

     http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.Globalization;
using System.Text;
using System.Text.RegularExpressions;
using Newtonsoft.Json;
using OpenQA.Selenium.Firefox.Internal;
using OpenQA.Selenium.Internal;

namespace OpenQA.Selenium.Firefox
{
    /// <summary>
    /// Provides a way to access Firefox to run tests.
    /// </summary>
    /// <remarks>
    /// When the FirefoxDriver object has been instantiated the browser will load. The test can then navigate to the URL under test and 
    /// start your test.
    /// <para>
    /// In the case of the FirefoxDriver, you can specify a named profile to be used, or you can let the
    /// driver create a temporary, anonymous profile. A custom extension allowing the driver to communicate
    /// to the browser will be installed into the profile.
    /// </para>
    /// </remarks>
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
    ///         driver = new FirefoxDriver();
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
    ///         driver.Dispose();
    ///     } 
    /// }
    /// </code>
    /// </example>
    public class FirefoxDriver : IWebDriver, ISearchContext, IFindsById, IFindsByClassName, IFindsByLinkText, IFindsByName, IFindsByTagName, IFindsByXPath, IFindsByPartialLinkText, IFindsByCssSelector, IJavaScriptExecutor, ITakesScreenshot
    {
        #region Private members
        /// <summary>
        /// The default port on which to communicate with the Firefox extension.
        /// </summary>
        public static readonly int DefaultPort = 7055;

        /// <summary>
        /// Indicates whether native events is enabled by default for this platform.
        /// </summary>
        public static readonly bool DefaultEnableNativeEvents = Platform.CurrentPlatform.IsPlatformType(PlatformType.Windows);

        /// <summary>
        /// Indicates whether the driver will accept untrusted SSL certificates.
        /// </summary>
        public static readonly bool AcceptUntrustedCertificates = true;

        private ExtensionConnection extension;
        private Context context; 
        #endregion

        #region Constructors
        /// <summary>
        /// Initializes a new instance of the <see cref="FirefoxDriver"/> class.
        /// </summary>
        public FirefoxDriver() :
            this(new FirefoxBinary(), null)
        {
        }

        /// <summary>
        /// Initializes a new instance of the <see cref="FirefoxDriver"/> class for a given profile.
        /// </summary>
        /// <param name="profile">A <see cref="FirefoxProfile"/> object representing the profile settings
        /// to be used in starting Firefox.</param>
        public FirefoxDriver(FirefoxProfile profile) :
            this(new FirefoxBinary(), profile)
        {
        }

        /// <summary>
        /// Initializes a new instance of the <see cref="FirefoxDriver"/> class for a given profile and binary environment.
        /// </summary>
        /// <param name="binary">A <see cref="FirefoxBinary"/> object representing the operating system 
        /// environmental settings used when running Firefox.</param>
        /// <param name="profile">A <see cref="FirefoxProfile"/> object representing the profile settings
        /// to be used in starting Firefox.</param>
        public FirefoxDriver(FirefoxBinary binary, FirefoxProfile profile)
        {
            FirefoxProfile profileToUse = profile;

            // TODO (JimEvans): Provide a "named profile" override.
            // string suggestedProfile = System.getProperty("webdriver.firefox.profile");
            string suggestedProfile = null;
            if (profileToUse == null && suggestedProfile != null)
            {
                profileToUse = new FirefoxProfileManager().GetProfile(suggestedProfile);
            }
            else if (profileToUse == null)
            {
                profileToUse = new FirefoxProfile();
                profileToUse.AddExtension(false);
            }
            else
            {
                profileToUse.AddExtension(false);
            }

            PrepareEnvironment();

            extension = ConnectTo(binary, profileToUse, "localhost");
            FixSessionId();
        } 
        #endregion

        #region IWebDriver Properties
        /// <summary>
        /// Gets or sets the URL the browser is currently displaying.
        /// </summary>
        /// <remarks>
        /// Setting the <see cref="Url"/> property will load a new web page in the current browser window. 
        /// This is done using an HTTP GET operation, and the method will block until the 
        /// load is complete. This will follow redirects issued either by the server or 
        /// as a meta-redirect from within the returned HTML. Should a meta-redirect "rest"
        /// for any duration of time, it is best to wait until this timeout is over, since 
        /// should the underlying page change while your test is executing the results of 
        /// future calls against this interface will be against the freshly loaded page. 
        /// </remarks>
        /// <seealso cref="INavigation.GoToUrl(System.String)"/>
        /// <seealso cref="INavigation.GoToUrl(System.Uri)"/>
        public string Url
        {
            get
            {
                return SendMessage(typeof(WebDriverException), "getCurrentUrl");
            }

            set
            {
                try
                {
                    SendMessage(typeof(WebDriverException), "get", new object[] { value });
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
            get { return SendMessage(typeof(WebDriverException), "title"); }
        }

        /// <summary>
        /// Gets the source of the page last loaded by the browser.
        /// </summary>
        /// <remarks>
        /// If the page has been modified after loading (for example, by JavaScript) 
        /// there is no guarentee that the returned text is that of the modified page. 
        /// Please consult the documentation of the particular driver being used to 
        /// determine whether the returned text reflects the current state of the page 
        /// or the text last sent by the web server. The page source returned is a 
        /// representation of the underlying DOM: do not expect it to be formatted 
        /// or escaped in the same way as the response sent from the web server. 
        /// </remarks>
        public string PageSource
        {
            get { return SendMessage(typeof(WebDriverException), "getPageSource"); }
        }
        #endregion

        #region Support properties
        /// <summary>
        /// Gets the context for running commands using this <see cref="FirefoxDriver"/>.
        /// </summary>
        internal Context Context
        {
            get { return context; }
        }
        #endregion

        #region IWebDriver methods
        /// <summary>
        /// Finds the first <see cref="IWebElement"/> on the current page using the specified mechanism.
        /// </summary>
        /// <param name="mechanism">A <see cref="By"/> object describing the mechanism used to find the element.</param>
        /// <returns>The first <see cref="IWebElement"/> on the current page matching the criteria.</returns>
        /// <exception cref="NoSuchElementException">If no matching elements are found.</exception>
        /// <example>
        /// <code>
        /// IWebDriver driver = new FirefoxDriver();
        /// IWebElement elem = driver.FindElement(By.Name("q"));
        /// </code>
        /// </example>
        public IWebElement FindElement(By mechanism)
        {
            return mechanism.FindElement(this);
        }

        /// <summary>
        /// Finds all <see cref="IWebElement"/> on the current page using the specified mechanism.
        /// </summary>
        /// <param name="mechanism">A <see cref="By"/> object describing the mechanism used to find the element.</param>
        /// <returns>A <see cref="ReadOnlyCollection{T}"/> containing the <see cref="IWebElement">IWebElements</see>
        /// found on the page. If no matching elements are found, the collection will be empty.</returns>
        /// <example>
        /// <code>
        /// IWebDriver driver = new FirefoxDriver();
        /// ReadOnlyCollection&lt;IWebElement&gt; classList = driver.FindElements(By.ClassName("class"));
        /// </code>
        /// </example>
        public ReadOnlyCollection<IWebElement> FindElements(By mechanism)
        {
            return mechanism.FindElements(this);
        }

        /// <summary>
        /// Close the current window, quitting the browser if it is the last window currently open.
        /// </summary>
        public void Close()
        {
            try
            {
                SendMessage(typeof(WebDriverException), "close");
            }
            catch (WebDriverException)
            {
                // All good
            }
            catch (NullReferenceException)
            {
                // Still good
            }
        }

        /// <summary>
        /// Quits this driver, closing every associated window.
        /// </summary>
        public void Quit()
        {
            extension.Quit();
            Dispose();
        }

        /// <summary>
        /// Get the window handles of open browser windows.
        /// </summary>
        /// <returns>A <see cref="ReadOnlyCollection{T}"/> containing all window handles
        /// of windows belonging to this driver instance.</returns>
        /// <remarks>The set of window handles returned by this method can be used to 
        /// iterate over all open windows of this <see cref="IWebDriver"/> instance by 
        /// passing them to <c>SwitchTo().Window(string)</c></remarks>
        /// <example>
        /// <code>
        /// IWebDriver driver = new FirefoxDriver();
        /// ReadOnlyCollection&lt;string&gt; windowNames = driver.GetWindowHandles();
        /// driver.SwitchTo().Window(windowNames[0]);
        /// </code>
        /// </example>
        public ReadOnlyCollection<string> GetWindowHandles()
        {
            object[] allHandles = (object[])ExecuteCommand(typeof(WebDriverException), "getWindowHandles", null);
            List<string> toReturn = new List<string>();
            for (int i = 0; i < allHandles.Length; i++)
            {
                string handle = allHandles[i].ToString();
                if (handle != null)
                {
                    toReturn.Add(handle);
                }
            }

            return new ReadOnlyCollection<string>(toReturn);
        }

        /// <summary>
        /// Get the current window handle.
        /// </summary>
        /// <returns>An opaque handle to this window that uniquely identifies it 
        /// within this driver instance.</returns>
        /// <example>
        /// <code>
        /// IWebDriver driver = new FirefoxDriver();
        /// string windowName = driver.GetWindowHandle();
        /// </code>
        /// </example>
        public string GetWindowHandle()
        {
            return SendMessage(typeof(WebDriverException), "getCurrentWindowHandle");
        }

        /// <summary>
        /// Instructs the driver to change its settings.
        /// </summary>
        /// <returns>An <see cref="IOptions"/> object allowing the user to change
        /// the settings of the driver.</returns>
        public IOptions Manage()
        {
            return new FirefoxOptions(this);
        }

        /// <summary>
        /// Instructs the driver to navigate the browser to another location.
        /// </summary>
        /// <returns>An <see cref="INavigation"/> object allowing the user to access 
        /// the browser's history and to navigate to a given URL.</returns>
        public INavigation Navigate()
        {
            return new FirefoxNavigation(this);
        }

        /// <summary>
        /// Instructs the driver to send future commands to a different frame or window.
        /// </summary>
        /// <returns>An <see cref="ITargetLocator"/> object which can be used to select
        /// a frame or window.</returns>
        public ITargetLocator SwitchTo()
        {
            return new FirefoxTargetLocator(this);
        }

        #endregion

        #region IFindsById Members
        /// <summary>
        /// Finds the first element matching the specified id.
        /// </summary>
        /// <param name="id">The id to match.</param>
        /// <returns>The first <see cref="IWebElement"/> matching the criteria.</returns>
        public IWebElement FindElementById(string id)
        {
            return FindElement("id", id);
        }

        /// <summary>
        /// Finds all elements matching the specified id.
        /// </summary>
        /// <param name="id">The id to match.</param>
        /// <returns>A <see cref="ReadOnlyCollection{T}"/> containing all
        /// <see cref="IWebElement">IWebElements</see> matching the criteria.</returns>
        public ReadOnlyCollection<IWebElement> FindElementsById(string id)
        {
            return FindElements("id", id);
        }
        #endregion

        #region IFindsByName Members
        /// <summary>
        /// Finds the first element matching the specified name.
        /// </summary>
        /// <param name="name">The name to match.</param>
        /// <returns>The first <see cref="IWebElement"/> matching the criteria.</returns>
        public IWebElement FindElementByName(string name)
        {
            return FindElement("name", name);
        }

        /// <summary>
        /// Finds all elements matching the specified name.
        /// </summary>
        /// <param name="name">The name to match.</param>
        /// <returns>A <see cref="ReadOnlyCollection{T}"/> containing all
        /// <see cref="IWebElement">IWebElements</see> matching the criteria.</returns>
        public ReadOnlyCollection<IWebElement> FindElementsByName(string name)
        {
            return FindElements("name", name);
        }
        #endregion

        #region IFindsByTagName Members
        /// <summary>
        /// Finds the first element matching the specified tag name.
        /// </summary>
        /// <param name="tagName">The tag name to match.</param>
        /// <returns>The first <see cref="IWebElement"/> matching the criteria.</returns>
        public IWebElement FindElementByTagName(string tagName)
        {
            return FindElement("tag name", tagName);
        }

        /// <summary>
        /// Finds all elements matching the specified tag name.
        /// </summary>
        /// <param name="tagName">The tag name to match.</param>
        /// <returns>A <see cref="ReadOnlyCollection{T}"/> containing all
        /// <see cref="IWebElement">IWebElements</see> matching the criteria.</returns>
        public ReadOnlyCollection<IWebElement> FindElementsByTagName(string tagName)
        {
            return FindElements("tag name", tagName);
        }
        #endregion

        #region IFindsByLinkText Members
        /// <summary>
        /// Finds the first element matching the specified link text.
        /// </summary>
        /// <param name="linkText">The link text to match.</param>
        /// <returns>The first <see cref="IWebElement"/> matching the criteria.</returns>
        public IWebElement FindElementByLinkText(string linkText)
        {
            return FindElement("link text", linkText);
        }

        /// <summary>
        /// Finds all elements matching the specified link text.
        /// </summary>
        /// <param name="linkText">The link text to match.</param>
        /// <returns>A <see cref="ReadOnlyCollection{T}"/> containing all
        /// <see cref="IWebElement">IWebElements</see> matching the criteria.</returns>
        public ReadOnlyCollection<IWebElement> FindElementsByLinkText(string linkText)
        {
            return FindElements("link text", linkText);
        }
        #endregion

        #region IFindsByPartialLinkText Members
        /// <summary>
        /// Finds the first element matching the specified partial link text.
        /// </summary>
        /// <param name="partialLinkText">The partial link text to match.</param>
        /// <returns>The first <see cref="IWebElement"/> matching the criteria.</returns>
        public IWebElement FindElementByPartialLinkText(string partialLinkText)
        {
            return FindElement("partial link text", partialLinkText);
        }

        /// <summary>
        /// Finds all elements matching the specified partial link text.
        /// </summary>
        /// <param name="partialLinkText">The partial link text to match.</param>
        /// <returns>A <see cref="ReadOnlyCollection{T}"/> containing all
        /// <see cref="IWebElement">IWebElements</see> matching the criteria.</returns>
        public ReadOnlyCollection<IWebElement> FindElementsByPartialLinkText(string partialLinkText)
        {
            return FindElements("partial link text", partialLinkText);
        }
        #endregion

        #region IFindsByClassName Members
        /// <summary>
        /// Finds the first element matching the specified CSS class.
        /// </summary>
        /// <param name="className">The CSS class to match.</param>
        /// <returns>The first <see cref="IWebElement"/> matching the criteria.</returns>
        public IWebElement FindElementByClassName(string className)
        {
            if (className == null)
            {
                throw new ArgumentNullException("className", "Cannot find elements when the class name expression is null.");
            }

            Regex matchingRegex = new Regex(".*\\s+.*");
            if (matchingRegex.IsMatch(className))
            {
                throw new IllegalLocatorException("Compound class names are not supported. Consider searching for one class name and filtering the results.");
            }

            return FindElement("class name", className);
        }

        /// <summary>
        /// Finds all elements matching the specified CSS class.
        /// </summary>
        /// <param name="className">The CSS class to match.</param>
        /// <returns>A <see cref="ReadOnlyCollection{T}"/> containing all
        /// <see cref="IWebElement">IWebElements</see> matching the criteria.</returns>
        public ReadOnlyCollection<IWebElement> FindElementsByClassName(string className)
        {
            if (className == null)
            {
                throw new ArgumentNullException("className", "Cannot find elements when the class name expression is null.");
            }

            Regex matchingRegex = new Regex(".*\\s+.*");
            if (matchingRegex.IsMatch(className))
            {
                throw new IllegalLocatorException("Compound class names are not supported. Consider searching for one class name and filtering the results.");
            }

            return FindElements("class name", className);
        }
        #endregion

        #region IFindsByXPath Members
        /// <summary>
        /// Finds the first element matching the specified XPath query.
        /// </summary>
        /// <param name="xpath">The XPath query to match.</param>
        /// <returns>The first <see cref="IWebElement"/> matching the criteria.</returns>
        public IWebElement FindElementByXPath(string xpath)
        {
            return FindElement("xpath", xpath);
        }

        /// <summary>
        /// Finds all elements matching the specified XPath query.
        /// </summary>
        /// <param name="xpath">The XPath query to match.</param>
        /// <returns>A <see cref="ReadOnlyCollection{T}"/> containing all
        /// <see cref="IWebElement">IWebElements</see> matching the criteria.</returns>
        public ReadOnlyCollection<IWebElement> FindElementsByXPath(string xpath)
        {
            return FindElements("xpath", xpath);
        }

        #endregion

        #region IFindsByCssSelector Members
        /// <summary>
        /// Finds the first element matching the specified CSS selector.
        /// </summary>
        /// <param name="cssSelector">The id to match.</param>
        /// <returns>The first <see cref="IWebElement"/> matching the criteria.</returns>
        public IWebElement FindElementByCssSelector(string cssSelector)
        {
            return FindElement("css selector", cssSelector);
        }

        /// <summary>
        /// Finds all elements matching the specified CSS selector.
        /// </summary>
        /// <param name="cssSelector">The CSS selector to match.</param>
        /// <returns>A <see cref="ReadOnlyCollection{T}"/> containing all
        /// <see cref="IWebElement">IWebElements</see> matching the criteria.</returns>
        public ReadOnlyCollection<IWebElement> FindElementsByCssSelector(string cssSelector)
        {
            return FindElements("css selector", cssSelector);
        }
        #endregion

        #region IJavaScriptExecutor Members
        /// <summary>
        /// Executes JavaScript in the context of the currently selected frame or window.
        /// </summary>
        /// <param name="script">The JavaScript code to execute.</param>
        /// <param name="args">The arguments to the script.</param>
        /// <returns>The value returned by the script.</returns>
        /// <remarks>
        /// <para>
        /// The <see cref="ExecuteScript"/>method executes JavaScript in the context of 
        /// the currently selected frame or window. This means that "document" will refer 
        /// to the current document. If the script has a return value, then the following 
        /// steps will be taken:
        /// </para>
        /// <para>
        /// <list type="bullet">
        /// <item><description>For an HTML element, this method returns a <see cref="IWebElement"/></description></item>
        /// <item><description>For a number, a <see cref="System.Int64"/> is returned</description></item>
        /// <item><description>For a boolean, a <see cref="System.Boolean"/> is returned</description></item>
        /// <item><description>For all other cases a <see cref="System.String"/> is returned.</description></item>
        /// <item><description>For an array,we check the first element, and attempt to return a 
        /// <see cref="List{T}"/> of that type, following the rules above. Nested lists are not
        /// supported.</description></item>
        /// <item><description>If the value is null or there is no return value,
        /// <see langword="null"/> is returned.</description></item>
        /// </list>
        /// </para>
        /// <para>
        /// Arguments must be a number (which will be converted to a <see cref="System.Int64"/>),
        /// a <see cref="System.Boolean"/>, a <see cref="System.String"/> or a <see cref="IWebElement"/>.
        /// An exception will be thrown if the arguments do not meet these criteria. 
        /// The arguments will be made available to the JavaScript via the "arguments" magic 
        /// variable, as if the function were called via "Function.apply" 
        /// </para>
        /// </remarks>
        public object ExecuteScript(string script, params object[] args)
        {
            // Escape the quote marks
            script = script.Replace("\"", "\\\"");

            object[] convertedArgs = ConvertToJsObjects(args);

            object commandResponse = ExecuteCommand(typeof(InvalidOperationException), "executeScript", new object[] { script, convertedArgs });
            return ParseJavaScriptReturnValue(commandResponse);
        }
        #endregion

        #region ITakesScreenshot Members
        /// <summary>
        /// Gets a <see cref="Screenshot"/> object representing the image of the page on the screen.
        /// </summary>
        /// <returns>A <see cref="Screenshot"/> object containing the image.</returns>
        public Screenshot GetScreenshot()
        {
            // Get the screenshot as base64.
            string base64 = SendMessage(typeof(WebDriverException), "getScreenshotAsBase64");

            // ... and convert it.
            return new Screenshot(base64);
        }
        #endregion

        #region IDisposable Members
        /// <summary>
        /// Releases all resources associated with this <see cref="FirefoxDriver"/>.
        /// </summary>
        public void Dispose()
        {
            Dispose(true);
            GC.SuppressFinalize(this);
        }
        #endregion

        #region Support methods
        /// <summary>
        /// Connects the <see cref="FirefoxDriver"/> to a running instance of the WebDriver Firefox extension.
        /// </summary>
        /// <param name="binary">The <see cref="FirefoxBinary"/> to use to connect to the extension.</param>
        /// <param name="profile">The <see cref="FirefoxProfile"/> to use to connect to the extension.</param>
        /// <param name="host">The host name of the computer running the Firefox browser extension (usually "localhost").</param>
        /// <returns>A <see cref="ExtensionConnection"/> to the currently running Firefox extension.</returns>
        internal static ExtensionConnection ConnectTo(FirefoxBinary binary, FirefoxProfile profile, string host)
        {
            return ExtensionConnectionFactory.ConnectTo(binary, profile, host);
        }

        /// <summary>
        /// Executes a command in the current instance of Firefox.
        /// </summary>
        /// <param name="throwOnFailure">A <see cref="System.Type"/> indicating the type of exception thrown if the command fails.</param>
        /// <param name="commandToExecute">The <see cref="Command"/> to execute.</param>
        /// <returns>An <see cref="System.Object"/> representing the value returned by the command.</returns>
        internal object ExecuteCommand(Type throwOnFailure, Command commandToExecute)
        {
            ////if (currentAlert != null) {
            ////  if (!alertWhiteListedCommands.contains(command.getCommandName())) {
            ////    ((FirefoxTargetLocator) switchTo()).alert().dismiss();
            ////    throw new UnhandledAlertException(command.getCommandName());
            ////  }
            ////}

            Response response = extension.SendMessageAndWaitForResponse(throwOnFailure, commandToExecute);
            context = response.Context;
            response.IfNecessaryThrow(throwOnFailure);

            object rawResponse = response.ResponseValue;
            string rawResponseAsString = rawResponse as string;
            if (rawResponseAsString != null)
            {
                // First, collapse all \r\n pairs to \n, then replace all \n with
                // System.Environment.NewLine. This ensures the consistency of 
                // the values.
                rawResponse = rawResponseAsString.Replace("\r\n", "\n").Replace("\n", System.Environment.NewLine);
            }

            return rawResponse;
        }

        /// <summary>
        /// Releases all resources associated with this <see cref="FirefoxDriver"/>.
        /// </summary>
        /// <param name="disposing"><c>true</c> if this driver is currently being dispose; otherwise <c>false</c>.</param>
        protected virtual void Dispose(bool disposing)
        {
            if (disposing)
            {
                extension.Dispose();
            }
        }

        /// <summary>
        /// In derived classes, the <see cref="PrepareEnvironment"/> method prepares the environment for test execution.
        /// </summary>
        protected void PrepareEnvironment()
        {
            // Does nothing, but provides a hook for subclasses to do "stuff"
        }

        private static object[] ConvertToJsObjects(object[] args)
        {
            for (int i = 0; i < args.Length; i++)
            {
                args[i] = ConvertObjectToJavaScriptObject(args[i]);
            }

            return args;
        }

        private static object ConvertObjectToJavaScriptObject(object arg)
        {
            FirefoxWebElement argAsElement = arg as FirefoxWebElement;
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
                    FirefoxWebElement element = new FirefoxWebElement(this, parts[parts.Length - 1]);
                    returnValue = element;
                }
                else if (type == "ARRAY")
                {
                    bool allArrayEntriesAreElements = true;
                    List<object> toReturn = new List<object>();
                    object[] returnedObjects = (object[])result["value"];
                    for (int i = 0; i < returnedObjects.Length; i++)
                    {
                        object arrayEntry = ParseJavaScriptReturnValue(returnedObjects[i]);
                        if (!(arrayEntry is IWebElement))
                        {
                            allArrayEntriesAreElements = false;
                        }

                        toReturn.Add(arrayEntry);
                    }

                    if (allArrayEntriesAreElements)
                    {
                        List<IWebElement> elementsToReturn = new List<IWebElement>();
                        foreach (object returnedObject in toReturn)
                        {
                            elementsToReturn.Add((FirefoxWebElement)returnedObject);
                        }

                        returnValue = elementsToReturn;
                    }
                    else
                    {
                        returnValue = toReturn;
                    }
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

        private IWebElement FindElement(string method, string selector)
        {
            string elementId = SendMessage(typeof(NoSuchElementException), "findElement", new object[] { method, selector });

            return new FirefoxWebElement(this, elementId);
        }

        private ReadOnlyCollection<IWebElement> FindElements(string method, string selector)
        {
            object[] returnedIds = (object[])ExecuteCommand(typeof(WebDriverException), "findElements", new object[] { method, selector });
            List<IWebElement> elements = new List<IWebElement>();

            try
            {
                foreach (object returnedId in returnedIds)
                {
                    string id = returnedId.ToString();
                    elements.Add(new FirefoxWebElement(this, id));
                }
            }
            catch (Exception e)
            {
                throw new WebDriverException(string.Empty, e);
            }

            return new ReadOnlyCollection<IWebElement>(elements);
        }

        private void FixSessionId()
        {
            string response = SendMessage(typeof(WebDriverException), "newSession");
            this.context = new Context(response);
        }

        private string SendMessage(Type throwOnFailure, string methodName, object[] parameters)
        {
            return SendMessage(throwOnFailure, new Command(context, methodName, parameters));
        }

        private string SendMessage(Type throwOnFailure, string methodName)
        {
            return SendMessage(throwOnFailure, new Command(context, methodName, null));
        }

        private string SendMessage(Type throwOnFailure, Command commandToExecute)
        {
            return ExecuteCommand(throwOnFailure, commandToExecute).ToString();
        }

        private object ExecuteCommand(Type throwOnFailure, string methodName, object[] parameters)
        {
            return ExecuteCommand(throwOnFailure, new Command(context, methodName, parameters));
        }
        #endregion

        /// <summary>
        /// Allows the user to access the browser's history and to navigate to a given URL.
        /// </summary>
        private class FirefoxNavigation : INavigation
        {
            #region Private members
            private FirefoxDriver driver;
            #endregion

            #region Constructor
            /// <summary>
            /// Initializes a new instance of the <see cref="FirefoxNavigation"/> class.
            /// </summary>
            /// <param name="parentDriver">The parent <see cref="FirefoxDriver"/> to navigate with.</param>
            public FirefoxNavigation(FirefoxDriver parentDriver)
            {
                driver = parentDriver;
            }
            #endregion

            #region INavigation Members
            /// <summary>
            /// Move back a single entry in the browser's history.
            /// </summary>
            public void Back()
            {
                driver.SendMessage(typeof(WebDriverException), "goBack");
            }

            /// <summary>
            /// Move a single "item" forward in the browser's history.
            /// </summary>
            /// <remarks>Does nothing if we are on the latest page viewed.</remarks>
            public void Forward()
            {
                driver.SendMessage(typeof(WebDriverException), "goForward");
            }

            /// <summary>
            ///  Load a new web page in the current browser window.
            /// </summary>
            /// <param name="url">The URL to load. It is best to use a fully qualified URL</param>
            /// <remarks>
            /// Calling the <see cref="GoToUrl(System.String)"/> method will load a new web page in the current browser window. 
            /// This is done using an HTTP GET operation, and the method will block until the 
            /// load is complete. This will follow redirects issued either by the server or 
            /// as a meta-redirect from within the returned HTML. Should a meta-redirect "rest"
            /// for any duration of time, it is best to wait until this timeout is over, since 
            /// should the underlying page change while your test is executing the results of 
            /// future calls against this interface will be against the freshly loaded page.
            /// <para>This is equivalent to the to() method in the Java language bindings.
            /// "To" is a keyword for some .NET languages, so the name has been changed.
            /// </para>
            /// </remarks>
            public void GoToUrl(string url)
            {
                driver.Url = url;
            }

            /// <summary>
            ///  Load a new web page in the current browser window.
            /// </summary>
            /// <param name="url">The URL to load.</param>
            /// <remarks>
            /// Calling the <see cref="GoToUrl(System.Uri)"/> method will load a new web page in the current browser window. 
            /// This is done using an HTTP GET operation, and the method will block until the 
            /// load is complete. This will follow redirects issued either by the server or 
            /// as a meta-redirect from within the returned HTML. Should a meta-redirect "rest"
            /// for any duration of time, it is best to wait until this timeout is over, since 
            /// should the underlying page change while your test is executing the results of 
            /// future calls against this interface will be against the freshly loaded page. 
            /// <para>This is equivalent to the to() method in the Java language bindings.
            /// "To" is a keyword for some .NET languages, so the name has been changed.
            /// </para>
            /// </remarks>
            public void GoToUrl(Uri url)
            {
                if (url == null)
                {
                    throw new ArgumentNullException("url", "URL cannot be null.");
                }

                driver.Url = url.ToString();
            }

            /// <summary>
            /// Refreshes the current page.
            /// </summary>
            public void Refresh()
            {
                driver.SendMessage(typeof(WebDriverException), "refresh");
            }

            #endregion
        }

        /// <summary>
        /// Allows the user to set options on the browser. This also includes methods for manipulating cookies in the browser.
        /// </summary>
        private class FirefoxOptions : IOptions
        {
            #region Private members
            private const int SlowSpeed = 1;
            private const int MediumSpeed = 10;
            private const int FastSpeed = 100;
            private const string Rfc1123DateFormat = "DDD, dd MMM yyyy HH:mm:ss GMT";

            private FirefoxDriver driver; 
            #endregion

            #region Constructor
            /// <summary>
            /// Initializes a new instance of the <see cref="FirefoxOptions"/> class.
            /// </summary>
            /// <param name="parentDriver">The parent <see cref="FirefoxDriver"/> to set the options for.</param>
            public FirefoxOptions(FirefoxDriver parentDriver)
            {
                driver = parentDriver;
            }
            #endregion

            #region IOptions Members
            /// <summary>
            /// Gets or sets a value representing the speed with which user interactions 
            /// take place in the browser.
            /// </summary>
            public Speed Speed
            {
                get
                {
                    string response = driver.SendMessage(typeof(WebDriverException), "getMouseSpeed");
                    int speedValue = int.Parse(response, CultureInfo.InvariantCulture);
                    string speedDescription = string.Empty;
                    switch (speedValue)
                    {
                        case SlowSpeed:
                            speedDescription = "Slow";
                            break;

                        case MediumSpeed:
                            speedDescription = "Medium";
                            break;
                            
                        case FastSpeed:
                            speedDescription = "Fast";
                            break;
                    }

                    return Speed.FromString(speedDescription);
                }

                set
                {
                    int pixelSpeed;
                    switch (value.Description)
                    {
                        case "Slow":
                            pixelSpeed = SlowSpeed;
                            break;
                        case "Medium":
                            pixelSpeed = MediumSpeed;
                            break;
                        case "Fast":
                            pixelSpeed = FastSpeed;
                            break;
                        default:
                            throw new ArgumentException("value must be a predefined Speed", "value");
                    }

                    driver.SendMessage(typeof(WebDriverException), "setMouseSpeed", new object[] { pixelSpeed });
                }
            }

            /// <summary>
            /// Adds a cookie to the current page.
            /// </summary>
            /// <param name="cookie">The <see cref="Cookie"/> object to be added.</param>
            public void AddCookie(Cookie cookie)
            {
                // The extension expects a cookie as a JSON object, but as a string value
                // which will be reparsed on the extension side.
                string cookieRepresentation = JsonConvert.SerializeObject(cookie, new JsonConverter[] { new CookieJsonConverter() });
                driver.SendMessage(typeof(WebDriverException), "addCookie",  new object[] { cookieRepresentation });
            }

            /// <summary>
            /// Gets all cookies defined for the current page.
            /// </summary>
            /// <returns>A <see cref="ReadOnlyCollection{T}"/> of the cookies defined for the current page.</returns>
            public ReadOnlyCollection<Cookie> GetCookies()
            {
                List<Cookie> toReturn = new List<Cookie>();
                object returned = driver.ExecuteCommand(typeof(WebDriverException), "getCookie", null);

                try
                {
                    object[] cookies = returned as object[];
                    if (cookies != null)
                    {
                        foreach (object rawCookie in cookies)
                        {
                            Dictionary<string, string> cookieAttributes = new Dictionary<string, string>();
                            cookieAttributes.Add("secure", "false");

                            string cookieString = rawCookie.ToString();
                            string[] cookieStringParts = cookieString.Split(new char[] { ';' });
                            foreach (string cookieAttribute in cookieStringParts)
                            {
                                if (cookieAttribute.Contains("="))
                                {
                                    string[] attributeTokens = cookieAttribute.Split(new char[] { '=' }, 2);
                                    if (!cookieAttributes.ContainsKey("name"))
                                    {
                                        cookieAttributes.Add("name", attributeTokens[0]);
                                        cookieAttributes.Add("value", attributeTokens[1]);
                                    }
                                    else if (attributeTokens[0] == "domain" && attributeTokens[1].Trim().StartsWith(".", StringComparison.OrdinalIgnoreCase))
                                    {
                                        int offset = attributeTokens[1].IndexOf(".", StringComparison.OrdinalIgnoreCase) + 1;
                                        cookieAttributes.Add("domain", attributeTokens[1].Substring(offset));
                                    }
                                    else if (attributeTokens.Length > 1)
                                    {
                                        cookieAttributes.Add(attributeTokens[0], attributeTokens[1]);
                                    }
                                }
                                else if (cookieAttribute == "secure")
                                {
                                    cookieAttributes["secure"] = "true";
                                }
                            }

                            DateTime? expires = null;
                            string expiry = cookieAttributes["expires"];
                            if (!string.IsNullOrEmpty(expiry) && expiry != "0")
                            {
                                // Firefox stores expiry as number of seconds
                                expires = new DateTime(long.Parse(cookieAttributes["expires"], CultureInfo.InvariantCulture) * 10000);
                            }

                            string name = cookieAttributes["name"];
                            string value = cookieAttributes["value"];
                            string path = cookieAttributes["path"];
                            string domain = cookieAttributes["domain"];
                            bool secure = bool.Parse(cookieAttributes["secure"]);
                            toReturn.Add(new ReturnedCookie(name, value, domain, path, expires, secure, new Uri(driver.Url)));
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
            /// Gets a cookie with the specified name.
            /// </summary>
            /// <param name="name">The name of the cookie to retrieve.</param>
            /// <returns>The <see cref="Cookie"/> containing the name. Returns <see langword="null"/>
            /// if no cookie with the specified name is found.</returns>
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
            /// Deletes the specified cookie from the page.
            /// </summary>
            /// <param name="cookie">The <see cref="Cookie"/> to be deleted.</param>
            public void DeleteCookie(Cookie cookie)
            {
                string cookieRepresentation = JsonConvert.SerializeObject(cookie, new JsonConverter[] { new CookieJsonConverter() });
                driver.SendMessage(typeof(WebDriverException), "deleteCookie", new object[] { cookieRepresentation });
            }

            /// <summary>
            /// Deletes the cookie with the specified name from the page.
            /// </summary>
            /// <param name="name">The name of the cookie to be deleted.</param>
            public void DeleteCookieNamed(string name)
            {
                Cookie toDelete = new Cookie(name, string.Empty);
                DeleteCookie(toDelete);
            }

            /// <summary>
            /// Deletes all cookies from the page.
            /// </summary>
            public void DeleteAllCookies()
            {
                driver.SendMessage(typeof(WebDriverException), "deleteAllCookies");
            }
            #endregion
        }

        /// <summary>
        /// Allows the user to locate a given frame or window.
        /// </summary>
        private class FirefoxTargetLocator : ITargetLocator
        {
            #region Private members
            private FirefoxDriver driver; 
            #endregion

            #region Constructor
            /// <summary>
            /// Initializes a new instance of the <see cref="FirefoxTargetLocator"/> class.
            /// </summary>
            /// <param name="parentDriver">The parent <see cref="FirefoxDriver"/> to set the options for.</param>
            public FirefoxTargetLocator(FirefoxDriver parentDriver)
            {
                driver = parentDriver;
            }
            #endregion

            #region ITargetLocator Members
            /// <summary>
            /// Select a frame by its (zero-based) index.
            /// </summary>
            /// <param name="frameIndex">The zero-based index of the frame to select.</param>
            /// <returns>An <see cref="IWebDriver"/> instance focused on the specified frame.</returns>
            /// <exception cref="NoSuchFrameException">If the frame cannot be found.</exception>
            /// <remarks>The <see cref="Frame(System.Int32)"/> method finds frames by numeric index,
            /// and the index is zero-based.That is, if a page has three frames, the first frame 
            /// would be at index "0", the second at index "1" and the third at index "2". Once 
            /// the frame has been selected, all subsequent calls on the IWebDriver interface are
            /// made to that frame.
            /// </remarks>
            public IWebDriver Frame(int frameIndex)
            {
                driver.SendMessage(typeof(NoSuchFrameException), "switchToFrame", new object[] { frameIndex });
                return driver;
            }

            /// <summary>
            /// Select a frame by its name or ID.
            /// </summary>
            /// <param name="frameName">The name of the frame to select.</param>
            /// <returns>An <see cref="IWebDriver"/> instance focused on the specified frame.</returns>
            /// <exception cref="NoSuchFrameException">If the frame cannot be found.</exception>
            /// <remarks>The <see cref="Frame(System.String)"/> method selects a frame by its 
            /// name or ID. To select sub-frames, simply separate the frame names/IDs by dots.
            /// As an example "main.child" will select the frame with the name "main" and then
            /// it's child "child". If a frame name is a number, then it will be treated as 
            /// selecting a frame as if using <see cref="Frame(System.Int32)"/>.
            /// </remarks>
            public IWebDriver Frame(string frameName)
            {
                if (frameName == null)
                {
                    throw new ArgumentNullException("frameName", "Frame name must not be null");
                }

                driver.SendMessage(typeof(NoSuchFrameException), "switchToFrame", new object[] { frameName });
                return driver;
            }

            /// <summary>
            /// Switches the focus of future commands for this driver to the window with the given name.
            /// </summary>
            /// <param name="windowName">The name of the window to select.</param>
            /// <returns>An <see cref="IWebDriver"/> instance focused on the given window.</returns>
            /// <exception cref="NoSuchWindowException">If the window cannot be found.</exception>
            public IWebDriver Window(string windowName)
            {
                string response = driver.SendMessage(typeof(NoSuchWindowException), "switchToWindow", new object[] { windowName });
                if (response == null || response == "No window found")
                {
                    throw new NoSuchWindowException("Cannot find window: " + windowName);
                }

                driver.context = new Context(response);
                return driver;
            }

            /// <summary>
            /// Selects either the first frame on the page or the main document when a page contains iframes.
            /// </summary>
            /// <returns>An <see cref="IWebDriver"/> instance focused on the default frame.</returns>
            public IWebDriver DefaultContent()
            {
                driver.SendMessage(typeof(WebDriverException), "switchToDefaultContent");
                return driver;
            }

            /// <summary>
            /// Switches to the element that currently has the focus, or the body element 
            /// if no element with focus can be detected.
            /// </summary>
            /// <returns>An <see cref="IWebElement"/> instance representing the element 
            /// with the focus, or the body element if no element with focus can be detected.</returns>
            public IWebElement ActiveElement()
            {
                string response = driver.SendMessage(typeof(NoSuchElementException), "switchToActiveElement");
                return new FirefoxWebElement(driver, response);
            }

            #endregion
        }
    }
}
