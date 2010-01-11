using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.Diagnostics;
using System.Globalization;
using System.Text;
using Newtonsoft.Json;
using OpenQA.Selenium.Internal;

namespace OpenQA.Selenium.Remote
{
    public class RemoteWebDriver : IWebDriver, ISearchContext, IJavaScriptExecutor, IFindsById, IFindsByClassName, IFindsByLinkText, IFindsByName, IFindsByTagName, IFindsByXPath, IFindsByPartialLinkText
    {
        private ICommandExecutor executor;
        private ICapabilities capabilities;
        private SessionId sessionId;

        public RemoteWebDriver(ICommandExecutor commandExecutor, ICapabilities desiredCapabilities)
        {
            executor = commandExecutor;
            StartClient();
            StartSession(desiredCapabilities);
        }

        public RemoteWebDriver(ICapabilities desiredCapabilities)
            : this((Uri)null, desiredCapabilities)
        {
        }

        public RemoteWebDriver(Uri remoteAddress, ICapabilities desiredCapabilities)
            : this(new HttpCommandExecutor(remoteAddress), desiredCapabilities)
        {
        }

        #region IWebDriver Members

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

        public string Title
        {
            get
            {
                Response commandResponse = Execute(DriverCommand.GetTitle, null);
                object returnedTitle = commandResponse.Value.ToString();
                return returnedTitle.ToString();
            }
        }

        public IWebElement FindElement(By mechanism)
        {
            return mechanism.FindElement(this);
        }

        public ReadOnlyCollection<IWebElement> FindElements(By mechanism)
        {
            return mechanism.FindElements(this);
        }

        public string PageSource
        {
            get
            {
                Response commandResponse = Execute(DriverCommand.GetPageSource, null);
                return commandResponse.Value.ToString();
            }
        }

        public void Close()
        {
            Execute(DriverCommand.Close, null);
        }

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

        public IOptions Manage()
        {
            return new RemoteWebDriverOptions(this);
        }

        public INavigation Navigate()
        {
            return new RemoteNavigation(this);
        }

        public ITargetLocator SwitchTo()
        {
            return new RemoteTargetLocator(this);
        }

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

        public string GetWindowHandle()
        {
            Response commandResponse = Execute(DriverCommand.GetCurrentWindowHandle, null);
            return commandResponse.Value.ToString();
        }

        #region IJavaScriptExecutor Members

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
                command = new Command(sessionId, new Context("foo"), DriverCommand.ExecuteScript, new object[] { script, new object[] {} });
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

        #endregion

        #region IFindsById Members

        public IWebElement FindElementById(string id)
        {
            Response commandResponse = Execute(DriverCommand.FindElement, new object[] { "id", id });
            return GetElementFromResponse(commandResponse);
        }

        public ReadOnlyCollection<IWebElement> FindElementsById(string id)
        {
            Response commandResponse = Execute(DriverCommand.FindElements, new object[] { "id", id });
            return GetElementsFromResponse(commandResponse);
        }

        #endregion

        #region IFindsByClassName Members

        public IWebElement FindElementByClassName(string className)
        {
            Response commandResponse = Execute(DriverCommand.FindElement, new object[] { "class name", className });
            return GetElementFromResponse(commandResponse);
        }

        public ReadOnlyCollection<IWebElement> FindElementsByClassName(string className)
        {
            Response commandResponse = Execute(DriverCommand.FindElements, new object[] { "class name", className });
            return GetElementsFromResponse(commandResponse);
        }

        #endregion

        #region IFindsByLinkText Members

        public IWebElement FindElementByLinkText(string linkText)
        {
            Response commandResponse = Execute(DriverCommand.FindElement, new object[] { "link text", linkText });
            return GetElementFromResponse(commandResponse);
        }

        public ReadOnlyCollection<IWebElement> FindElementsByLinkText(string linkText)
        {
            Response commandResponse = Execute(DriverCommand.FindElements, new object[] { "link text", linkText });
            return GetElementsFromResponse(commandResponse);
        }

        #endregion

        #region IFindsByPartialLinkText Members

        public IWebElement FindElementByPartialLinkText(string partialLinkText)
        {
            Response commandResponse = Execute(DriverCommand.FindElement, new object[] { "partial link text", partialLinkText });
            return GetElementFromResponse(commandResponse);
        }

        public ReadOnlyCollection<IWebElement> FindElementsByPartialLinkText(string partialLinkText)
        {
            Response commandResponse = Execute(DriverCommand.FindElements, new object[] { "partial link text", partialLinkText });
            return GetElementsFromResponse(commandResponse);
        }

        #endregion

        #region IFindsByName Members

        public IWebElement FindElementByName(string name)
        {
            Response commandResponse = Execute(DriverCommand.FindElement, new object[] { "name", name });
            return GetElementFromResponse(commandResponse);
        }

        public ReadOnlyCollection<IWebElement> FindElementsByName(string name)
        {
            Response commandResponse = Execute(DriverCommand.FindElements, new object[] { "name", name });
            return GetElementsFromResponse(commandResponse);
        }

        #endregion

        #region IFindsByTagName Members

        public IWebElement FindElementByTagName(string tagName)
        {
            Response commandResponse = Execute(DriverCommand.FindElement, new object[] { "tag name", tagName });
            return GetElementFromResponse(commandResponse);
        }

