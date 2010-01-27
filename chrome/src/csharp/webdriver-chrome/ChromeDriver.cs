using System.IO;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using OpenQA.Selenium;
using OpenQA.Selenium.Remote;
using System;
using OpenQA.Selenium.Internal;
using System.Threading;
using System.Globalization;

namespace OpenQA.Selenium.Chrome
{
    public class ChromeDriver : IWebDriver, ISearchContext, IJavaScriptExecutor,
      IFindsById, IFindsByClassName, IFindsByLinkText, IFindsByPartialLinkText, IFindsByName, IFindsByTagName,
      IFindsByXPath, IFindsByCssSelector
    {

        private static int MAX_START_RETRIES = 5;
        private ChromeCommandExecutor executor;
        private ChromeBinary chromeBinary;

        /**
         * Starts up a new instance of Chrome using the specified profile and
         * extension.
         *
         * @param profile The profile to use.
         * @param extension The extension to use.
         */
        internal ChromeDriver(ChromeProfile profile, ChromeExtension extension)
        {
            chromeBinary = new ChromeBinary(profile, extension);
            executor = new ChromeCommandExecutor();
            StartClient();
        }

        /**
         * Starts up a new instance of Chrome, with the required extension loaded,
         * and has it connect to a new ChromeCommandExecutor on its port
         *
         * @see ChromeDriver(ChromeProfile, ChromeExtension)
         */
        public ChromeDriver()
            : this(new ChromeProfile(), new ChromeExtension())
        {
        }

        /**
         * By default will try to load Chrome from system property
         * webdriver.chrome.bin and the extension from
         * webdriver.chrome.extensiondir.  If the former fails, will try to guess the
         * path to Chrome.  If the latter fails, will try to unzip from the JAR we 
         * hope we're in.  If these fail, throws exceptions.
         */
        protected void StartClient()
        {
            for (int retries = MAX_START_RETRIES; !executor.HasClient && retries > 0; retries--)
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
                //In case this attempt fails, we increment how long we wait before sending a command
                chromeBinary.IncrementBackoffBy(2);
            }
            //The last one attempt succeeded, so we reduce back to that time
            chromeBinary.IncrementBackoffBy(-1);

            if (!executor.HasClient)
            {
                StopClient();
                throw new FatalChromeException("Cannot create chrome driver");
            }
        }

        /**
         * Kills the started Chrome process and ChromeCommandExecutor if they exist
         */
        protected void StopClient()
        {
            chromeBinary.Kill();
            executor.StopListening();
        }

        /**
         * Executes a passed command using the current ChromeCommandExecutor
         * @param driverCommand command to execute
         * @param parameters parameters of command being executed
         * @return response to the command (a Response wrapping a null value if none) 
         */
        public ChromeResponse Execute(DriverCommand driverCommand, params Object[] parameters)
        {
            ChromeCommand command = new ChromeCommand(new SessionId("[No sessionId]"),
                                          new Context("[No context]"),
                                          driverCommand,
                                          parameters);
            ChromeResponse commandResponse = null;
            try
            {
                commandResponse = executor.Execute(command);
            }
            catch (ArgumentException)
            {
                //These exceptions may leave the extension hung, or in an
                //inconsistent state, so we restart Chrome
                StopClient();
                StartClient();
            }
            catch (FatalChromeException)
            {
                StopClient();
                StartClient();
            }
            return commandResponse;
        }


        protected String GetServerUrl()
        {
            return "http://localhost:" + executor.Port + "/chromeCommandExecutor";
        }

        public void Close()
        {
            Execute(DriverCommand.Close);
        }

        public IWebElement FindElement(By by)
        {
            return by.FindElement(this);
        }

        public ReadOnlyCollection<IWebElement> FindElements(By by)
        {
            return by.FindElements(this);
        }

        public String Url
        {
            get { return Execute(DriverCommand.GetCurrentUrl).Value.ToString(); }
            set { Execute(DriverCommand.Get, value); }
        }

