using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.Globalization;
using System.Text;
using OpenQA.Selenium.Internal;

namespace OpenQA.Selenium.IE
{
    /// <summary>
    /// Provides a way to access Internet Explorer to run your tests by creating a InternetExplorerDriver instance
    /// </summary>
    /// <remarks>
    /// When the WebDriver object has been instantiated the browser will load. The test can then navigate to the URL under test and 
    /// start your test.
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
    ///         driver = new InternetExplorerDriver();
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
    public sealed class InternetExplorerDriver : IWebDriver, ISearchContext, IJavaScriptExecutor, ITakesScreenshot
    {
        #region Private members
        private bool disposed;
        private SafeInternetExplorerDriverHandle handle;
        private InternetExplorerNavigation navigation;
        private InternetExplorerOptions options;
        private InternetExplorerTargetLocator targetLocator;
        #endregion

        #region Constructor
        /// <summary>
        /// Initializes a new instance of the InternetExplorerDriver class.
        /// </summary>
        public InternetExplorerDriver()
        {
            handle = new SafeInternetExplorerDriverHandle();
            WebDriverResult result = NativeDriverLibrary.Instance.NewDriverInstance(ref handle);
            if (result != WebDriverResult.Success)
            {
                throw new WebDriverException(string.Format(CultureInfo.InvariantCulture, "Cannot create new browser instance: {0}", result.ToString()));
            }
        }
        #endregion

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
                SafeStringWrapperHandle stringHandle = new SafeStringWrapperHandle();

                WebDriverResult result = NativeDriverLibrary.Instance.GetCurrentUrl(handle, ref stringHandle);
                if (result != WebDriverResult.Success)
                {
                    stringHandle.Dispose();
                    throw new InvalidOperationException("Unable to get current URL:" + result.ToString());
                }

                string returnValue = string.Empty;
                using (StringWrapper wrapper = new StringWrapper(stringHandle))
                {
                    returnValue = wrapper.Value;
                }

                return returnValue;
            }

            set
            {
                if (disposed)
                {
                    throw new ObjectDisposedException("handle");
                }

                if (value == null)
                {
                    throw new ArgumentNullException("value", "Argument 'url' cannot be null.");
                }

                WebDriverResult result = NativeDriverLibrary.Instance.ChangeCurrentUrl(handle, value);
                if (result != WebDriverResult.Success)
                {
                    ResultHandler.VerifyResultCode(result, string.Format(CultureInfo.InvariantCulture, "Cannot go to '{0}': {1}", value, result.ToString()));
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
                SafeStringWrapperHandle stringHandle = new SafeStringWrapperHandle();

                WebDriverResult result = NativeDriverLibrary.Instance.GetTitle(handle, ref stringHandle);
                if (result != WebDriverResult.Success)
                {
                    stringHandle.Dispose();
                    throw new InvalidOperationException("Unable to get current title:" + result.ToString());
                }

                string returnValue = string.Empty;
                using (StringWrapper wrapper = new StringWrapper(stringHandle))
                {
                    returnValue = wrapper.Value;
                }

                return returnValue;
            }
        }

        /// <summary>
        /// Gets or sets a value indicating whether the browser is visible.
        /// </summary>
        public bool Visible
        {
            get
            {
                int visible = 0;
                WebDriverResult result = NativeDriverLibrary.Instance.GetVisible(handle, ref visible);
                ResultHandler.VerifyResultCode(result, "Unable to determine if browser is visible");
                return visible == 1;
            }

            set
            {
                WebDriverResult result = NativeDriverLibrary.Instance.SetVisible(handle, value ? 1 : 0);
                ResultHandler.VerifyResultCode(result, "Unable to change the visibility of the browser");
            }
        }

        /// <summary>
        /// Gets the source of the page last loaded by the browser.
        /// </summary>
        public string PageSource
        {
            get
            {
                SafeStringWrapperHandle stringHandle = new SafeStringWrapperHandle();
                WebDriverResult result = NativeDriverLibrary.Instance.GetPageSource(handle, ref stringHandle);
                ResultHandler.VerifyResultCode(result, "Unable to get page source");
                string returnValue = string.Empty;
                using (StringWrapper wrapper = new StringWrapper(stringHandle))
                {
                    returnValue = wrapper.Value;
                }

                return returnValue;
            }
        }