        public ReadOnlyCollection<IWebElement> FindElementsByTagName(string tagName)
        {
            Response commandResponse = Execute(DriverCommand.FindElements, new object[] { "tag name", tagName });
            return GetElementsFromResponse(commandResponse);
        }

        #endregion

        #region IFindsByXPath Members

        public IWebElement FindElementByXPath(string xpath)
        {
            Response commandResponse = Execute(DriverCommand.FindElement, new object[] { "xpath", xpath });
            return GetElementFromResponse(commandResponse);
        }

        public ReadOnlyCollection<IWebElement> FindElementsByXPath(string xpath)
        {
            Response commandResponse = Execute(DriverCommand.FindElements, new object[] { "xpath", xpath });
            return GetElementsFromResponse(commandResponse);
        }

        #endregion

        #endregion

        #region IDisposable Members

        public void Dispose()
        {
            Dispose(true);
            GC.SuppressFinalize(this);
        }

        protected virtual void Dispose(bool disposing)
        {
            sessionId = null;
            StopClient();
        }

        #endregion

        public ICapabilities Capabilities
        {
            get { return capabilities; }
        }

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

        private static void UnpackAndThrowOnError(object error)
        {
            // The exception object is wrapped so it appears as a JSON string. Parse
            // the JSON string into an object first, then we can assemble the correct
            // exception.
            string errorString = error.ToString();
            ErrorResponse errorResponseObject =  null;
            if (errorString.StartsWith("{", StringComparison.OrdinalIgnoreCase))
            {
                errorResponseObject = JsonConvert.DeserializeObject<ErrorResponse>(errorString);
            }
            else
            {
                errorResponseObject = new ErrorResponse();
                errorResponseObject.Message = errorString;
                errorResponseObject.ClassName = ".";
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

        private void AmendElementValueIfNecessary(Response commandResponse)
        {
            if (!(commandResponse.Value is RemoteWebElement))
                return;

            // Ensure that the parent is set properly
            RemoteWebElement existingElement = (RemoteWebElement)commandResponse.Value;
            existingElement.Parent = this;

            if (!Capabilities.IsJavaScriptEnabled)
                return;

            if (!(commandResponse.Value is RenderedRemoteWebElement))
                return;  // Good, nothing to do

            RenderedRemoteWebElement replacement = new RenderedRemoteWebElement();
            replacement.Id = existingElement.Id;
            replacement.Parent = this;

            commandResponse.Value = replacement;
        }

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

        protected virtual void StartClient()
        {
        }

        protected virtual void StopClient()
        {
        }

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
                element.Id = (parts[parts.Length - 1]);
                toReturn.Add(element);
            }

            return new ReadOnlyCollection<IWebElement>(toReturn);
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

        private class RemoteWebDriverOptions : IOptions
        {
            private RemoteWebDriver driver;

            public RemoteWebDriverOptions(RemoteWebDriver driver)
            {
                this.driver = driver;
            }

            public void AddCookie(Cookie cookie)
            {
                driver.Execute(DriverCommand.AddCookie, new object[] { cookie });
            }

            public void DeleteCookieNamed(string name)
            {
                Dictionary<string, object> parameters = new Dictionary<string, object>();
                parameters.Add("name", name);
                driver.Execute(DriverCommand.DeleteCookie, new object[] { parameters });
            }

            public void DeleteCookie(Cookie cookie)
            {
                DeleteCookieNamed(cookie.Name);
            }

            public void DeleteAllCookies()
            {
                driver.Execute(DriverCommand.DeleteAllCookies, null);
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
        }

        private class RemoteNavigation : INavigation
        {
            private RemoteWebDriver driver;
            public RemoteNavigation(RemoteWebDriver driver)
            {
                this.driver = driver;
            }

            public void Back()
            {
                driver.Execute(DriverCommand.GoBack, null);
            }

            public void Forward()
            {
                driver.Execute(DriverCommand.GoForward, null);
            }

            public void GoToUrl(string url)
            {
                driver.Url = url;
            }

            public void GoToUrl(Uri url)
            {
                if (url == null)
                {
                    throw new ArgumentNullException("url", "URL cannot be null.");
                }
                driver.Url = url.ToString();
            }

            public void Refresh()
            {
                driver.Execute(DriverCommand.Refresh, null);
            }
        }

        private class RemoteTargetLocator : ITargetLocator
        {
            RemoteWebDriver driver;

            public RemoteTargetLocator(RemoteWebDriver driver)
            {
                this.driver = driver;
            }

            public IWebDriver Frame(int frameIndex)
            {
                Dictionary<string, object> parameters = new Dictionary<string, object>();
                parameters.Add("id", frameIndex);
                driver.Execute(DriverCommand.SwitchToFrame, new object[] { parameters });
                return driver;
            }

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

            public IWebDriver Window(string windowName)
            {
                Dictionary<string, object> parameters = new Dictionary<string, object>();
                parameters.Add("name", windowName);
                driver.Execute(DriverCommand.SwitchToWindow, new object[] { parameters });
                return driver;
            }

            public IWebDriver DefaultContent()
            {
                Dictionary<string, object> parameters = new Dictionary<string, object>();
                parameters.Add("id", null);
                driver.Execute(DriverCommand.SwitchToFrame, new object[] { parameters });
                return driver;
            }

            public IWebElement ActiveElement()
            {
                Response response = driver.Execute(DriverCommand.GetActiveElement, null);
                return driver.GetElementFromResponse(response);
            }
        }
    }
}