        public String PageSource
        {
            get { return Execute(DriverCommand.GetPageSource).Value.ToString(); }
        }

        public String Title
        {
            get { return Execute(DriverCommand.GetTitle).Value.ToString(); }
        }

        public String GetWindowHandle()
        {
            return Execute(DriverCommand.GetCurrentWindowHandle).Value.ToString();
        }

        //TODO(AndreNogueira):Uncomment and finish
        public ReadOnlyCollection<String> GetWindowHandles()
        {
            return null;
            //List<string> windowHandles = (List<string>)Execute(DriverCommand.GetWindowHandles).Value;
            //set<String> setOfHandles = new HashSet<String>();
            //for (Object windowHandle : windowHandles) {
            //  setOfHandles.add((String)windowHandle);
            //}
            //return setOfHandles;
        }

        public IOptions Manage()
        {
            return new ChromeOptions(this);
        }

        public INavigation Navigate()
        {
            return new ChromeNavigation(this);
        }

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

        public ITargetLocator SwitchTo()
        {
            return new ChromeTargetLocator(this);
        }

        public object ExecuteScript(String script, params object[] args)
        {
            object[] convertedArgs = ConvertArgumentsToJavaScriptObjects(args);
            ChromeResponse response = Execute(DriverCommand.ExecuteScript, script, convertedArgs);
            object result = ParseJavaScriptReturnValue(response.Value);
            return result;
        }

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

        public bool IsJavascriptEnabled()
        {
            return true;
        }

        public IWebElement FindElementById(String id)
        {
            return GetElementFrom(Execute(DriverCommand.FindElement, "id", id));
        }

        public ReadOnlyCollection<IWebElement> FindElementsById(String id)
        {
            return GetElementsFrom(Execute(DriverCommand.FindElements, "id", id));
        }

        public IWebElement FindElementByClassName(String className)
        {
            return GetElementFrom(Execute(DriverCommand.FindElement, "class name", className));
        }

        public ReadOnlyCollection<IWebElement> FindElementsByClassName(String className)
        {
            return GetElementsFrom(Execute(DriverCommand.FindElements, "class name", className));
        }

        public IWebElement FindElementByLinkText(String linkText)
        {
            return GetElementFrom(Execute(DriverCommand.FindElement, "link text", linkText));
        }

        public ReadOnlyCollection<IWebElement> FindElementsByLinkText(String linkText)
        {
            return GetElementsFrom(Execute(DriverCommand.FindElements, "link text", linkText));
        }

        public IWebElement FindElementByName(String name)
        {
            return GetElementFrom(Execute(DriverCommand.FindElement, "name", name));
        }

        public ReadOnlyCollection<IWebElement> FindElementsByName(String name)
        {
            return GetElementsFrom(Execute(DriverCommand.FindElements, "name", name));
        }

        public IWebElement FindElementByTagName(String tagName)
        {
            return GetElementFrom(Execute(DriverCommand.FindElement, "tag name", tagName));
        }

        public ReadOnlyCollection<IWebElement> FindElementsByTagName(String tagName)
        {
            return GetElementsFrom(Execute(DriverCommand.FindElements, "tag name", tagName));
        }

        public IWebElement FindElementByXPath(String xpath)
        {
            return GetElementFrom(Execute(DriverCommand.FindElement, "xpath", xpath));
        }

        public ReadOnlyCollection<IWebElement> FindElementsByXPath(String xpath)
        {
            return GetElementsFrom(Execute(DriverCommand.FindElements, "xpath", xpath));
        }

        public IWebElement FindElementByPartialLinkText(String partialLinkText)
        {
            return GetElementFrom(Execute(DriverCommand.FindElement, "partial link text", partialLinkText));
        }

        public ReadOnlyCollection<IWebElement> FindElementsByPartialLinkText(String partialLinkText)
        {
            return GetElementsFrom(Execute(DriverCommand.FindElements, "partial link text", partialLinkText));
        }

