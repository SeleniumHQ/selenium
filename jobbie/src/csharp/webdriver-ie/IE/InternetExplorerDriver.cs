using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.Globalization;
using System.Security.Permissions;
using System.Text;
using OpenQA.Selenium.Internal;

namespace OpenQA.Selenium.IE
{
    public sealed class InternetExplorerDriver : IWebDriver, ISearchContext, IJavaScriptExecutor
    {
        private bool disposed;
        private SafeInternetExplorerDriverHandle handle;

        public InternetExplorerDriver()
        {
            handle = new SafeInternetExplorerDriverHandle();
            WebDriverResult result = NativeMethods.wdNewDriverInstance(ref handle);
            if (result != WebDriverResult.Success)
            {
                throw new WebDriverException(string.Format(CultureInfo.InvariantCulture, "Cannot create new browser instance: {0}", result.ToString()));
            }
        }

        public void Dispose()
        {
            if (!disposed)
            {
                handle.Dispose();
                disposed = true;
            }
        }

        public string Url
        {
            get
            {
                SafeStringWrapperHandle stringHandle = new SafeStringWrapperHandle();

                WebDriverResult result = NativeMethods.wdGetCurrentUrl(handle, ref stringHandle);
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
                WebDriverResult result = NativeMethods.wdGet(handle, value);
                if (result != WebDriverResult.Success)
                {
                    ResultHandler.VerifyResultCode(result, string.Format(CultureInfo.InvariantCulture, "Cannot go to '{0}': {1}", value, result.ToString()));
                }
            }
        }

