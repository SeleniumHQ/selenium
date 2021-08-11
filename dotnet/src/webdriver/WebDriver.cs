// <copyright file="WebDriver.cs" company="WebDriver Committers">
// Licensed to the Software Freedom Conservancy (SFC) under one
// or more contributor license agreements. See the NOTICE file
// distributed with this work for additional information
// regarding copyright ownership. The SFC licenses this file
// to you under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
// </copyright>

using System;
using System.Collections;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.Globalization;
using OpenQA.Selenium.Html5;
using OpenQA.Selenium.Interactions;
using OpenQA.Selenium.Internal;

namespace OpenQA.Selenium
{
    public class WebDriver : IWebDriver, ISearchContext, IJavaScriptExecutor, IFindsElement, ITakesScreenshot, ISupportsPrint, IActionExecutor, IAllowsFileDetection, IHasCapabilities, IHasCommandExecutor, IHasSessionId
    {
        /// <summary>
        /// The default command timeout for HTTP requests in a RemoteWebDriver instance.
        /// </summary>
        protected static readonly TimeSpan DefaultCommandTimeout = TimeSpan.FromSeconds(60);

        private ICommandExecutor executor;
        private ICapabilities capabilities;
        private IFileDetector fileDetector = new DefaultFileDetector();
        private NetworkManager network;
        private WebElementFactory elementFactory;
        private SessionId sessionId;

        // These member variables exist to support obsolete protocol end points.
        // They should be removed at the earliest available opportunity.
        private IWebStorage storage;
        private IApplicationCache appCache;
        private ILocationContext locationContext;

        /// <summary>
        /// Initializes a new instance of the <see cref="WebDriver"/> class.
        /// </summary>
        /// <param name="executor">The <see cref="ICommandExecutor"/> object used to execute commands.</param>
        /// <param name="capabilities">The <see cref="ICapabilities"/> object used to configuer the driver session.</param>
        protected WebDriver(ICommandExecutor executor, ICapabilities capabilities)
        {
            this.executor = executor;
            this.StartSession(capabilities);
            this.elementFactory = new WebElementFactory(this);
            this.network = new NetworkManager(this);

            if ((this as ISupportsLogs) != null)
            {
                // Only add the legacy log commands if the driver supports
                // retrieving the logs via the extension end points.
                this.CommandExecutor.TryAddCommand(DriverCommand.GetAvailableLogTypes, new HttpCommandInfo(HttpCommandInfo.GetCommand, "/session/{sessionId}/se/log/types"));
                this.CommandExecutor.TryAddCommand(DriverCommand.GetLog, new HttpCommandInfo(HttpCommandInfo.PostCommand, "/session/{sessionId}/se/log"));
            }

            // These below code exists solely to support obsolete protocol end points.
            // They should be removed at the earliest available opportunity.
            if (this.Capabilities.HasCapability(CapabilityType.SupportsApplicationCache))
            {
                object appCacheCapability = this.Capabilities.GetCapability(CapabilityType.SupportsApplicationCache);
                if (appCacheCapability is bool && (bool)appCacheCapability)
                {
                    this.appCache = new ApplicationCache(this);
                }
            }

            if (this.Capabilities.HasCapability(CapabilityType.SupportsLocationContext))
            {
                object locationContextCapability = this.Capabilities.GetCapability(CapabilityType.SupportsLocationContext);
                if (locationContextCapability is bool && (bool)locationContextCapability)
                {
                    this.locationContext = new LocationContext(this);
                }
            }

            if (this.Capabilities.HasCapability(CapabilityType.SupportsWebStorage))
            {
                object webContextCapability = this.Capabilities.GetCapability(CapabilityType.SupportsWebStorage);
                if (webContextCapability is bool && (bool)webContextCapability)
                {
                    this.storage = new WebStorage(this);
                }

            }
        }

        /// <summary>
        /// Gets the <see cref="ICommandExecutor"/> which executes commands for this driver.
        /// </summary>
        public ICommandExecutor CommandExecutor
        {
            get { return this.executor; }
        }

        /// <summary>
        /// Gets the <see cref="ICapabilities"/> that the driver session was created with, which may be different from those requested.
        /// </summary>
        public ICapabilities Capabilities
        {
            get { return this.capabilities; }
        }

