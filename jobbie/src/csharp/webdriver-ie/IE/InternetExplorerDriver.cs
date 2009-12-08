using System;
using System.Collections.Generic;
using System.Runtime.InteropServices;
using System.Text;

namespace OpenQa.Selenium.IE
{
    public class InternetExplorerDriver : IWebDriver, ISearchContext, IJavascriptExecutor
    {

        private bool disposed = false;
        private SafeInternetExplorerDriverHandle handle;

        [DllImport("InternetExplorerDriver")]
        private static extern int wdNewDriverInstance(ref SafeInternetExplorerDriverHandle handle);
        public InternetExplorerDriver()
        {
            handle = new SafeInternetExplorerDriverHandle();
            int result = wdNewDriverInstance(ref handle);
            if (result != 0)
            {
                throw new Exception("Doh!");
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

        [DllImport("InternetExplorerDriver", CharSet = CharSet.Unicode)]
        private static extern void wdGet(SafeHandle handle, string url);
        [DllImport("InternetExplorerDriver", CharSet = CharSet.Unicode)]
        private static extern int wdGetCurrentUrl(SafeHandle handle, ref StringWrapperHandle result);
        public string Url
        {
            get
            {
                StringWrapperHandle result = new StringWrapperHandle();

                int r = wdGetCurrentUrl(handle, ref result);
                if (r != 0)
                {
                    throw new Exception("wdGetCurrentUrl Doomed");
                }
                return result.Value;
            }
            set
            {
                if (disposed)
                {
                    throw new ObjectDisposedException("handle");
                }
                if (value == null)
                {
                    throw new ArgumentNullException("Argument 'url' cannot be null.");
                }
                wdGet(handle, value);
            }
        }

        [DllImport("InternetExplorerDriver", CharSet = CharSet.Unicode)]
        private static extern int wdGetTitle(SafeHandle handle, ref StringWrapperHandle result);
        public string Title
        {
            get
            {
                StringWrapperHandle result = new StringWrapperHandle();


                if (wdGetTitle(handle, ref result) != 0)
                {
                    throw new Exception("wdGetTitle Doomed");
                }
                return result.Value;
            }
        }

        [DllImport("InternetExplorerDriver", CharSet = CharSet.Unicode)]
        private static extern int wdSetVisible(SafeHandle handle, int visible);
        [DllImport("InternetExplorerDriver", CharSet = CharSet.Unicode)]
        private static extern int wdGetVisible(SafeHandle handle, ref int visible);
        public bool Visible
        {
            get
            {
                int visible = 0;
                wdGetVisible(handle, ref visible);
                return (visible == 1) ? true : false;
            }

            set
            {
                wdSetVisible(handle, value ? 1 : 0);
            }
        }

        public List<IWebElement> FindElements(By by)
        {
            return by.FindElements(new Finder(this, new ElementWrapper()));
        }

        public IWebElement FindElement(By by)
        {
            return by.FindElement(new Finder(this, new ElementWrapper()));
        }

        [DllImport("InternetExplorerDriver")]
        private static extern int wdWaitForLoadToComplete(SafeInternetExplorerDriverHandle driver);
        internal void WaitForLoadToComplete()
        {
            wdWaitForLoadToComplete(handle);
        }

        public void Close()
        {
            handle.CloseDriver();
        }

        public void Quit()
        {
            // This code mimics the Java implementation.
            try 
            {
                List<string> closedHandleList = new List<string>();
                List<string> handleList = GetWindowHandles();
                foreach (string handle in handleList)
                try 
                {
                    // OPTIMIZATION: Only handle windows once. If we encounter duplicate
                    // handles in the list, skip them.
                    if (!closedHandleList.Contains(handle))
                    {
                        closedHandleList.Add(handle);
                        SwitchTo().Window(handle);
                        Close();
                    }
                } 
                catch (NoSuchWindowException e)
                {
                    // doesn't matter one jot.
                }
            }
            catch (NotSupportedException e) 
            {
                // Stuff happens. Bail out
                handle.Close();
            }

            handle.Close();
            Dispose();
            handle = null;
        }

        [DllImport("InternetExplorerDriver")]
        private static extern int wdGetPageSource(SafeInternetExplorerDriverHandle driver, ref StringWrapperHandle wrapper);
        public string PageSource
        {
            get
            {
                StringWrapperHandle result = new StringWrapperHandle();
                if (wdGetPageSource(handle, ref result) != 0)
                {
                    throw new Exception("wdGetPageSource Doomed");
                }
                return result.Value;
            }
        }

        [DllImport("InternetExplorerDriver")]
        private static extern int wdNewScriptArgs(ref IntPtr scriptArgs, int maxLength);
        [DllImport("InternetExplorerDriver", CharSet = CharSet.Unicode)]
        private static extern int wdExecuteScript(SafeInternetExplorerDriverHandle driver, string script, IntPtr scriptArgs, ref IntPtr scriptRes);
        [DllImport("InternetExplorerDriver")]
        private static extern int wdFreeScriptArgs(IntPtr scriptArgs);
        public Object ExecuteScript(String script, params Object[] args)
        {

            Object toReturn = null;
            IntPtr scriptArgsRef = new IntPtr();
            int result = wdNewScriptArgs(ref scriptArgsRef, args.Length);
            ErrorHandler.VerifyErrorCode(result, "Unable to create new script arguments array");
            IntPtr scriptArgs = scriptArgsRef;

            try
            {
                PopulateArguments(scriptArgs, args);

                script = "(function() { return function(){" + script + "};})();";

                IntPtr scriptResultRef = new IntPtr();
                result = wdExecuteScript(handle, script, scriptArgs, ref scriptResultRef);

                ErrorHandler.VerifyErrorCode(result,"Cannot execute script");
                toReturn = ExtractReturnValue(scriptResultRef);
                
            }
            finally
            {
                wdFreeScriptArgs(scriptArgs);
            }
            return toReturn;
        }

        [DllImport("InternetExplorerDriver")]
        private static extern int wdGetScriptResultType(IntPtr scriptArgs, out int type);
        [DllImport("InternetExplorerDriver", CharSet = CharSet.Unicode)]
        private static extern int wdGetStringScriptResult(IntPtr scriptArgs, ref StringWrapperHandle resultString);
        [DllImport("InternetExplorerDriver")]
        private static extern int wdGetNumberScriptResult(IntPtr scriptArgs, out long resultNumber);
        [DllImport("InternetExplorerDriver")]
        private static extern int wdGetDoubleScriptResult(IntPtr scriptArgs, out double resultDouble);
        [DllImport("InternetExplorerDriver")]
        private static extern int wdGetBooleanScriptResult(IntPtr scriptArgs, out int resultNumber);
        [DllImport("InternetExplorerDriver")]
        private static extern int wdFreeScriptResult(IntPtr scriptArgs);
        [DllImport("InternetExplorerDriver")]
        private static extern int wdGetElementScriptResult(IntPtr scriptArgs, SafeInternetExplorerDriverHandle driver, out ElementWrapper value );
        private object ExtractReturnValue(IntPtr scriptResult)
        {
            int result;

            int type;
            result = wdGetScriptResultType(scriptResult, out type);

            ErrorHandler.VerifyErrorCode(result, "Cannot determine result type");

            try
            {
                object toReturn = null;
                switch (type)
                {
                    case 1:
                        StringWrapperHandle wrapper = new StringWrapperHandle();
                        result = wdGetStringScriptResult(scriptResult, ref wrapper);
                        ErrorHandler.VerifyErrorCode(result, "Cannot extract string result");
                        toReturn = wrapper.Value;
                        break;

                    case 2:
                        long longVal;
                        result = wdGetNumberScriptResult(scriptResult, out longVal);
                        ErrorHandler.VerifyErrorCode(result, "Cannot extract number result");
                        toReturn = longVal;
                        break;

                    case 3:
                        int boolVal;
                        result = wdGetBooleanScriptResult(scriptResult, out boolVal);
                        ErrorHandler.VerifyErrorCode(result, "Cannot extract boolean result");
                        toReturn = boolVal == 1 ? true : false;
                        break;

                    case 4:
                        ElementWrapper element;
                        result = wdGetElementScriptResult(scriptResult, handle, out element);
                        ErrorHandler.VerifyErrorCode(result, "Cannot extract element result");
                        toReturn = new InternetExplorerWebElement(this, element);
                        break;

                    case 5:
                        toReturn = null;
                        break;

                    case 6:
                        StringWrapperHandle message = new StringWrapperHandle();
                        result = wdGetStringScriptResult(scriptResult, ref message);
                        ErrorHandler.VerifyErrorCode(result, "Cannot extract string result");
                        throw new WebDriverException(message.Value);
                    case 7:
                        double doubleVal;
                        result = wdGetDoubleScriptResult(scriptResult, out doubleVal);
                        ErrorHandler.VerifyErrorCode(result, "Cannot extract number result");
                        toReturn = doubleVal;
                        break;
                    default:
                        throw new WebDriverException("Cannot determine result type");
                }
                return toReturn;
            }
            finally
            {
                wdFreeScriptResult(scriptResult);
            }
        }

        [DllImport("InternetExplorerDriver", CharSet = CharSet.Unicode)]
        private static extern int wdAddStringScriptArg(IntPtr scriptArgs, string arg);
        [DllImport("InternetExplorerDriver")]
        private static extern int wdAddBooleanScriptArg(IntPtr scriptArgs, int boolean);
        [DllImport("InternetExplorerDriver")]
        private static extern int wdAddNumberScriptArg(IntPtr scriptArgs, long param);
        [DllImport("InternetExplorerDriver")]
        private static extern int wdAddDoubleScriptArg(IntPtr scriptArgs, double param);
        private int PopulateArguments(IntPtr scriptArgs, Object[] args)
        {
            int result = 0;

            foreach(Object arg in args)
            {

                if (arg is String)
                {
                    result = wdAddStringScriptArg(scriptArgs, (String)arg);
                }
                else if (arg is Boolean)
                {
                    Boolean param = (Boolean)arg;
                    result = wdAddBooleanScriptArg(scriptArgs, !param ? 0 : 1);
                }
                else if (arg is InternetExplorerWebElement)
                {
                    result = ((InternetExplorerWebElement)arg).AddToScriptArgs(scriptArgs);
                }
                else if (arg is int || arg is short || arg is long)
                {
                    int param;
                    Int32.TryParse(arg.ToString(), out param);
                    result = wdAddNumberScriptArg(scriptArgs, param);
                }
                else if (arg is float || arg is double)
                {
                    double param;
                    Double.TryParse(arg.ToString(), out param);
                    result = wdAddDoubleScriptArg(scriptArgs, param);
                }
                else
                {
                    throw new ArgumentException("Parameter is not of recognized type: " + arg);
                }

                ErrorHandler.VerifyErrorCode(result, "Unable to add argument: " + arg);
            }

            return result;
        }

        //StringWrapperHandle wrapper = new StringWrapperHandle();
        //                result = wdGetStringScriptResult(scriptResult, ref wrapper);
        //                ErrorHandler.VerifyErrorCode(result, "Cannot extract string result");
        //                toReturn = wrapper.Value;
        //                break;
        
        [DllImport("InternetExplorerDriver")]
        private static extern int wdGetAllWindowHandles(IntPtr driver, ref IntPtr handles);
        public List<String> GetWindowHandles()
        {
            IntPtr handlesPtr = new IntPtr();
            int result = wdGetAllWindowHandles(handle.DangerousGetHandle(), ref handlesPtr);

            ErrorHandler.VerifyErrorCode(result, "Unable to obtain all window handles");

            return new StringCollection(this, handle, handlesPtr).ToList();
        }

        [DllImport("InternetExplorerDriver")]
        private static extern int wdGetCurrentWindowHandle(SafeInternetExplorerDriverHandle driver, out StringWrapperHandle handle);
        public String GetWindowHandle()
        {
            StringWrapperHandle handleName = new StringWrapperHandle();
            int result = wdGetCurrentWindowHandle(handle, out handleName);
            ErrorHandler.VerifyErrorCode(result, "Unable to obtain current window handle");
            return handleName.Value;
        }

        public ITargetLocator SwitchTo()
        {
            return new InternetExplorerTargetLocator(handle, this);
        }

        public IOptions Manage()
        {
            return new InternetExplorerOptions(handle, this);
        }

        public INavigation Navigate()
        {
            return new InternetExplorerNavigation(handle, this);
        }

        internal SafeInternetExplorerDriverHandle GetUnderlayingHandle()
        {
            return handle;
        }

        private class InternetExplorerOptions : IOptions
        {
            private Speed internalSpeed = Speed.Fast;
            private SafeInternetExplorerDriverHandle handle;
            private InternetExplorerDriver driver;

            public InternetExplorerOptions(SafeInternetExplorerDriverHandle handle,
                                           InternetExplorerDriver driver)
            {
                this.handle = handle;
                this.driver = driver;
            }

            public Speed Speed
            {
                get { return internalSpeed; }
                set { internalSpeed = value; }
            }

            [DllImport("InternetExplorerDriver", CharSet = CharSet.Unicode)]
            private static extern int wdAddCookie(SafeHandle handle, string cookie);
            public void AddCookie(Cookie cookie)
            {
                String cookieString = cookie.ToString();
                int result = wdAddCookie(handle, cookieString);
                ErrorHandler.VerifyErrorCode(result, "Add Cookie");
            }

            [DllImport("InternetExplorerDriver", CharSet = CharSet.Unicode)]
            private static extern int wdGetCookies(SafeHandle handle, ref StringWrapperHandle cookies);
            public Dictionary<String, Cookie> GetCookies()
            {
                String currentUrl = GetCurrentHost();

                StringWrapperHandle wrapper = new StringWrapperHandle();
                int result = wdGetCookies(handle, ref wrapper);
                ErrorHandler.VerifyErrorCode(result, "Getting Cookies");
                
                Dictionary<String, Cookie> toReturn = new Dictionary<String, Cookie>();
                String allDomainCookies = wrapper.Value;


                String[] cookies =
                    allDomainCookies.Split(new String[] { "; " },
                                           StringSplitOptions.RemoveEmptyEntries);
                foreach (String cookie in cookies)
                {
                    String[] parts = cookie.Split(new String[] { "=" }, StringSplitOptions.RemoveEmptyEntries);
                    if (parts.Length != 2)
                    {
                        continue;
                    }

                    toReturn.Add(parts[0], new Cookie(parts[0], parts[1], currentUrl, ""));
                }

                return toReturn;
            }

            public void DeleteAllCookies()
            {
                Dictionary<string, Cookie> allCookies = GetCookies();
                foreach (Cookie cookieToDelete in allCookies.Values)
                {
                    DeleteCookie(cookieToDelete);
                }
            }

            private String GetCurrentHost()
            {
                Uri uri = new Uri(driver.Url);
                return uri.Host;
            }

            public void DeleteCookie(Cookie cookie)
            {

                DateTime dateInPast = new DateTime(1);
                AddCookie(new Cookie(cookie.Name, "", cookie.Path, cookie.Domain, dateInPast));
            }

            public void DeleteCookieNamed(String name)
            {
                Cookie cookieToDelete = new Cookie(name, "", "/", "");
                String c = cookieToDelete.ToString();

                DeleteCookie(cookieToDelete);
            }
        }

        private class InternetExplorerTargetLocator : ITargetLocator
        {

            InternetExplorerDriver driver;
            SafeInternetExplorerDriverHandle handle;
            public InternetExplorerTargetLocator(SafeInternetExplorerDriverHandle handle,
                InternetExplorerDriver driver)
            {
                this.driver = driver;
                this.handle = handle;
            }

            // TODO(andre.nogueira): Documentation should mention
            // indexes are 0-based, and that there might be problems
            // when frames are named as integers.
            public IWebDriver Frame(int frameIndex)
            {
                return Frame(frameIndex.ToString());
            }

            [DllImport("InternetExplorerDriver", CharSet = CharSet.Unicode)]
            private static extern int wdSwitchToFrame(SafeInternetExplorerDriverHandle handle, string frameName);
            public IWebDriver Frame(string frameName)
            {
                if (frameName == null)
                {
                    // TODO(andre.nogueira): At least the IE driver crashes when
                    // a null is received. I'd much rather move this to the driver itself.
                    // In Java this is not a problem because of "new WString" which
                    // does this check for us.
                    throw new ArgumentNullException("Frame name cannot be null");
                }
                int res;
                res = wdSwitchToFrame(handle, frameName);
                ErrorHandler.VerifyErrorCode(res, "switch to frame " + frameName);
                //TODO(andre.nogueira): If this fails, driver cannot be used and has to be
                //set to a valid frame... What's the best way of doing this?
                return driver;
            }

            [DllImport("InternetExplorerDriver", CharSet = CharSet.Unicode)]
            private static extern int wdSwitchToWindow(SafeInternetExplorerDriverHandle handle, string windowName);
            public IWebDriver Window(string windowName)
            {
                int result = wdSwitchToWindow(handle, windowName);
                ErrorHandler.VerifyErrorCode(result, "Could not switch to window " + windowName);
                return driver;
            }

            public IWebDriver DefaultContent()
            {
                return Frame("");
            }

            public IWebElement ActiveElement()
            {
                throw new NotImplementedException("The method or operation is not implemented.");
            }

        }

        private class InternetExplorerNavigation : INavigation
        {

            SafeInternetExplorerDriverHandle handle;
            InternetExplorerDriver driver;

            public InternetExplorerNavigation(SafeInternetExplorerDriverHandle handle,
                InternetExplorerDriver driver)
            {
                this.handle = handle;
                this.driver = driver;
            }

            [DllImport("InternetExplorerDriver")]
            private static extern int wdGoBack(SafeInternetExplorerDriverHandle driver);
            public void Back()
            {
                int result = wdGoBack(handle);
                ErrorHandler.VerifyErrorCode(result, "Going back in history");
            }

            [DllImport("InternetExplorerDriver")]
            private static extern int wdGoForward(SafeInternetExplorerDriverHandle driver);
            public void Forward()
            {
                int result = wdGoForward(handle);
                ErrorHandler.VerifyErrorCode(result, "Going forward in history");
            }

            public void To(Uri url)
            {
                if (url == null)
                {
                    throw new ArgumentNullException("Argument 'url' cannot be null.");
                }
                String address = url.AbsoluteUri;
                driver.Url = address;
            }

            public void To(string url)
            {
                driver.Url = url;

            }

            public void Refresh()
            {
                throw new Exception("The method or operation is not implemented.");
            }
        }
    }
}