        public string Title
        {
            get
            {
                SafeStringWrapperHandle stringHandle = new SafeStringWrapperHandle();

                WebDriverResult result = NativeMethods.wdGetTitle(handle, ref stringHandle);
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

        public bool Visible
        {
            get
            {
                int visible = 0;
                WebDriverResult result = NativeMethods.wdGetVisible(handle, ref visible);
                ResultHandler.VerifyResultCode(result, "Unable to determine if browser is visible");
                return (visible == 1);
            }

            set
            {
                WebDriverResult result = NativeMethods.wdSetVisible(handle, value ? 1 : 0);
                ResultHandler.VerifyResultCode(result, "Unable to change the visibility of the browser");
            }
        }

        public ReadOnlyCollection<IWebElement> FindElements(By by)
        {
            return by.FindElements(new Finder(this, new SafeInternetExplorerWebElementHandle()));
        }

        public IWebElement FindElement(By by)
        {
            return by.FindElement(new Finder(this, new SafeInternetExplorerWebElementHandle()));
        }

        internal void WaitForLoadToComplete()
        {
            NativeMethods.wdWaitForLoadToComplete(handle);
        }

        public void Close()
        {
            WebDriverResult result = NativeMethods.wdClose(handle);
            if (result != WebDriverResult.Success)
            {
                throw new InvalidOperationException("Unable to close driver: " + result.ToString());
            }
        }

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

        public string PageSource
        {
            get
            {
                SafeStringWrapperHandle stringHandle = new SafeStringWrapperHandle();
                WebDriverResult result = NativeMethods.wdGetPageSource(handle, ref stringHandle);
                ResultHandler.VerifyResultCode(result, "Unable to get page source");
                string returnValue = string.Empty;
                using (StringWrapper wrapper = new StringWrapper(stringHandle))
                {
                    returnValue = wrapper.Value;
                }
                return returnValue;
            }
        }

        public object ExecuteScript(String script, params Object[] args)
        {
            object toReturn = null;
            SafeScriptArgsHandle scriptArgsHandle = new SafeScriptArgsHandle();
            WebDriverResult result = NativeMethods.wdNewScriptArgs(ref scriptArgsHandle, args.Length);
            ResultHandler.VerifyResultCode(result, "Unable to create new script arguments array");

            try
            {
                PopulateArguments(scriptArgsHandle, args);

                script = "(function() { return function(){" + script + "};})();";

                SafeScriptResultHandle scriptResultHandle = new SafeScriptResultHandle();
                result = NativeMethods.wdExecuteScript(handle, script, scriptArgsHandle, ref scriptResultHandle);

                ResultHandler.VerifyResultCode(result,"Cannot execute script");
                try
                {
                    toReturn = ExtractReturnValue(scriptResultHandle);
                }
                finally
                {
                    scriptResultHandle.Dispose();
                }
            }
            finally
            {
                scriptArgsHandle.Dispose();
            }
            return toReturn;
        }

        private object ExtractReturnValue(SafeScriptResultHandle scriptResult)
        {
            WebDriverResult result;

            int type;
            result = NativeMethods.wdGetScriptResultType(scriptResult, out type);

            ResultHandler.VerifyResultCode(result, "Cannot determine result type");

            object toReturn = null;
            switch (type)
            {
                case 1:
                    SafeStringWrapperHandle stringHandle = new SafeStringWrapperHandle();
                    result = NativeMethods.wdGetStringScriptResult(scriptResult, ref stringHandle);
                    ResultHandler.VerifyResultCode(result, "Cannot extract string result");
                    using (StringWrapper wrapper = new StringWrapper(stringHandle))
                    {
                        toReturn = wrapper.Value;
                    }
                    break;

                case 2:
                    long longVal;
                    result = NativeMethods.wdGetNumberScriptResult(scriptResult, out longVal);
                    ResultHandler.VerifyResultCode(result, "Cannot extract number result");
                    toReturn = longVal;
                    break;

                case 3:
                    int boolVal;
                    result = NativeMethods.wdGetBooleanScriptResult(scriptResult, out boolVal);
                    ResultHandler.VerifyResultCode(result, "Cannot extract boolean result");
                    toReturn = boolVal == 1 ? true : false;
                    break;

                case 4:
                    SafeInternetExplorerWebElementHandle element;
                    result = NativeMethods.wdGetElementScriptResult(scriptResult, handle, out element);
                    ResultHandler.VerifyResultCode(result, "Cannot extract element result");
                    toReturn = new InternetExplorerWebElement(this, element);
                    break;

                case 5:
                    toReturn = null;
                    break;

                case 6:
                    SafeStringWrapperHandle messageHandle = new SafeStringWrapperHandle();
                    result = NativeMethods.wdGetStringScriptResult(scriptResult, ref messageHandle);
                    ResultHandler.VerifyResultCode(result, "Cannot extract string result");
                    string message = string.Empty;
                    using (StringWrapper wrapper = new StringWrapper(messageHandle))
                    {
                        message = wrapper.Value;
                    }
                    throw new WebDriverException(message);
                case 7:
                    double doubleVal;
                    result = NativeMethods.wdGetDoubleScriptResult(scriptResult, out doubleVal);
                    ResultHandler.VerifyResultCode(result, "Cannot extract number result");
                    toReturn = doubleVal;
                    break;
                default:
                    throw new WebDriverException("Cannot determine result type");
            }
            return toReturn;
        }

        private static WebDriverResult PopulateArguments(SafeScriptArgsHandle scriptArgs, object[] args)
        {
            WebDriverResult result = WebDriverResult.Success;

            foreach(object arg in args)
            {
                string stringArg = arg as string;
                InternetExplorerWebElement webElementArg = arg as InternetExplorerWebElement;

                if (stringArg != null)
                {
                    result = NativeMethods.wdAddStringScriptArg(scriptArgs, stringArg);
                }
                else if (arg is bool)
                {
                    bool param = (bool)arg;
                    result = NativeMethods.wdAddBooleanScriptArg(scriptArgs, !param ? 0 : 1);
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

                    result = NativeMethods.wdAddNumberScriptArg(scriptArgs, param);
                }
                else if (arg is float || arg is double)
                {
                    double param;
                    bool parseSucceeded = double.TryParse(arg.ToString(), out param);
                    if (!parseSucceeded)
                    {
                        throw new ArgumentException("Parameter is not of recognized as a double: " + arg);
                    }
                    result = NativeMethods.wdAddDoubleScriptArg(scriptArgs, param);
                }
                else
                {
                    throw new ArgumentException("Parameter is not of recognized type: " + arg);
                }

                ResultHandler.VerifyResultCode(result, "Unable to add argument: " + arg);
            }

            return result;
        }

        public ReadOnlyCollection<string> GetWindowHandles()
        {
            SafeStringCollectionHandle handlesPtr = new SafeStringCollectionHandle();
            WebDriverResult result = NativeMethods.wdGetAllWindowHandles(handle, ref handlesPtr);

            ResultHandler.VerifyResultCode(result, "Unable to obtain all window handles");

            List<string> windowHandleList = new List<string>();
            using (StringCollection windowHandleStringCollection = new StringCollection(handlesPtr))
            {
                windowHandleList = windowHandleStringCollection.ToList();
            }

            return new ReadOnlyCollection<string>(windowHandleList);
        }

        public String GetWindowHandle()
        {
            SafeStringWrapperHandle stringHandle = new SafeStringWrapperHandle();
            WebDriverResult result = NativeMethods.wdGetCurrentWindowHandle(handle, out stringHandle);
            ResultHandler.VerifyResultCode(result, "Unable to obtain current window handle");
            string handleValue = string.Empty;
            using (StringWrapper wrapper = new StringWrapper(stringHandle))
            {
                handleValue = wrapper.Value;
            }
            return handleValue;
        }

        public ITargetLocator SwitchTo()
        {
            return new InternetExplorerTargetLocator(this);
        }

        public IOptions Manage()
        {
            return new InternetExplorerOptions(this);
        }

        public INavigation Navigate()
        {
            return new InternetExplorerNavigation(this);
        }

        internal SafeInternetExplorerDriverHandle GetUnderlayingHandle()
        {
            return handle;
        }

        private class InternetExplorerOptions : IOptions
        {
            private Speed internalSpeed = Speed.Fast;
            private InternetExplorerDriver driver;

            public InternetExplorerOptions(InternetExplorerDriver driver)
            {
                this.driver = driver;
            }

            public Speed Speed
            {
                get { return internalSpeed; }
                set { internalSpeed = value; }
            }

            public void AddCookie(Cookie cookie)
            {
                //wdAddCookie does not properly add cookies with expiration dates,
                //thus cookies are not properly deleted. Use JavaScript execution,
                //just like the Java implementation does.
                //string cookieString = cookie.ToString();
                //WebDriverResult result = NativeMethods.wdAddCookie(driver.handle, cookieString);
                //ResultHandler.VerifyResultCode(result, "Add Cookie");
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

            public ReadOnlyCollection<Cookie> GetCookies()
            {
                Uri currentUri = GetCurrentUri();

                SafeStringWrapperHandle stringHandle = new SafeStringWrapperHandle();
                WebDriverResult result = NativeMethods.wdGetCookies(driver.handle, ref stringHandle);
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

                    toReturn.Add(new ReturnedCookie(parts[0], parts[1], currentUri.Host, "", null, false, currentUri));
                }

                return new ReadOnlyCollection<Cookie>(toReturn);
            }

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

            public void DeleteAllCookies()
            {
                ReadOnlyCollection<Cookie> allCookies = GetCookies();
                foreach (Cookie cookieToDelete in allCookies)
                {
                    DeleteCookie(cookieToDelete);
                }
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

            public void DeleteCookie(Cookie cookie)
            {
                //Uri currentUri = new Uri(driver.Url);
                //DateTime dateInPast = DateTime.MinValue;
                //AddCookie(new Cookie(cookie.Name, cookie.Value, currentUri.Host, currentUri.PathAndQuery, dateInPast));
                if (cookie == null)
                {
                    throw new WebDriverException("Cookie to delete cannot be null");
                }

                string currentUrl = driver.Url;
                try
                {
                    Uri uri = new Uri(currentUrl);

                    Cookie toDelete = new NullPathCookie(cookie.Name, cookie.Value, uri.Host,
                                                         uri.AbsolutePath, DateTime.MinValue);

                    DeleteCookieByPath(toDelete);
                }
                catch (UriFormatException e)
                {
                    throw new WebDriverException("Cannot delete cookie: " + e.Message);
                }

            }

            public void DeleteCookieNamed(string name)
            {
                DeleteCookie(GetCookieNamed(name));
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
                            continue;

                        currentPath.Append("/");
                        currentPath.Append(segment);

                        toDelete = new NullPathCookie(cookie.Name, cookie.Value,
                                                             cookie.Domain, currentPath.ToString(),
                                                             DateTime.MinValue);

                        RecursivelyDeleteCookieByDomain(toDelete);
                    }
                }
                toDelete = new NullPathCookie(cookie.Name, cookie.Value,
                                                         cookie.Domain, "/",
                                                         DateTime.MinValue);
                RecursivelyDeleteCookieByDomain(toDelete);

                toDelete = new NullPathCookie(cookie.Name, cookie.Value,
                                                         cookie.Domain, null,
                                                         DateTime.MinValue);
                RecursivelyDeleteCookieByDomain(toDelete);
            }

            private void RecursivelyDeleteCookieByDomain(Cookie cookie)
            {
                AddCookie(cookie);

                int dotIndex = cookie.Domain.IndexOf('.');
                if (dotIndex == 0)
                {
                    String domain = cookie.Domain.Substring(1);
                    Cookie toDelete =
                      new NullPathCookie(cookie.Name, cookie.Value, domain,
                                         cookie.Path, DateTime.MinValue);
                    RecursivelyDeleteCookieByDomain(toDelete);
                }
                else if (dotIndex != -1)
                {
                    String domain = cookie.Domain.Substring(dotIndex);
                    Cookie toDelete =
                      new NullPathCookie(cookie.Name, cookie.Value, domain,
                                         cookie.Path, DateTime.MinValue);
                    RecursivelyDeleteCookieByDomain(toDelete);
                }
                else
                {
                    Cookie toDelete =
                      new NullPathCookie(cookie.Name, cookie.Value, "",
                                         cookie.Path, DateTime.MinValue);
                    AddCookie(toDelete);
                }
            }
        }

        private class InternetExplorerTargetLocator : ITargetLocator
        {
            InternetExplorerDriver driver;

            public InternetExplorerTargetLocator(InternetExplorerDriver driver)
            {
                this.driver = driver;
            }

            // TODO(andre.nogueira): Documentation should mention
            // indexes are 0-based, and that there might be problems
            // when frames are named as integers.
            public IWebDriver Frame(int frameIndex)
            {
                return Frame(frameIndex.ToString(CultureInfo.InvariantCulture));
            }

            public IWebDriver Frame(string frameName)
            {
                if (frameName == null)
                {
                    // TODO(andre.nogueira): At least the IE driver crashes when
                    // a null is received. I'd much rather move this to the driver itself.
                    // In Java this is not a problem because of "new WString" which
                    // does this check for us.
                    throw new ArgumentNullException("frameName", "Frame name cannot be null");
                }
                WebDriverResult res = NativeMethods.wdSwitchToFrame(driver.handle, frameName);
                ResultHandler.VerifyResultCode(res, "switch to frame " + frameName);
                //TODO(andre.nogueira): If this fails, driver cannot be used and has to be
                //set to a valid frame... What's the best way of doing this?
                return driver;
            }

            public IWebDriver Window(string windowName)
            {
                WebDriverResult result = NativeMethods.wdSwitchToWindow(driver.handle, windowName);
                ResultHandler.VerifyResultCode(result, "Could not switch to window " + windowName);
                return driver;
            }

            public IWebDriver DefaultContent()
            {
                return Frame("");
            }

            public IWebElement ActiveElement()
            {
                SafeInternetExplorerWebElementHandle rawElement = new SafeInternetExplorerWebElementHandle();
                WebDriverResult result = NativeMethods.wdSwitchToActiveElement(driver.handle, ref rawElement);

                ResultHandler.VerifyResultCode(result, "Unable to find active element");

                return new InternetExplorerWebElement(driver, rawElement);
            }

        }

        private class InternetExplorerNavigation : INavigation
        {
            InternetExplorerDriver driver;

            public InternetExplorerNavigation(InternetExplorerDriver driver)
            {
                this.driver = driver;
            }

            public void Back()
            {
                WebDriverResult result = NativeMethods.wdGoBack(driver.handle);
                ResultHandler.VerifyResultCode(result, "Going back in history");
            }

            public void Forward()
            {
                WebDriverResult result = NativeMethods.wdGoForward(driver.handle);
                ResultHandler.VerifyResultCode(result, "Going forward in history");
            }

            public void GoToUrl(Uri url)
            {
                if (url == null)
                {
                    throw new ArgumentNullException("url", "URL cannot be null.");
                }
                string address = url.AbsoluteUri;
                driver.Url = address;
            }

            public void GoToUrl(string url)
            {
                driver.Url = url;

            }

            public void Refresh()
            {
                throw new NotImplementedException("The refresh operation is not implemented.");
            }
        }

        private class NullPathCookie : Cookie
        {
            private string cookiePath;

            public NullPathCookie(string name, string value, string domain, string path, DateTime? expiry) :
                base(name, value, domain, path, expiry)
            {
                this.cookiePath = path;
            }

            public override string Path
            {
                get { return cookiePath; }
            }
        }
    }
}