        /// <summary>
        /// Gets or sets the URL the browser is currently displaying.
        /// </summary>
        /// <seealso cref="IWebDriver.Url"/>
        /// <seealso cref="INavigation.GoToUrl(string)"/>
        /// <seealso cref="INavigation.GoToUrl(System.Uri)"/>
        public string Url
        {
            get
            {
                Response commandResponse = this.Execute(DriverCommand.GetCurrentUrl, null);
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
                this.Execute(DriverCommand.Get, parameters);
            }
        }

        /// <summary>
        /// Gets the title of the current browser window.
        /// </summary>
        public string Title
        {
            get
            {
                Response commandResponse = this.Execute(DriverCommand.GetTitle, null);
                object returnedTitle = commandResponse != null ? commandResponse.Value : string.Empty;
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
                string pageSource = string.Empty;
                Response commandResponse = this.Execute(DriverCommand.GetPageSource, null);
                pageSource = commandResponse.Value.ToString();
                return pageSource;
            }
        }

        /// <summary>
        /// Gets the current window handle, which is an opaque handle to this
        /// window that uniquely identifies it within this driver instance.
        /// </summary>
        public string CurrentWindowHandle
        {
            get
            {
                Response commandResponse = this.Execute(DriverCommand.GetCurrentWindowHandle, null);
                return commandResponse.Value.ToString();
            }
        }

        /// <summary>
        /// Gets the window handles of open browser windows.
        /// </summary>
        public ReadOnlyCollection<string> WindowHandles
        {
            get
            {
                Response commandResponse = this.Execute(DriverCommand.GetWindowHandles, null);
                object[] handles = (object[])commandResponse.Value;
                List<string> handleList = new List<string>();
                foreach (object handle in handles)
                {
                    handleList.Add(handle.ToString());
                }

                return handleList.AsReadOnly();
            }
        }

        /// <summary>
        /// Gets a value indicating whether this object is a valid action executor.
        /// </summary>
        public bool IsActionExecutor
        {
            get { return true; }
        }

        /// <summary>
        /// Gets the <see cref="SessionId"/> for the current session of this driver.
        /// </summary>
        public SessionId SessionId
        {
            get { return this.sessionId; }
        }

        /// <summary>
        /// Gets or sets the <see cref="IFileDetector"/> responsible for detecting
        /// sequences of keystrokes representing file paths and names.
        /// </summary>
        public virtual IFileDetector FileDetector
        {
            get
            {
                return this.fileDetector;
            }

            set
            {
                if (value == null)
                {
                    throw new ArgumentNullException("value", "FileDetector cannot be null");
                }

                this.fileDetector = value;
            }
        }

        /// <summary>
        /// Gets a value indicating whether web storage is supported for this driver.
        /// </summary>
        [Obsolete("Use JavaScript instead for managing localStorage and sessionStorage. This property will be removed in a future release.")]
        public bool HasWebStorage
        {
            get { return this.storage != null; }
        }

        /// <summary>
        /// Gets an <see cref="IWebStorage"/> object for managing web storage.
        /// </summary>
        [Obsolete("Use JavaScript instead for managing localStorage and sessionStorage. This property will be removed in a future release.")]
        public IWebStorage WebStorage
        {
            get
            {
                if (this.storage == null)
                {
                    throw new InvalidOperationException("Driver does not support manipulating HTML5 web storage. Use the HasWebStorage property to test for the driver capability");
                }

                return this.storage;
            }
        }

        /// <summary>
        /// Gets a value indicating whether manipulating the application cache is supported for this driver.
        /// </summary>
        [Obsolete("Use JavaScript instead for managing applicationCache. This property will be removed in a future release.")]
        public bool HasApplicationCache
        {
            get { return this.appCache != null; }
        }

        /// <summary>
        /// Gets an <see cref="IApplicationCache"/> object for managing application cache.
        /// </summary>
        [Obsolete("Use JavaScript instead for managing applicationCache. This property will be removed in a future release.")]
        public IApplicationCache ApplicationCache
        {
            get
            {
                if (this.appCache == null)
                {
                    throw new InvalidOperationException("Driver does not support manipulating the HTML5 application cache. Use the HasApplicationCache property to test for the driver capability");
                }

                return this.appCache;
            }
        }