        public IWebElement FindElementByCssSelector(String cssSelector)
        {
            return GetElementFrom(Execute(DriverCommand.FindElement, "css", cssSelector));
        }

        public ReadOnlyCollection<IWebElement> FindElementsByCssSelector(String cssSelector)
        {
            return GetElementsFrom(Execute(DriverCommand.FindElements, "css", cssSelector));
        }

        public IWebElement GetElementFrom(ChromeResponse response)
        {
            object result = response.Value;
            object[] elements = (object[])result;
            return new ChromeWebElement(this, (string)elements[0]);
        }

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

        ReadOnlyCollection<IWebElement> FindChildElements(ChromeWebElement parent, String by, String search)
        {
            return GetElementsFrom(Execute(DriverCommand.FindChildElements, parent, by, search));
        }

        //TODO(AndreNogueira): implement
        //public <X> X getScreenshotAs(OutputType<X> target) {
        //  return target.convertFromBase64Png(Execute(DriverCommand.Screenshot).Value.ToString());
        //}

        class ChromeOptions : IOptions
        {

            private ChromeDriver instance;

            public ChromeOptions(ChromeDriver instance)
            {
                this.instance = instance;
            }

            public void AddCookie(Cookie cookie)
            {
                Execute(DriverCommand.AddCookie, cookie);
            }

            public void DeleteAllCookies()
            {
                Execute(DriverCommand.DeleteAllCookies);
            }

            public void DeleteCookie(Cookie cookie)
            {
                Execute(DriverCommand.DeleteCookie, cookie.Name);
            }

            public void DeleteCookieNamed(String name)
            {
                Execute(DriverCommand.DeleteCookie, name);
            }

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

            public Cookie GetCookieNamed(String name)
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

            public Speed Speed
            {
                get { throw new NotImplementedException("Not yet supported in Chrome"); }
                set { throw new NotImplementedException("Not yet supported in Chrome"); }
            }

            public ChromeResponse Execute(DriverCommand command, params object[] arg)
            {
                return instance.Execute(command, arg);
            }
        }

        class ChromeNavigation : INavigation
        {

            private ChromeDriver instance;

            public ChromeNavigation(ChromeDriver instance)
            {
                this.instance = instance;
            }

            public void Back()
            {
                Execute(DriverCommand.GoBack);
            }

            public void Forward()
            {
                Execute(DriverCommand.GoForward);
            }

            public void GoToUrl(String url)
            {
                instance.Url = url;
            }

            public void GoToUrl(Uri url)
            {
                instance.Url = url.AbsoluteUri;
            }

            public void Refresh()
            {
                Execute(DriverCommand.Refresh);
            }

            public ChromeResponse Execute(DriverCommand command, params object[] arg)
            {
                return instance.Execute(command, arg);
            }
        }

        class ChromeTargetLocator : ITargetLocator
        {

            private ChromeDriver instance;

            public ChromeTargetLocator(ChromeDriver instance)
            {
                this.instance = instance;
            }

            public IWebElement ActiveElement()
            {
                return instance.GetElementFrom(Execute(DriverCommand.GetActiveElement));
            }

            public IWebDriver DefaultContent()
            {
                Execute(DriverCommand.SwitchToDefaultContent);
                return instance;
            }

            public IWebDriver Frame(int frameIndex)
            {
                Execute(DriverCommand.SwitchToFrameByIndex, frameIndex);
                return instance;
            }

            public IWebDriver Frame(String frameName)
            {
                Execute(DriverCommand.SwitchToFrameByName, frameName);
                return instance;
            }

            public IWebDriver Window(String windowName)
            {
                Execute(DriverCommand.SwitchToWindow, windowName);
                return instance;
            }

            public ChromeResponse Execute(DriverCommand command, params object[] arg)
            {
                return instance.Execute(command, arg);
            }
        }

        #region IDisposable Members

        public void Dispose()
        {
            throw new NotImplementedException();
        }

        #endregion
    }
}