        /// <summary>
        /// Gets a value indicating whether JavaScript is enabled for this browser.
        /// </summary>
        public bool IsJavaScriptEnabled
        {
            get { return true; }
        }

        /// <summary>
        /// Closes the Browser.
        /// </summary>
        public void Close()
        {
            WebDriverResult result = NativeDriverLibrary.Instance.Close(handle);
            if (result != WebDriverResult.Success)
            {
                throw new InvalidOperationException("Unable to close driver: " + result.ToString());
            }
        }

        /// <summary>
        /// Close the Browser and Dispose of WebDriver.
        /// </summary>
        public void Quit()
        {
            // This code mimics the Java implementation.
            try
            {
                ReadOnlyCollection<string> handleList = GetWindowHandles();
                foreach (string windowHandle in handleList)
                {
                    try
                    {
                        SwitchTo().Window(windowHandle);
                        Close();
                    }
                    catch (NoSuchWindowException)
                    {
                        // doesn't matter one jot.
                    }
                }
            }
            catch (NotSupportedException)
            {
                // Stuff happens. Bail out
                Dispose();
            }

            Dispose();
        }

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
            object toReturn = null;
            SafeScriptArgsHandle scriptArgsHandle = new SafeScriptArgsHandle();
            WebDriverResult result = NativeDriverLibrary.Instance.NewScriptArgs(ref scriptArgsHandle, args.Length);
            ResultHandler.VerifyResultCode(result, "Unable to create new script arguments array");

            try
            {
                PopulateArguments(scriptArgsHandle, args);

                script = "(function() { return function(){" + script + "};})();";

                SafeScriptResultHandle scriptResultHandle = new SafeScriptResultHandle();
                result = NativeDriverLibrary.Instance.ExecuteScript(handle, script, scriptArgsHandle, ref scriptResultHandle);

                ResultHandler.VerifyResultCode(result, "Cannot execute script");

                // Note that ExtractReturnValue frees the memory for the script result.
                toReturn = ExtractReturnValue(scriptResultHandle);
            }
            finally
            {
                scriptArgsHandle.Dispose();
            }