        /// <summary>
        /// Gets a value indicating whether manipulating geolocation is supported for this driver.
        /// </summary>
        [Obsolete("Getting and setting geolocation information is not supported by the W3C WebDriver Specification. This property will be removed in a future release.")]
        public bool HasLocationContext
        {
            get { return this.locationContext != null; }
        }

        /// <summary>
        /// Gets an <see cref="ILocationContext"/> object for managing browser location.
        /// </summary>
        [Obsolete("Getting and setting geolocation information is not supported by the W3C WebDriver Specification. This property will be removed in a future release.")]
        public ILocationContext LocationContext
        {
            get
            {
                if (this.locationContext == null)
                {
                    throw new InvalidOperationException("Driver does not support setting HTML5 geolocation information. Use the HasLocationContext property to test for the driver capability");
                }

                return this.locationContext;
            }
        }

        internal INetwork Network
        {
            get { return this.network; }
        }

        /// <summary>
        /// Closes the Browser
        /// </summary>
        public void Close()
        {
            this.Execute(DriverCommand.Close, null);
        }

        /// <summary>
        /// Dispose the WebDriver Instance
        /// </summary>
        public void Dispose()
        {
            this.Dispose(true);
            GC.SuppressFinalize(this);
        }

        /// <summary>
        /// Executes JavaScript "asynchronously" in the context of the currently selected frame or window,
        /// executing the callback function specified as the last argument in the list of arguments.
        /// </summary>
        /// <param name="script">The JavaScript code to execute.</param>
        /// <param name="args">The arguments to the script.</param>
        /// <returns>The value returned by the script.</returns>
        public object ExecuteAsyncScript(string script, params object[] args)
        {
            return this.ExecuteScriptCommand(script, DriverCommand.ExecuteAsyncScript, args);
        }

        /// <summary>
        /// Executes JavaScript in the context of the currently selected frame or window
        /// </summary>
        /// <param name="script">The JavaScript code to execute.</param>
        /// <param name="args">The arguments to the script.</param>
        /// <returns>The value returned by the script.</returns>
        public object ExecuteScript(string script, params object[] args)
        {
            return this.ExecuteScriptCommand(script, DriverCommand.ExecuteScript, args);
        }

        /// <summary>
        /// Executes JavaScript in the context of the currently selected frame or window
        /// </summary>
        /// <param name="script">A <see cref="PinnedScript"/> object containing the JavaScript code to execute.</param>
        /// <param name="args">The arguments to the script.</param>
        /// <returns>The value returned by the script.</returns>
        public object ExecuteScript(PinnedScript script, params object[] args)
        {
            return this.ExecuteScript(script.ExecutionScript, args);
        }

        /// <summary>
        /// Finds the first element in the page that matches the <see cref="By"/> object
        /// </summary>
        /// <param name="by">By mechanism to find the object</param>
        /// <returns>IWebElement object so that you can interact with that object</returns>
        /// <example>
        /// <code>
        /// IWebDriver driver = new InternetExplorerDriver();
        /// IWebElement elem = driver.FindElement(By.Name("q"));
        /// </code>
        /// </example>
        public IWebElement FindElement(By by)
        {
            if (by == null)
            {
                throw new ArgumentNullException("by", "by cannot be null");
            }

            return by.FindElement(this);
        }

        /// <summary>
        /// Finds an element matching the given mechanism and value.
        /// </summary>
        /// <param name="mechanism">The mechanism by which to find the element.</param>
        /// <param name="value">The value to use to search for the element.</param>
        /// <returns>The first <see cref="IWebElement"/> matching the given criteria.</returns>
        public virtual IWebElement FindElement(string mechanism, string value)
        {
            Dictionary<string, object> parameters = new Dictionary<string, object>();
            parameters.Add("using", mechanism);
            parameters.Add("value", value);
            Response commandResponse = this.Execute(DriverCommand.FindElement, parameters);
            return this.GetElementFromResponse(commandResponse);
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
            if (by == null)
            {
                throw new ArgumentNullException("by", "by cannot be null");
            }

            return by.FindElements(this);
        }

