using System;
using System.Collections.Generic;
using System.Text;
using OpenQA.Selenium.Internal;
using OpenQA.Selenium.Firefox.Internal;
using System.Collections.ObjectModel;
using System.Text.RegularExpressions;
using System.Globalization;
using Newtonsoft.Json;

namespace OpenQA.Selenium.Firefox
{
    public class FirefoxDriver : IWebDriver, ISearchContext, IFindsById, IFindsByClassName, IFindsByLinkText, IFindsByName, IFindsByTagName, IFindsByXPath, IFindsByPartialLinkText, IJavaScriptExecutor
    {
        public static readonly int DefaultPort = 7055;
        public static readonly bool DefaultEnableNativeEvents = Platform.CurrentPlatform.IsPlatformType(PlatformType.Windows);
        // Accept untrusted SSL certificates.
        public static readonly bool AcceptUntrustedCertificates = true;
        private ExtensionConnection extension;
        internal Context context;

        public FirefoxDriver() :
            this(new FirefoxBinary(), null)
        {
        }

        public FirefoxDriver(FirefoxProfile profile) :
            this(new FirefoxBinary(), profile)
        {
        }

        public FirefoxDriver(FirefoxBinary binary, FirefoxProfile profile)
        {
            FirefoxProfile profileToUse = profile;
            //string suggestedProfile = System.getProperty("webdriver.firefox.profile");
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

        internal static ExtensionConnection ConnectTo(FirefoxBinary binary, FirefoxProfile profile, string host)
        {
            return ExtensionConnectionFactory.ConnectTo(binary, profile, host);
        }

        protected void PrepareEnvironment()
        {
            // Does nothing, but provides a hook for subclasses to do "stuff"
        }

        internal Context Context
        {
            get { return context; }
        }

        #region IWebDriver Members

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

        public string Title
        {
            get { return SendMessage(typeof(WebDriverException), "title"); }
        }

        public string PageSource
        {
            get { return SendMessage(typeof(WebDriverException), "getPageSource"); }
        }

        public IWebElement FindElement(By mechanism)
        {
            return mechanism.FindElement(this);
        }

        public ReadOnlyCollection<IWebElement> FindElements(By mechanism)
        {
            return mechanism.FindElements(this);
        }

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

        public void Quit()
        {
            extension.Quit();
            Dispose();
        }

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

        public string GetWindowHandle()
        {
            return SendMessage(typeof(WebDriverException), "getCurrentWindowHandle");
        }

        public IOptions Manage()
        {
            return new FirefoxOptions(this);
        }

        public INavigation Navigate()
        {
            return new FirefoxNavigation(this);
        }

        public ITargetLocator SwitchTo()
        {
            return new FirefoxTargetLocator(this);
        }

        #endregion

        #region IFindsById Members

        public IWebElement FindElementById(string id)
        {
            return FindElement("id", id);
        }

        public ReadOnlyCollection<IWebElement> FindElementsById(string id)
        {
            return FindElements("id", id);
        }

        #endregion

        #region IFindsByName Members

        public IWebElement FindElementByName(string name)
        {
            return FindElement("name", name);
        }

        public ReadOnlyCollection<IWebElement> FindElementsByName(string name)
        {
            return FindElements("name", name);
        }

        #endregion

        #region IFindsByTagName Members

        public IWebElement FindElementByTagName(string tagName)
        {
            return FindElement("tag name", tagName);
        }

        public ReadOnlyCollection<IWebElement> FindElementsByTagName(string tagName)
        {
            return FindElements("tag name", tagName);
        }

        #endregion

        #region IFindsByLinkText Members

        public IWebElement FindElementByLinkText(string linkText)
        {
            return FindElement("link text", linkText);
        }

        public ReadOnlyCollection<IWebElement> FindElementsByLinkText(string linkText)
        {
            return FindElements("link text", linkText);
        }

        #endregion

        #region IFindsByPartialLinkText Members

        public IWebElement FindElementByPartialLinkText(string partialLinkText)
        {
            return FindElement("partial link text", partialLinkText);
        }

        public ReadOnlyCollection<IWebElement> FindElementsByPartialLinkText(string partialLinkText)
        {
            return FindElements("partial link text", partialLinkText);
        }

        #endregion

        #region IFindsByClassName Members

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

        public IWebElement FindElementByXPath(string xpath)
        {
            return FindElement("xpath", xpath);
        }

        public ReadOnlyCollection<IWebElement> FindElementsByXPath(string xpath)
        {
            return FindElements("xpath", xpath);
        }

        #endregion

        #region IJavaScriptExecutor Members

        public object ExecuteScript(string script, params object[] args)
        {
            // Escape the quote marks
            script = script.Replace("\"", "\\\"");

            object[] convertedArgs = ConvertToJsObjects(args);

            object commandResponse = ExecuteCommand(typeof(InvalidOperationException), "executeScript", new object[] { script, convertedArgs });
            return ParseJavaScriptReturnValue(commandResponse);
        }
        #endregion

        #region IDisposable Members

        public void Dispose()
        {
            Dispose(true);
            GC.SuppressFinalize(this);
        }

        protected virtual void Dispose(bool disposing)
        {
            if (disposing)
            {
                extension.Dispose();
            }
        }

        #endregion

        #region Support methods
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
                throw new WebDriverException("", e);
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

        internal string SendMessage(Type throwOnFailure, Command commandToExecute)
        {
            return ExecuteCommand(throwOnFailure, commandToExecute).ToString();
        }

        protected object ExecuteCommand(Type throwOnFailure, string methodName, object[] parameters)
        {
            return ExecuteCommand(throwOnFailure, new Command(context, methodName, parameters));
        }

        internal object ExecuteCommand(Type throwOnFailure, Command commandToExecute)
        {
            //if (currentAlert != null) {
            //  if (!alertWhiteListedCommands.contains(command.getCommandName())) {
            //    ((FirefoxTargetLocator) switchTo()).alert().dismiss();
            //    throw new UnhandledAlertException(command.getCommandName());
            //  }
            //}

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
                rawResponse = (rawResponseAsString.Replace("\r\n", "\n").Replace("\n", System.Environment.NewLine));
            }
            return rawResponse;
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
        #endregion

        private class FirefoxNavigation : INavigation
        {
            private FirefoxDriver driver;

            public FirefoxNavigation(FirefoxDriver parentDriver)
            {
                driver = parentDriver;
            }
    
            #region INavigation Members

            public void Back()
            {
                driver.SendMessage(typeof(WebDriverException), "goBack");
            }

            public void Forward()
            {
                driver.SendMessage(typeof(WebDriverException), "goForward");
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
                driver.SendMessage(typeof(WebDriverException), "refresh");
            }

            #endregion
        }

        private class FirefoxOptions : IOptions
        {
            private const int SlowSpeed = 1;
            private const int MediumSpeed = 10;
            private const int FastSpeed = 100;
            private const string Rfc1123DateFormat = "DDD, dd MMM yyyy HH:mm:ss GMT";
            
            private FirefoxDriver driver;

            public FirefoxOptions(FirefoxDriver driver)
            {
                this.driver = driver;
            }

            #region IOptions Members

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
                    switch(value.Description) {
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

            public void AddCookie(Cookie cookie)
            {
                // The extension expects a cookie as a JSON object, but as a string value
                // which will be reparsed on the extension side.
                string cookieRepresentation = JsonConvert.SerializeObject(cookie, new JsonConverter[] { new CookieJsonConverter() });
                driver.SendMessage(typeof(WebDriverException), "addCookie",  new object[] { cookieRepresentation });
            }

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
                                //firefox stores expiry as number of seconds
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

            public void DeleteCookie(Cookie cookie)
            {
                string cookieRepresentation = JsonConvert.SerializeObject(cookie, new JsonConverter[] { new CookieJsonConverter() });
                driver.SendMessage(typeof(WebDriverException), "deleteCookie", new object[] { cookieRepresentation });
            }

            public void DeleteCookieNamed(string name)
            {
                Cookie toDelete = new Cookie(name, "");
                DeleteCookie(toDelete);
            }

            public void DeleteAllCookies()
            {
                driver.SendMessage(typeof(WebDriverException), "deleteAllCookies");
            }

            #endregion
        }

        private class FirefoxTargetLocator : ITargetLocator
        {
            FirefoxDriver driver;

            public FirefoxTargetLocator(FirefoxDriver driver)
            {
                this.driver = driver;
            }

            #region ITargetLocator Members

            public IWebDriver Frame(int frameIndex)
            {
                driver.SendMessage(typeof(NoSuchFrameException), "switchToFrame", new object[] { frameIndex });
                return driver;
            }

            public IWebDriver Frame(string frameName)
            {
                if (frameName == null)
                {
                    throw new ArgumentNullException("frameName", "Frame name must not be null");
                }
                driver.SendMessage(typeof(NoSuchFrameException), "switchToFrame", new object[] { frameName });
                return driver;
            }

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

            public IWebDriver DefaultContent()
            {
                driver.SendMessage(typeof(WebDriverException), "switchToDefaultContent");
                return driver;
            }

            public IWebElement ActiveElement()
            {
                string response = driver.SendMessage(typeof(NoSuchElementException), "switchToActiveElement");
                return new FirefoxWebElement(driver, response);
            }

            #endregion
        }
    }
}