            return toReturn;
        }

        /// <summary>
        /// Method for returning a collection of WindowHandles that the driver has access to.
        /// </summary>
        /// <returns>Returns a ReadOnlyCollection of Window Handles.</returns>
        /// <example>
        /// IWebDriver driver = new InternetExplorerDriver();
        /// ReadOnlyCollection<![CDATA[<string>]]> windowNames = driver.GetWindowHandles();
        /// </example>
        public ReadOnlyCollection<string> GetWindowHandles()
        {
            SafeStringCollectionHandle handlesPtr = new SafeStringCollectionHandle();
            WebDriverResult result = NativeDriverLibrary.Instance.GetAllWindowHandles(handle, ref handlesPtr);

            ResultHandler.VerifyResultCode(result, "Unable to obtain all window handles");

            List<string> windowHandleList = new List<string>();
            using (StringCollection windowHandleStringCollection = new StringCollection(handlesPtr))
            {
                windowHandleList = windowHandleStringCollection.ToList();
            }

            return new ReadOnlyCollection<string>(windowHandleList);
        }

        /// <summary>
        /// Returns the Name of Window that the driver is working in.
        /// </summary>
        /// <returns>Returns the name of the Window.</returns>
        /// <example>
        /// IWebDriver driver = new InternetExplorerDriver();
        /// string windowName = driver.GetWindowHandles();
        /// </example>
        public string GetWindowHandle()
        {
            SafeStringWrapperHandle stringHandle = new SafeStringWrapperHandle();
            WebDriverResult result = NativeDriverLibrary.Instance.GetCurrentWindowHandle(handle, ref stringHandle);
            ResultHandler.VerifyResultCode(result, "Unable to obtain current window handle");
            string handleValue = string.Empty;
            using (StringWrapper wrapper = new StringWrapper(stringHandle))
            {
                handleValue = wrapper.Value;
            }

            return handleValue;
        }

        /// <summary>
        /// Method to give you access to switch frames and windows.
        /// </summary>
        /// <returns>Returns an Object that allows you to Switch Frames and Windows.</returns>
        /// <example>
        /// <code>
        /// IWebDriver driver = new InternetExplorerDriver();
        /// driver.SwitchTo().Frame("FrameName");
        /// </code>
        /// </example>
        public ITargetLocator SwitchTo()
        {
            if (targetLocator == null)
            {
                targetLocator = new InternetExplorerTargetLocator(this);
            }

            return targetLocator;
        }

        /// <summary>
        /// Method For getting an object to set the Speed.
        /// </summary>
        /// <returns>Returns an IOptions object that allows the driver to set the speed and cookies and getting cookies.</returns>
        /// <example>
        /// <code>
        /// IWebDriver driver = new InternetExplorerDriver();
        /// driver.Manage().GetCookies();
        /// </code>
        /// </example>
        public IOptions Manage()
        {
            if (options == null)
            {
                options = new InternetExplorerOptions(this);
            }

            return options;
        }

        /// <summary>
        /// Method to allow you to Navigate with WebDriver.
        /// </summary>
        /// <returns>Returns an INavigation Object that allows the driver to navigate in the browser.</returns>
        /// <example>
        /// <code>
        ///     IWebDriver driver = new InternetExplorerDriver();
        ///     driver.Navigate().GoToUrl("http://www.google.co.uk");
        /// </code>
        /// </example>
        public INavigation Navigate()
        {
            if (navigation == null)
            {
                navigation = new InternetExplorerNavigation(this);
            }

            return navigation;
        }
        #endregion

        #region ISearchContext Members
        /// <summary>
        /// Finds the elements on the page by using the <see cref="By"/> object and returns a ReadOnlyCollection of the Elements on the page.
        /// </summary>
        /// <param name="by">By mechanism for finding the element.</param>
        /// <returns>ReadOnlyCollection of IWebElement.</returns>
        /// <example>
        /// <code>
        /// IWebDriver driver = new InternetExplorerDriver();
        /// ReadOnlyCollection<![CDATA[<IWebElement>]]> classList = driver.FindElements(By.ClassName("class"));
        /// </code>
        /// </example>
        public ReadOnlyCollection<IWebElement> FindElements(By by)
        {
            return by.FindElements(new Finder(this, new SafeInternetExplorerWebElementHandle()));
        }

        /// <summary>
        /// Finds the first element in the page that matches the <see cref="By"/> object.
        /// </summary>
        /// <param name="by">By mechanism for finding the element.</param>
        /// <returns>IWebElement object so that you can interction that object.</returns>
        /// <example>
        /// <code>
        /// IWebDriver driver = new InternetExplorerDriver();
        /// IWebElement elem = driver.FindElement(By.Name("q"));
        /// </code>
        /// </example>
        public IWebElement FindElement(By by)
        {
            return by.FindElement(new Finder(this, new SafeInternetExplorerWebElementHandle()));
        }
        #endregion

        #region ITakesScreenshot Members
        /// <summary>
        /// Gets a <see cref="Screenshot"/> object representing the image of the page on the screen.
        /// </summary>
        /// <returns>A <see cref="Screenshot"/> object containing the image.</returns>
        public Screenshot GetScreenshot()
        {
            Screenshot currentScreenshot = null;
            SafeStringWrapperHandle stringHandle = new SafeStringWrapperHandle();
            WebDriverResult result = NativeDriverLibrary.Instance.CaptureScreenshotAsBase64(handle, ref stringHandle);
            ResultHandler.VerifyResultCode(result, "Unable to get screenshot");
            string screenshotValue = string.Empty;
            using (StringWrapper wrapper = new StringWrapper(stringHandle))
            {
                screenshotValue = wrapper.Value;
            }

            if (!string.IsNullOrEmpty(screenshotValue))
            {
                currentScreenshot = new Screenshot(screenshotValue);
            }

            return currentScreenshot;
        }
        #endregion

        #region IDisposable Members
        /// <summary>
        /// Disposes of all unmanaged instances of InternetExplorerDriver.
        /// </summary>
        public void Dispose()
        {
            if (!disposed)
            {
                handle.Dispose();
                disposed = true;
            }
        }
        #endregion

        #region Internal and private support members
        /// <summary>
        /// Get the driver handle.
        /// </summary>
        /// <returns>The underlying handle.</returns>
        internal SafeInternetExplorerDriverHandle GetUnderlayingHandle()
        {
            return handle;
        }

        /// <summary>
        /// Wait for the load to complete.
        /// </summary>
        internal void WaitForLoadToComplete()
        {
            NativeDriverLibrary.Instance.WaitForLoadToComplete(handle);
        }

        private static WebDriverResult PopulateArguments(SafeScriptArgsHandle scriptArgs, object[] args)
        {
            WebDriverResult result = WebDriverResult.Success;

            foreach (object arg in args)
            {
                string stringArg = arg as string;
                InternetExplorerWebElement webElementArg = arg as InternetExplorerWebElement;

                if (stringArg != null)
                {
                    result = NativeDriverLibrary.Instance.AddStringScriptArg(scriptArgs, stringArg);
                }
                else if (arg is bool)
                {
                    bool param = (bool)arg;
                    result = NativeDriverLibrary.Instance.AddBooleanScriptArg(scriptArgs, !param ? 0 : 1);
                }
                else if (webElementArg != null)
                {
                    result = webElementArg.AddToScriptArgs(scriptArgs);
                }
                else if (arg is int || arg is short || arg is long)
                {
                    int param;
                    bool parseSucceeded = int.TryParse(arg.ToString(), out param);
                    if (!parseSucceeded)
                    {
                        throw new ArgumentException("Parameter is not recognized as an int: " + arg);
                    }

                    result = NativeDriverLibrary.Instance.AddNumberScriptArg(scriptArgs, param);
                }
                else if (arg is float || arg is double)
                {
                    double param;
                    bool parseSucceeded = double.TryParse(arg.ToString(), out param);
                    if (!parseSucceeded)
                    {
                        throw new ArgumentException("Parameter is not of recognized as a double: " + arg);
                    }

                    result = NativeDriverLibrary.Instance.AddDoubleScriptArg(scriptArgs, param);
                }
                else
                {
                    throw new ArgumentException("Parameter is not of recognized type: " + arg);
                }

                ResultHandler.VerifyResultCode(result, "Unable to add argument: " + arg);
            }

            return result;
        }

        private object ExtractReturnValue(SafeScriptResultHandle scriptResult)
        {
            WebDriverResult result;

            int type;
            result = NativeDriverLibrary.Instance.GetScriptResultType(handle, scriptResult, out type);

            ResultHandler.VerifyResultCode(result, "Cannot determine result type");

            object toReturn = null;
            try
            {
                switch (type)
                {
                    case 1:
                        SafeStringWrapperHandle stringHandle = new SafeStringWrapperHandle();
                        result = NativeDriverLibrary.Instance.GetStringScriptResult(scriptResult, ref stringHandle);
                        ResultHandler.VerifyResultCode(result, "Cannot extract string result");
                        using (StringWrapper wrapper = new StringWrapper(stringHandle))
                        {
                            toReturn = wrapper.Value;
                        }

                        break;

                    case 2:
                        long longVal;
                        result = NativeDriverLibrary.Instance.GetNumberScriptResult(scriptResult, out longVal);
                        ResultHandler.VerifyResultCode(result, "Cannot extract number result");
                        toReturn = longVal;
                        break;

                    case 3:
                        int boolVal;
                        result = NativeDriverLibrary.Instance.GetBooleanScriptResult(scriptResult, out boolVal);
                        ResultHandler.VerifyResultCode(result, "Cannot extract boolean result");
                        toReturn = boolVal == 1 ? true : false;
                        break;

                    case 4:
                        SafeInternetExplorerWebElementHandle element;
                        result = NativeDriverLibrary.Instance.GetElementScriptResult(scriptResult, handle, out element);
                        ResultHandler.VerifyResultCode(result, "Cannot extract element result");
                        toReturn = new InternetExplorerWebElement(this, element);
                        break;

                    case 5:
                        toReturn = null;
                        break;

                    case 6:
                        SafeStringWrapperHandle messageHandle = new SafeStringWrapperHandle();
                        result = NativeDriverLibrary.Instance.GetStringScriptResult(scriptResult, ref messageHandle);
                        ResultHandler.VerifyResultCode(result, "Cannot extract string result");
                        string message = string.Empty;
                        using (StringWrapper wrapper = new StringWrapper(messageHandle))
                        {
                            message = wrapper.Value;
                        }

                        throw new WebDriverException(message);

                    case 7:
                        double doubleVal;
                        result = NativeDriverLibrary.Instance.GetDoubleScriptResult(scriptResult, out doubleVal);
                        ResultHandler.VerifyResultCode(result, "Cannot extract number result");
                        toReturn = doubleVal;
                        break;

                    case 8:
                        bool allArrayItemsAreElements = true;
                        int arrayLength = 0;
                        result = NativeDriverLibrary.Instance.GetArrayLengthScriptResult(handle, scriptResult, out arrayLength);
                        ResultHandler.VerifyResultCode(result, "Cannot extract array length."); 
                        List<object> list = new List<object>();
                        for (int i = 0; i < arrayLength; i++) 
                        {         
                            // Get reference to object
                            SafeScriptResultHandle currItemHandle = new SafeScriptResultHandle();
                            WebDriverResult getItemResult = NativeDriverLibrary.Instance.GetArrayItemFromScriptResult(handle, scriptResult, i, out currItemHandle);
                            if (getItemResult != WebDriverResult.Success)
                            {
                                // Note about memory management: Usually memory for this item
                                // will be released during the recursive call to
                                // ExtractReturnValue. It is freed explicitly here since a
                                // recursive call will not happen.
                                currItemHandle.Dispose();
                                throw new WebDriverException(string.Format(CultureInfo.InvariantCulture, "Cannot extract element from collection at index: {0} ({1})", i, result));
                            }

                            object arrayItem = ExtractReturnValue(currItemHandle);
                            if (allArrayItemsAreElements && !(arrayItem is IWebElement))
                            {
                                allArrayItemsAreElements = false;
                            }

                            // Call ExtractReturnValue with the fetched item (recursive)
                            list.Add(arrayItem);
                        }

                        if (allArrayItemsAreElements)
                        {
                            List<IWebElement> elementList = new List<IWebElement>();
                            foreach (object item in list)
                            {
                                elementList.Add((IWebElement)item);
                            }

                            toReturn = elementList.AsReadOnly();
                        }
                        else
                        {
                            toReturn = list.AsReadOnly();
                        }

                        break; 

                    default:
                        throw new WebDriverException("Cannot determine result type");
                }
            }
            finally
            {
                scriptResult.Dispose();
            }

            return toReturn;
        }
        #endregion

        #region IOptions class
        /// <summary>
        /// Provides a mechanism for setting options needed for the driver during the test.
        /// </summary>
        private class InternetExplorerOptions : IOptions
        {
            private Speed internalSpeed = Speed.Fast;
            private InternetExplorerDriver driver;

            /// <summary>
            /// Initializes a new instance of the InternetExplorerOptions class.
            /// </summary>
            /// <param name="driver">Instance of the driver currently in use.</param>
            public InternetExplorerOptions(InternetExplorerDriver driver)
            {
                this.driver = driver;
            }

            /// <summary>
            /// Gets or sets the speed with which actions are executed in the browser.
            /// </summary>
            public Speed Speed
            {
                get { return internalSpeed; }
                set { internalSpeed = value; }
            }

            /// <summary>
            /// Method for creating a cookie in the browser.
            /// </summary>
            /// <param name="cookie"><see cref="Cookie"/> that represents a cookie in the browser.</param>
            public void AddCookie(Cookie cookie)
            {
                ////wdAddCookie does not properly add cookies with expiration dates,
                ////thus cookies are not properly deleted. Use JavaScript execution,
                ////just like the Java implementation does.
                ////string cookieString = cookie.ToString();
                ////WebDriverResult result = NativeDriverLibrary.Instance.AddCookie(driver.handle, cookieString);
                ////ResultHandler.VerifyResultCode(result, "Add Cookie");
                StringBuilder sb = new StringBuilder(cookie.Name);
                sb.Append("=");
                sb.Append(cookie.Value);
                sb.Append("; ");
                if (!string.IsNullOrEmpty(cookie.Path))
                {
                    sb.Append("path=");
                    sb.Append(cookie.Path);
                    sb.Append("; ");
                }

                if (!string.IsNullOrEmpty(cookie.Domain))
                {
                    string domain = cookie.Domain;
                    int colon = domain.IndexOf(":", StringComparison.OrdinalIgnoreCase);
                    if (colon != -1)
                    {
                        domain = domain.Substring(0, colon);
                    }

                    sb.Append("domain=");
                    sb.Append(domain);
                    sb.Append("; ");
                }

                if (cookie.Expiry != null)
                {
                    sb.Append("expires=");
                    sb.Append(cookie.Expiry.Value.ToUniversalTime().ToString("ddd MM/dd/yyyy HH:mm:ss UTC", CultureInfo.InvariantCulture));
                }

                driver.ExecuteScript("document.cookie = arguments[0]", sb.ToString());
            }

            /// <summary>
            /// Method for getting a Collection of Cookies that are present in the browser.
            /// </summary>
            /// <returns>ReadOnlyCollection of Cookies in the browser.</returns>
            public ReadOnlyCollection<Cookie> GetCookies()
            {
                Uri currentUri = GetCurrentUri();

                SafeStringWrapperHandle stringHandle = new SafeStringWrapperHandle();
                WebDriverResult result = NativeDriverLibrary.Instance.GetCookies(driver.handle, ref stringHandle);
                ResultHandler.VerifyResultCode(result, "Getting Cookies");
                string allDomainCookies = string.Empty;
                using (StringWrapper wrapper = new StringWrapper(stringHandle))
                {
                    allDomainCookies = wrapper.Value;
                }

                List<Cookie> toReturn = new List<Cookie>();

                string[] cookies = allDomainCookies.Split(new string[] { "; " }, StringSplitOptions.RemoveEmptyEntries);
                foreach (string cookie in cookies)
                {
                    string[] parts = cookie.Split(new string[] { "=" }, StringSplitOptions.RemoveEmptyEntries);
                    if (parts.Length != 2)
                    {
                        continue;
                    }

                    toReturn.Add(new ReturnedCookie(parts[0], parts[1], currentUri.Host, string.Empty, null, false, currentUri));
                }

                return new ReadOnlyCollection<Cookie>(toReturn);
            }

            /// <summary>
            /// Method for returning a getting a cookie by name.
            /// </summary>
            /// <param name="name">name of the cookie that needs to be returned.</param>
            /// <returns>The <see cref="Cookie"/> with the name that was passed in.</returns>
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
            /// Delete All Cookies that are present in the browser.
            /// </summary>
            public void DeleteAllCookies()
            {
                ReadOnlyCollection<Cookie> allCookies = GetCookies();
                foreach (Cookie cookieToDelete in allCookies)
                {
                    DeleteCookie(cookieToDelete);
                }
            }

            /// <summary>
            /// Delete a cookie in the browser that is the.
            /// </summary>
            /// <param name="cookie">An object that represents a copy of the cookie that needs to be deleted.</param>
            public void DeleteCookie(Cookie cookie)
            {
                ////Uri currentUri = new Uri(driver.Url);
                ////DateTime dateInPast = DateTime.MinValue;
                ////AddCookie(new Cookie(cookie.Name, cookie.Value, currentUri.Host, currentUri.PathAndQuery, dateInPast));
                if (cookie == null)
                {
                    throw new WebDriverException("Cookie to delete cannot be null");
                }

                string currentUrl = driver.Url;
                try
                {
                    Uri uri = new Uri(currentUrl);

                    Cookie toDelete = new NullPathCookie(cookie.Name, cookie.Value, uri.Host, uri.AbsolutePath, DateTime.MinValue);

                    DeleteCookieByPath(toDelete);
                }
                catch (UriFormatException e)
                {
                    throw new WebDriverException("Cannot delete cookie: " + e.Message);
                }
            }

            /// <summary>
            /// Delete the cookie by passing in the name of the cookie.
            /// </summary>
            /// <param name="name">The name of the cookie that is in the browser.</param>
            public void DeleteCookieNamed(string name)
            {
                DeleteCookie(GetCookieNamed(name));
            }

            /// <summary>
            /// Provides access to the timeouts defined for this driver.
            /// </summary>
            /// <returns>An object implementing the <see cref="ITimeouts"/> interface.</returns>
            public ITimeouts Timeouts()
            {
                return new InternetExplorerTimeouts(driver);
            }

            private Uri GetCurrentUri()
            {
                Uri currentUri = null;
                try
                {
                    currentUri = new Uri(driver.Url);
                }
                catch (UriFormatException)
                {
                }

                return currentUri;
            }

            private void DeleteCookieByPath(Cookie cookie)
            {
                Cookie toDelete = null;
                string path = cookie.Path;

                if (path != null)
                {
                    string[] segments = cookie.Path.Split(new char[] { '/' });
                    StringBuilder currentPath = new StringBuilder();
                    foreach (string segment in segments)
                    {
                        if (string.IsNullOrEmpty(segment))
                        {
                            continue;
                        }

                        currentPath.Append("/");
                        currentPath.Append(segment);

                        toDelete = new NullPathCookie(cookie.Name, cookie.Value, cookie.Domain, currentPath.ToString(), DateTime.MinValue);

                        RecursivelyDeleteCookieByDomain(toDelete);
                    }
                }

                toDelete = new NullPathCookie(cookie.Name, cookie.Value, cookie.Domain, "/", DateTime.MinValue);
                RecursivelyDeleteCookieByDomain(toDelete);

                toDelete = new NullPathCookie(cookie.Name, cookie.Value, cookie.Domain, null, DateTime.MinValue);
                RecursivelyDeleteCookieByDomain(toDelete);
            }

            private void RecursivelyDeleteCookieByDomain(Cookie cookie)
            {
                AddCookie(cookie);

                int dotIndex = cookie.Domain.IndexOf('.');
                if (dotIndex == 0)
                {
                    string domain = cookie.Domain.Substring(1);
                    Cookie toDelete = new NullPathCookie(cookie.Name, cookie.Value, domain, cookie.Path, DateTime.MinValue);
                    RecursivelyDeleteCookieByDomain(toDelete);
                }
                else if (dotIndex != -1)
                {
                    string domain = cookie.Domain.Substring(dotIndex);
                    Cookie toDelete = new NullPathCookie(cookie.Name, cookie.Value, domain, cookie.Path, DateTime.MinValue);
                    RecursivelyDeleteCookieByDomain(toDelete);
                }
                else
                {
                    Cookie toDelete = new NullPathCookie(cookie.Name, cookie.Value, string.Empty, cookie.Path, DateTime.MinValue);
                    AddCookie(toDelete);
                }
            }

            #region ITimeouts class
            /// <summary>
            /// Defines the interface through which the user can define timeouts.
            /// </summary>
            private class InternetExplorerTimeouts : ITimeouts
            {
                private InternetExplorerDriver driver;

                /// <summary>
                /// Initializes a new instance of the InternetExplorerTimeouts class
                /// </summary>
                /// <param name="driver">The driver that is currently in use</param>
                public InternetExplorerTimeouts(InternetExplorerDriver driver)
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
                /// a <see cref="ElementNotFoundException"/>. When searching for multiple elements,
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
                    int timeInMilliseconds = Convert.ToInt32(timeToWait.TotalMilliseconds);
                    WebDriverResult result = NativeDriverLibrary.Instance.SetImplicitWaitTimeout(driver.handle, timeInMilliseconds);
                    return this;
                }
                #endregion
            }
            #endregion
        }
        #endregion

        #region ITargetLocator class
        /// <summary>
        /// Provides a mechanism for finding elements on the page with locators.
        /// </summary>
        private class InternetExplorerTargetLocator : ITargetLocator
        {
            private InternetExplorerDriver driver;

            /// <summary>
            /// Initializes a new instance of the InternetExplorerTargetLocator class.
            /// </summary>
            /// <param name="driver">The driver that is currently in use.</param>
            public InternetExplorerTargetLocator(InternetExplorerDriver driver)
            {
                this.driver = driver;
            }
            
            /// <summary>
            /// Move to a different frame using its index. Indexes are Zero based and their may be issues if a 
            /// frame is named as an integer.
            /// </summary>
            /// <param name="frameIndex">The index of the frame.</param>
            /// <returns>A WebDriver instance that is currently in use.</returns>
            public IWebDriver Frame(int frameIndex)
            {
                return Frame(frameIndex.ToString(CultureInfo.InvariantCulture));
            }

            /// <summary>
            /// Move to different frame using its name.
            /// </summary>
            /// <param name="frameName">name of the frame.</param>
            /// <returns>A WebDriver instance that is currently in use.</returns>
            public IWebDriver Frame(string frameName)
            {
                if (frameName == null)
                {
                    /* TODO(andre.nogueira): At least the IE driver crashes when
                    * a null is received. I'd much rather move this to the driver itself.
                    * In Java this is not a problem because of "new WString" which
                     does this check for us. */
                    throw new ArgumentNullException("frameName", "Frame name cannot be null");
                }

                WebDriverResult res = NativeDriverLibrary.Instance.SwitchToFrame(driver.handle, frameName);
                ResultHandler.VerifyResultCode(res, "switch to frame " + frameName);
                ////TODO(andre.nogueira): If this fails, driver cannot be used and has to be
                ////set to a valid frame... What's the best way of doing this?
                return driver;
            }

            /// <summary>
            /// Change to the Window by passing in the name.
            /// </summary>
            /// <param name="windowName">name of the window that you wish to move to.</param>
            /// <returns>A WebDriver instance that is currently in use.</returns>
            public IWebDriver Window(string windowName)
            {
                WebDriverResult result = NativeDriverLibrary.Instance.SwitchToWindow(driver.handle, windowName);
                ResultHandler.VerifyResultCode(result, "Could not switch to window " + windowName);
                return driver;
            }

            /// <summary>
            /// Move the driver back to the default.
            /// </summary>
            /// <returns>Empty frame to the driver.</returns>
            public IWebDriver DefaultContent()
            {
                return Frame(string.Empty);
            }

            /// <summary>
            /// Finds the currently active element.
            /// </summary>
            /// <returns>WebElement of the active element.</returns>
            public IWebElement ActiveElement()
            {
                SafeInternetExplorerWebElementHandle rawElement = new SafeInternetExplorerWebElementHandle();
                WebDriverResult result = NativeDriverLibrary.Instance.SwitchToActiveElement(driver.handle, ref rawElement);

                ResultHandler.VerifyResultCode(result, "Unable to find active element");

                return new InternetExplorerWebElement(driver, rawElement);
            }
        }
        #endregion

        #region INavigation class
        /// <summary>
        /// Provides a mechanism for Navigating with the driver.
        /// </summary>
        private class InternetExplorerNavigation : INavigation
        {
            private InternetExplorerDriver driver;

            /// <summary>
            /// Initializes a new instance of the InternetExplorerNavigation class.
            /// </summary>
            /// <param name="driver">Driver in use</param>
            public InternetExplorerNavigation(InternetExplorerDriver driver)
            {
                this.driver = driver;
            }

            /// <summary>
            /// Move the browser back.
            /// </summary>
            public void Back()
            {
                WebDriverResult result = NativeDriverLibrary.Instance.GoBack(driver.handle);
                ResultHandler.VerifyResultCode(result, "Going back in history");
            }

            /// <summary>
            /// Move the browser forward.
            /// </summary>
            public void Forward()
            {
                WebDriverResult result = NativeDriverLibrary.Instance.GoForward(driver.handle);
                ResultHandler.VerifyResultCode(result, "Going forward in history");
            }

            /// <summary>
            /// Navigate to a url for your test.
            /// </summary>
            /// <param name="url">Uri object of where you want the browser to go to.</param>
            public void GoToUrl(Uri url)
            {
                if (url == null)
                {
                    throw new ArgumentNullException("url", "URL cannot be null.");
                }

                string address = url.AbsoluteUri;
                driver.Url = address;
            }

            /// <summary>
            /// Navigate to a url for your test.
            /// </summary>
            /// <param name="url">string of the URL you want the browser to go to.</param>
            public void GoToUrl(string url)
            {
                driver.Url = url;
            }

            /// <summary>
            /// Refresh the browser.
            /// </summary>
            public void Refresh()
            {
                WebDriverResult result = NativeDriverLibrary.Instance.Refresh(driver.handle);
                ResultHandler.VerifyResultCode(result, "Refreshing page");
            }
        }
        #endregion

        #region Private support classes
        /// <summary>
        /// Provides a Null Path Cookie.
        /// </summary>
        private class NullPathCookie : Cookie
        {
            private string cookiePath;

            /// <summary>
            /// Initializes a new instance of the NullPathCookie class.
            /// </summary>
            /// <param name="name">name of the cookie.</param>
            /// <param name="value">value of the cookie.</param>
            /// <param name="domain">domain of the cookie.</param>
            /// <param name="path">path of the cookie.</param>
            /// <param name="expiry">date when the cookie expires, can be null.</param>
            public NullPathCookie(string name, string value, string domain, string path, DateTime? expiry) :
                base(name, value, domain, path, expiry)
            {
                this.cookiePath = path;
            }

            /// <summary>
            /// Gets the value of the path from the cookie.
            /// </summary>
            public override string Path
            {
                get { return cookiePath; }
            }
        }
        #endregion
    }
}