        /// <summary>
        /// Finds all elements matching the given mechanism and value.
        /// </summary>
        /// <param name="mechanism">The mechanism by which to find the elements.</param>
        /// <param name="value">The value to use to search for the elements.</param>
        /// <returns>A collection of all of the <see cref="IWebElement">IWebElements</see> matching the given criteria.</returns>
        public virtual ReadOnlyCollection<IWebElement> FindElements(string mechanism, string value)
        {
            Dictionary<string, object> parameters = new Dictionary<string, object>();
            parameters.Add("using", mechanism);
            parameters.Add("value", value);
            Response commandResponse = this.Execute(DriverCommand.FindElements, parameters);
            return this.GetElementsFromResponse(commandResponse);
        }

        /// <summary>
        /// Gets a <see cref="Screenshot"/> object representing the image of the page on the screen.
        /// </summary>
        /// <returns>A <see cref="Screenshot"/> object containing the image.</returns>
        public Screenshot GetScreenshot()
        {
            Response screenshotResponse = this.Execute(DriverCommand.Screenshot, null);
            string base64 = screenshotResponse.Value.ToString();
            return new Screenshot(base64);
        }

        /// <summary>
        /// Gets a <see cref="PrintDocument"/> object representing a PDF-formatted print representation of the page.
        /// </summary>
        /// <param name="printOptions">A <see cref="PrintOptions"/> object describing the options of the printed document.</param>
        /// <returns>The <see cref="PrintDocument"/> object containing the PDF-formatted print representation of the page.</returns>
        public PrintDocument Print(PrintOptions printOptions)
        {
            Response commandResponse = this.Execute(DriverCommand.Print, printOptions.ToDictionary());
            string base64 = commandResponse.Value.ToString();
            return new PrintDocument(base64);
        }

        /// <summary>
        /// Performs the specified list of actions with this action executor.
        /// </summary>
        /// <param name="actionSequenceList">The list of action sequences to perform.</param>
        public void PerformActions(IList<ActionSequence> actionSequenceList)
        {
            if (actionSequenceList == null)
            {
                throw new ArgumentNullException("actionSequenceList", "List of action sequences must not be null");
            }

            List<object> objectList = new List<object>();
            foreach (ActionSequence sequence in actionSequenceList)
            {
                objectList.Add(sequence.ToDictionary());
            }

            Dictionary<string, object> parameters = new Dictionary<string, object>();
            parameters["actions"] = objectList;
            this.Execute(DriverCommand.Actions, parameters);
        }

        /// <summary>
        /// Resets the input state of the action executor.
        /// </summary>
        public void ResetInputState()
        {
            this.Execute(DriverCommand.CancelActions, null);
        }

        /// <summary>
        /// Close the Browser and Dispose of WebDriver
        /// </summary>
        public void Quit()
        {
            this.Dispose();
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
            return new TargetLocator(this);
        }

        public IOptions Manage()
        {
            return new OptionsManager(this);
        }

        public INavigation Navigate()
        {
            return new Navigator(this);
        }

        /// <summary>
        /// Find the element in the response
        /// </summary>
        /// <param name="response">Response from the browser</param>
        /// <returns>Element from the page</returns>
        internal IWebElement GetElementFromResponse(Response response)
        {
            if (response == null)
            {
                throw new NoSuchElementException();
            }

            WebElement element = null;
            Dictionary<string, object> elementDictionary = response.Value as Dictionary<string, object>;
            if (elementDictionary != null)
            {
                element = this.elementFactory.CreateElement(elementDictionary);
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
            if (elements != null)
            {
                foreach (object elementObject in elements)
                {
                    Dictionary<string, object> elementDictionary = elementObject as Dictionary<string, object>;
                    if (elementDictionary != null)
                    {
                        WebElement element = this.elementFactory.CreateElement(elementDictionary);
                        toReturn.Add(element);
                    }
                }
            }

            return toReturn.AsReadOnly();
        }

        /// <summary>
        /// Executes commands with the driver
        /// </summary>
        /// <param name="driverCommandToExecute">Command that needs executing</param>
        /// <param name="parameters">Parameters needed for the command</param>
        /// <returns>WebDriver Response</returns>
        internal Response InternalExecute(string driverCommandToExecute, Dictionary<string, object> parameters)
        {
            return this.Execute(driverCommandToExecute, parameters);
        }

        /// <summary>
        /// Executes a command with this driver .
        /// </summary>
        /// <param name="driverCommandToExecute">A <see cref="DriverCommand"/> value representing the command to execute.</param>
        /// <param name="parameters">A <see cref="Dictionary{K, V}"/> containing the names and values of the parameters of the command.</param>
        /// <returns>A <see cref="Response"/> containing information about the success or failure of the command and any data returned by the command.</returns>
        protected virtual Response Execute(string driverCommandToExecute, Dictionary<string, object> parameters)
        {
            Command commandToExecute = new Command(this.sessionId, driverCommandToExecute, parameters);

            Response commandResponse;

            try
            {
                commandResponse = this.executor.Execute(commandToExecute);
            }
            catch (System.Net.WebException e)
            {
                commandResponse = new Response
                {
                    Status = WebDriverResult.UnhandledError,
                    Value = e
                };
            }

            if (commandResponse.Status != WebDriverResult.Success)
            {
                UnpackAndThrowOnError(commandResponse);
            }

            return commandResponse;
        }

        /// <summary>
        /// Starts a session with the driver
        /// </summary>
        /// <param name="desiredCapabilities">Capabilities of the browser</param>
        protected void StartSession(ICapabilities desiredCapabilities)
        {
            Dictionary<string, object> parameters = new Dictionary<string, object>();

            // If the object passed into the RemoteWebDriver constructor is a
            // RemoteSessionSettings object, it is expected that all intermediate
            // and end nodes are compliant with the W3C WebDriver Specification,
            // and therefore will already contain all of the appropriate values
            // for establishing a session.
            RemoteSessionSettings remoteSettings = desiredCapabilities as RemoteSessionSettings;
            if (remoteSettings == null)
            {
                Dictionary<string, object> matchCapabilities = this.GetCapabilitiesDictionary(desiredCapabilities);

                List<object> firstMatchCapabilitiesList = new List<object>();
                firstMatchCapabilitiesList.Add(matchCapabilities);

                Dictionary<string, object> specCompliantCapabilitiesDictionary = new Dictionary<string, object>();
                specCompliantCapabilitiesDictionary["firstMatch"] = firstMatchCapabilitiesList;

                parameters.Add("capabilities", specCompliantCapabilitiesDictionary);
            }
            else
            {
                parameters.Add("capabilities", remoteSettings.ToDictionary());
            }

            Response response = this.Execute(DriverCommand.NewSession, parameters);

            Dictionary<string, object> rawCapabilities = response.Value as Dictionary<string, object>;
            if (rawCapabilities == null)
            {
                string errorMessage = string.Format(CultureInfo.InvariantCulture, "The new session command returned a value ('{0}') that is not a valid JSON object.", response.Value);
                throw new WebDriverException(errorMessage);
            }

            ReturnedCapabilities returnedCapabilities = new ReturnedCapabilities(rawCapabilities);
            this.capabilities = returnedCapabilities;
            this.sessionId = new SessionId(response.SessionId);
        }

        /// <summary>
        /// Gets the capabilities as a dictionary.
        /// </summary>
        /// <param name="capabilitiesToConvert">The dictionary to return.</param>
        /// <returns>A Dictionary consisting of the capabilities requested.</returns>
        /// <remarks>This method is only transitional. Do not rely on it. It will be removed
        /// once browser driver capability formats stabilize.</remarks>
        protected virtual Dictionary<string, object> GetCapabilitiesDictionary(ICapabilities capabilitiesToConvert)
        {
            Dictionary<string, object> capabilitiesDictionary = new Dictionary<string, object>();
            IHasCapabilitiesDictionary capabilitiesObject = capabilitiesToConvert as IHasCapabilitiesDictionary;
            foreach (KeyValuePair<string, object> entry in capabilitiesObject.CapabilitiesDictionary)
            {
                if (CapabilityType.IsSpecCompliantCapabilityName(entry.Key))
                {
                    capabilitiesDictionary.Add(entry.Key, entry.Value);
                }
            }

            return capabilitiesDictionary;
        }

        /// <summary>
        /// Stops the client from running
        /// </summary>
        /// <param name="disposing">if its in the process of disposing</param>
        protected virtual void Dispose(bool disposing)
        {
            try
            {
                this.Execute(DriverCommand.Quit, null);
            }
            catch (NotImplementedException)
            {
            }
            catch (InvalidOperationException)
            {
            }
            catch (WebDriverException)
            {
            }
            finally
            {
                this.sessionId = null;
            }
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

                        case WebDriverResult.UnknownCommand:
                            throw new NotImplementedException(errorMessage);

                        case WebDriverResult.ObsoleteElement:
                            throw new StaleElementReferenceException(errorMessage);

                        case WebDriverResult.ElementClickIntercepted:
                            throw new ElementClickInterceptedException(errorMessage);

                        case WebDriverResult.ElementNotInteractable:
                            throw new ElementNotInteractableException(errorMessage);

                        case WebDriverResult.ElementNotDisplayed:
                            throw new ElementNotVisibleException(errorMessage);

                        case WebDriverResult.InvalidElementState:
                        case WebDriverResult.ElementNotSelectable:
                            throw new InvalidElementStateException(errorMessage);

                        case WebDriverResult.UnhandledError:
                            throw new WebDriverException(errorMessage);

                        case WebDriverResult.NoSuchDocument:
                            throw new NoSuchElementException(errorMessage);

                        case WebDriverResult.Timeout:
                            throw new WebDriverTimeoutException(errorMessage);

                        case WebDriverResult.NoSuchWindow:
                            throw new NoSuchWindowException(errorMessage);

                        case WebDriverResult.InvalidCookieDomain:
                            throw new InvalidCookieDomainException(errorMessage);

                        case WebDriverResult.UnableToSetCookie:
                            throw new UnableToSetCookieException(errorMessage);

                        case WebDriverResult.AsyncScriptTimeout:
                            throw new WebDriverTimeoutException(errorMessage);

                        case WebDriverResult.UnexpectedAlertOpen:
                            // TODO(JimEvans): Handle the case where the unexpected alert setting
                            // has been set to "ignore", so there is still a valid alert to be
                            // handled.
                            string alertText = string.Empty;
                            if (errorAsDictionary.ContainsKey("alert"))
                            {
                                Dictionary<string, object> alertDescription = errorAsDictionary["alert"] as Dictionary<string, object>;
                                if (alertDescription != null && alertDescription.ContainsKey("text"))
                                {
                                    alertText = alertDescription["text"].ToString();
                                }
                            }
                            else if (errorAsDictionary.ContainsKey("data"))
                            {
                                Dictionary<string, object> alertData = errorAsDictionary["data"] as Dictionary<string, object>;
                                if (alertData != null && alertData.ContainsKey("text"))
                                {
                                    alertText = alertData["text"].ToString();
                                }
                            }

                            throw new UnhandledAlertException(errorMessage, alertText);

                        case WebDriverResult.NoAlertPresent:
                            throw new NoAlertPresentException(errorMessage);

                        case WebDriverResult.InvalidSelector:
                            throw new InvalidSelectorException(errorMessage);

                        case WebDriverResult.NoSuchDriver:
                            throw new WebDriverException(errorMessage);

                        case WebDriverResult.InvalidArgument:
                            throw new WebDriverArgumentException(errorMessage);

                        case WebDriverResult.UnexpectedJavaScriptError:
                            throw new JavaScriptException(errorMessage);

                        case WebDriverResult.MoveTargetOutOfBounds:
                            throw new MoveTargetOutOfBoundsException(errorMessage);

                        case WebDriverResult.NoSuchShadowRoot:
                            throw new NoSuchShadowRootException(errorMessage);

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

        /// <summary>
        /// Executes JavaScript in the context of the currently selected frame or window using a specific command.
        /// </summary>
        /// <param name="script">The JavaScript code to execute.</param>
        /// <param name="commandName">The name of the command to execute.</param>
        /// <param name="args">The arguments to the script.</param>
        /// <returns>The value returned by the script.</returns>
        protected object ExecuteScriptCommand(string script, string commandName, params object[] args)
        {
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

            Response commandResponse = this.Execute(commandName, parameters);
            return this.ParseJavaScriptReturnValue(commandResponse.Value);
        }

        private static object ConvertObjectToJavaScriptObject(object arg)
        {
            IWrapsElement argAsWrapsElement = arg as IWrapsElement;
            IWebElementReference argAsElementReference = arg as IWebElementReference;
            IEnumerable argAsEnumerable = arg as IEnumerable;
            IDictionary argAsDictionary = arg as IDictionary;

            if (argAsElementReference == null && argAsWrapsElement != null)
            {
                argAsElementReference = argAsWrapsElement.WrappedElement as IWebElementReference;
            }

            object converted = null;

            if (arg is string || arg is float || arg is double || arg is int || arg is long || arg is bool || arg == null)
            {
                converted = arg;
            }
            else if (argAsElementReference != null)
            {
                // TODO: Remove "ELEMENT" addition when all remote ends are spec-compliant.
                Dictionary<string, object> elementDictionary = argAsElementReference.ToDictionary();
                converted = elementDictionary;
            }
            else if (argAsDictionary != null)
            {
                // Note that we must check for the argument being a dictionary before
                // checking for IEnumerable, since dictionaries also implement IEnumerable.
                // Additionally, JavaScript objects have property names as strings, so all
                // keys will be converted to strings.
                Dictionary<string, object> dictionary = new Dictionary<string, object>();
                foreach (var key in argAsDictionary.Keys)
                {
                    dictionary.Add(key.ToString(), ConvertObjectToJavaScriptObject(argAsDictionary[key]));
                }

                converted = dictionary;
            }
            else if (argAsEnumerable != null)
            {
                List<object> objectList = new List<object>();
                foreach (object item in argAsEnumerable)
                {
                    objectList.Add(ConvertObjectToJavaScriptObject(item));
                }

                converted = objectList.ToArray();
            }
            else
            {
                throw new ArgumentException("Argument is of an illegal type" + arg.ToString(), "arg");
            }

            return converted;
        }

        /// <summary>
        /// Converts the arguments to JavaScript objects.
        /// </summary>
        /// <param name="args">The arguments.</param>
        /// <returns>The list of the arguments converted to JavaScript objects.</returns>
        private static object[] ConvertArgumentsToJavaScriptObjects(object[] args)
        {
            if (args == null)
            {
                return new object[] { null };
            }

            for (int i = 0; i < args.Length; i++)
            {
                args[i] = ConvertObjectToJavaScriptObject(args[i]);
            }

            return args;
        }

        private object ParseJavaScriptReturnValue(object responseValue)
        {
            object returnValue = null;

            Dictionary<string, object> resultAsDictionary = responseValue as Dictionary<string, object>;
            object[] resultAsArray = responseValue as object[];

            if (resultAsDictionary != null)
            {
                if (this.elementFactory.ContainsElementReference(resultAsDictionary))
                {
                    returnValue = this.elementFactory.CreateElement(resultAsDictionary);
                }
                else
                {
                    // Recurse through the dictionary, re-parsing each value.
                    string[] keyCopy = new string[resultAsDictionary.Keys.Count];
                    resultAsDictionary.Keys.CopyTo(keyCopy, 0);
                    foreach (string key in keyCopy)
                    {
                        resultAsDictionary[key] = this.ParseJavaScriptReturnValue(resultAsDictionary[key]);
                    }

                    returnValue = resultAsDictionary;
                }
            }
            else if (resultAsArray != null)
            {
                bool allElementsAreWebElements = true;
                List<object> toReturn = new List<object>();
                foreach (object item in resultAsArray)
                {
                    object parsedItem = this.ParseJavaScriptReturnValue(item);
                    IWebElement parsedItemAsElement = parsedItem as IWebElement;
                    if (parsedItemAsElement == null)
                    {
                        allElementsAreWebElements = false;
                    }

                    toReturn.Add(parsedItem);
                }

                if (toReturn.Count > 0 && allElementsAreWebElements)
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
    }
}
