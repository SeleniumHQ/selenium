// <copyright file="WebDriver.cs" company="Selenium Committers">
// Licensed to the Software Freedom Conservancy (SFC) under one
// or more contributor license agreements.  See the NOTICE file
// distributed with this work for additional information
// regarding copyright ownership.  The SFC licenses this file
// to you under the Apache License, Version 2.0 (the
// "License"); you may not use this file except in compliance
// with the License.  You may obtain a copy of the License at
//
//   http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing,
// software distributed under the License is distributed on an
// "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
// KIND, either express or implied.  See the License for the
// specific language governing permissions and limitations
// under the License.
// </copyright>

using OpenQA.Selenium.Interactions;
using OpenQA.Selenium.Internal;
using OpenQA.Selenium.VirtualAuth;
using System;
using System.Collections;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.Diagnostics.CodeAnalysis;
using System.Globalization;
using System.Threading.Tasks;

namespace OpenQA.Selenium;

/// <summary>
/// A base class representing a driver for a web browser.
/// </summary>
public class WebDriver : IWebDriver, ISearchContext, IJavaScriptExecutor, IFindsElement, ITakesScreenshot, ISupportsPrint, IActionExecutor, IAllowsFileDetection, IHasCapabilities, IHasCommandExecutor, IHasSessionId, ICustomDriverCommandExecutor, IHasVirtualAuthenticator
{
    /// <summary>
    /// The default command timeout for HTTP requests in a RemoteWebDriver instance.
    /// </summary>
    protected static readonly TimeSpan DefaultCommandTimeout = TimeSpan.FromSeconds(60);
    private IFileDetector fileDetector = new DefaultFileDetector();
    private NetworkManager network;
    private WebElementFactory elementFactory;

    private readonly List<string> registeredCommands = new List<string>();

    /// <summary>
    /// Initializes a new instance of the <see cref="WebDriver"/> class.
    /// </summary>
    /// <param name="executor">The <see cref="ICommandExecutor"/> object used to execute commands.</param>
    /// <param name="capabilities">The <see cref="ICapabilities"/> object used to configure the driver session.</param>
    protected WebDriver(ICommandExecutor executor, ICapabilities capabilities)
    {
        this.CommandExecutor = executor;

        try
        {
            this.StartSession(capabilities);
        }
        catch (Exception)
        {
            try
            {
                // Failed to start driver session, disposing of driver
                this.Quit();
            }
            catch
            {
                // Ignore the clean-up exception. We'll propagate the original failure.
            }
            throw;
        }

        this.elementFactory = new WebElementFactory(this);
        this.registeredCommands.AddRange(DriverCommand.KnownCommands);

        if (this is ISupportsLogs)
        {
            // Only add the legacy log commands if the driver supports
            // retrieving the logs via the extension end points.
            this.RegisterDriverCommand(DriverCommand.GetAvailableLogTypes, new HttpCommandInfo(HttpCommandInfo.GetCommand, "/session/{sessionId}/se/log/types"), true);
            this.RegisterDriverCommand(DriverCommand.GetLog, new HttpCommandInfo(HttpCommandInfo.PostCommand, "/session/{sessionId}/se/log"), true);
        }
    }

    /// <summary>
    /// Gets the <see cref="ICommandExecutor"/> which executes commands for this driver.
    /// </summary>
    public ICommandExecutor CommandExecutor { get; }

    /// <summary>
    /// Gets the <see cref="ICapabilities"/> that the driver session was created with, which may be different from those requested.
    /// </summary>
    public ICapabilities Capabilities { get; private set; }

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

            commandResponse.EnsureValueIsNotNull();
            return commandResponse.Value.ToString()!;
        }

        set => new Navigator(this).GoToUrl(value);
    }

    /// <summary>
    /// Gets the title of the current browser window.
    /// </summary>
    public string Title
    {
        get
        {
            Response commandResponse = this.Execute(DriverCommand.GetTitle, null);

            return commandResponse.Value?.ToString() ?? string.Empty;
        }
    }

    /// <summary>
    /// Gets the source of the page last loaded by the browser.
    /// </summary>
    public string PageSource
    {
        get
        {
            Response commandResponse = this.Execute(DriverCommand.GetPageSource, null);

            commandResponse.EnsureValueIsNotNull();
            return commandResponse.Value.ToString()!;
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

            commandResponse.EnsureValueIsNotNull();
            return commandResponse.Value.ToString()!;
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

            commandResponse.EnsureValueIsNotNull();
            object?[] handles = (object?[])commandResponse.Value;
            List<string> handleList = new List<string>(handles.Length);
            foreach (object? handle in handles)
            {
                handleList.Add(handle!.ToString()!);
            }

            return handleList.AsReadOnly();
        }
    }

    /// <summary>
    /// Gets a value indicating whether this object is a valid action executor.
    /// </summary>
    public bool IsActionExecutor => true;

    /// <summary>
    /// Gets the <see cref="Selenium.SessionId"/> for the current session of this driver.
    /// </summary>
    public SessionId SessionId { get; private set; }

    /// <summary>
    /// Gets or sets the <see cref="IFileDetector"/> responsible for detecting
    /// sequences of keystrokes representing file paths and names.
    /// </summary>
    /// <exception cref="ArgumentNullException">If value is set to <see langword="null"/>.</exception>
    public virtual IFileDetector FileDetector
    {
        get => this.fileDetector;
        set => this.fileDetector = value ?? throw new ArgumentNullException(nameof(value), "FileDetector cannot be null");
    }

    internal INetwork Network => this.network ??= new NetworkManager(this);

    /// <summary>
    /// Gets or sets the factory object used to create instances of <see cref="WebElement"/>
    /// or its subclasses.
    /// </summary>
    /// <exception cref="ArgumentNullException">If value is set to <see langword="null"/>.</exception>
    protected WebElementFactory ElementFactory
    {
        get => this.elementFactory;
        set => this.elementFactory = value ?? throw new ArgumentNullException(nameof(value));
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
    public object? ExecuteAsyncScript(string script, params object?[]? args)
    {
        return this.ExecuteScriptCommand(script, DriverCommand.ExecuteAsyncScript, args);
    }

    /// <summary>
    /// Executes JavaScript in the context of the currently selected frame or window
    /// </summary>
    /// <param name="script">The JavaScript code to execute.</param>
    /// <param name="args">The arguments to the script.</param>
    /// <returns>The value returned by the script.</returns>
    public object? ExecuteScript(string script, params object?[]? args)
    {
        return this.ExecuteScriptCommand(script, DriverCommand.ExecuteScript, args);
    }

    /// <summary>
    /// Executes JavaScript in the context of the currently selected frame or window
    /// </summary>
    /// <param name="script">A <see cref="PinnedScript"/> object containing the JavaScript code to execute.</param>
    /// <param name="args">The arguments to the script.</param>
    /// <returns>The value returned by the script.</returns>
    /// <exception cref="ArgumentNullException">If <paramref name="script" /> is <see langword="null"/>.</exception>
    public object? ExecuteScript(PinnedScript script, params object?[]? args)
    {
        if (script == null)
        {
            throw new ArgumentNullException(nameof(script));
        }

        return this.ExecuteScript(script.MakeExecutionScript(), args);
    }

    /// <summary>
    /// Finds the first element in the page that matches the <see cref="By"/> object
    /// </summary>
    /// <param name="by">By mechanism to find the object</param>
    /// <returns>IWebElement object so that you can interact with that object</returns>
    /// <exception cref="ArgumentNullException">If <paramref name="by" /> is <see langword="null"/>.</exception>
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
            throw new ArgumentNullException(nameof(@by), "by cannot be null");
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

        return this.GetElementFromResponse(commandResponse)!;
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
            throw new ArgumentNullException(nameof(@by), "by cannot be null");
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

        screenshotResponse.EnsureValueIsNotNull();
        string base64 = screenshotResponse.Value.ToString()!;
        return new Screenshot(base64);
    }

    /// <summary>
    /// Gets a <see cref="PrintDocument"/> object representing a PDF-formatted print representation of the page.
    /// </summary>
    /// <param name="printOptions">A <see cref="PrintOptions"/> object describing the options of the printed document.</param>
    /// <returns>The <see cref="PrintDocument"/> object containing the PDF-formatted print representation of the page.</returns>
    /// <exception cref="ArgumentNullException">If <paramref name="printOptions"/> is <see langword="null"/>.</exception>
    public PrintDocument Print(PrintOptions printOptions)
    {
        if (printOptions is null)
        {
            throw new ArgumentNullException(nameof(printOptions));
        }

        Response commandResponse = this.Execute(DriverCommand.Print, printOptions.ToDictionary());

        commandResponse.EnsureValueIsNotNull();
        string base64 = commandResponse.Value.ToString()!;
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
            throw new ArgumentNullException(nameof(actionSequenceList), "List of action sequences must not be null");
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

    /// <summary>
    /// Instructs the driver to change its settings.
    /// </summary>
    /// <returns>An <see cref="IOptions"/> object allowing the user to change
    /// the settings of the driver.</returns>
    public IOptions Manage()
    {
        return new OptionsManager(this);
    }

    /// <summary>
    /// Instructs the driver to navigate the browser to another location.
    /// </summary>
    /// <returns>An <see cref="INavigation"/> object allowing the user to access
    /// the browser's history and to navigate to a given URL.</returns>
    public INavigation Navigate()
    {
        return new Navigator(this);
    }

    /// <summary>
    /// Executes a command with this driver.
    /// </summary>
    /// <param name="driverCommandToExecute">The name of the command to execute. The command name must be registered with the command executor, and must not be a command name known to this driver type.</param>
    /// <param name="parameters">A <see cref="Dictionary{K, V}"/> containing the names and values of the parameters of the command.</param>
    /// <returns>A <see cref="Response"/> containing information about the success or failure of the command and any data returned by the command.</returns>
    /// <exception cref="WebDriverException">The command returned an exceptional value.</exception>
    public object? ExecuteCustomDriverCommand(string driverCommandToExecute, Dictionary<string, object> parameters)
    {
        if (this.registeredCommands.Contains(driverCommandToExecute))
        {
            throw new WebDriverException(string.Format(CultureInfo.InvariantCulture, "A command named '{0}' is predefined by the driver class and cannot be executed with ExecuteCustomDriverCommand. It should be executed using a named method instead.", driverCommandToExecute));
        }

        return this.Execute(driverCommandToExecute, parameters).Value;
    }

    /// <summary>
    /// Registers a set of commands to be executed with this driver instance.
    /// </summary>
    /// <param name="commands">An <see cref="IReadOnlyDictionary{String, CommandInfo}"/> where the keys are the names of the commands to register, and the values are the <see cref="CommandInfo"/> objects describing the commands.</param>
    public void RegisterCustomDriverCommands(IReadOnlyDictionary<string, CommandInfo> commands)
    {
        foreach (KeyValuePair<string, CommandInfo> entry in commands)
        {
            this.RegisterCustomDriverCommand(entry.Key, entry.Value);
        }
    }

    /// <summary>
    /// Registers a command to be executed with this driver instance.
    /// </summary>
    /// <param name="commandName">The unique name of the command to register.</param>
    /// <param name="commandInfo">The <see cref="CommandInfo"/> object describing the command.</param>
    /// <returns><see langword="true"/> if the command was registered; otherwise, <see langword="false"/>.</returns>
    public bool RegisterCustomDriverCommand(string commandName, [NotNullWhen(true)] CommandInfo? commandInfo)
    {
        return this.RegisterDriverCommand(commandName, commandInfo, false);
    }

    /// <summary>
    /// Registers a command to be executed with this driver instance.
    /// </summary>
    /// <param name="commandName">The unique name of the command to register.</param>
    /// <param name="commandInfo">The <see cref="CommandInfo"/> object describing the command.</param>
    /// <param name="isInternalCommand"><see langword="true"/> if the registered command is internal to the driver; otherwise <see langword="false"/>.</param>
    /// <returns><see langword="true"/> if the command was registered; otherwise, <see langword="false"/>.</returns>
    internal bool RegisterDriverCommand(string commandName, [NotNullWhen(true)] CommandInfo? commandInfo, bool isInternalCommand)
    {
        if (this.CommandExecutor.TryAddCommand(commandName, commandInfo))
        {
            if (isInternalCommand)
            {
                this.registeredCommands.Add(commandName);
            }

            return true;
        }

        return false;
    }

    /// <summary>
    /// Find the element in the response
    /// </summary>
    /// <param name="response">Response from the browser</param>
    /// <returns>Element from the page, or <see langword="null"/> if the response does not contain a dictionary.</returns>
    internal IWebElement? GetElementFromResponse(Response response)
    {
        if (response.Value is Dictionary<string, object?> elementDictionary)
        {
            return this.elementFactory.CreateElement(elementDictionary);
        }

        return null;
    }

    /// <summary>
    /// Finds the elements that are in the response
    /// </summary>
    /// <param name="response">Response from the browser</param>
    /// <returns>Collection of elements</returns>
    internal ReadOnlyCollection<IWebElement> GetElementsFromResponse(Response response)
    {
        List<IWebElement> toReturn = new List<IWebElement>();
        if (response.Value is object?[] elements)
        {
            foreach (object? elementObject in elements)
            {
                if (elementObject is Dictionary<string, object?> elementDictionary)
                {
                    WebElement element = this.elementFactory.CreateElement(elementDictionary);
                    toReturn.Add(element);
                }
            }
        }

        return toReturn.AsReadOnly();
    }

    /// <summary>
    /// Executes a command with this driver.
    /// </summary>
    /// <param name="driverCommandToExecute">A <see cref="DriverCommand"/> value representing the command to execute.</param>
    /// <param name="parameters">A <see cref="Dictionary{K, V}"/> containing the names and values of the parameters of the command.</param>
    /// <returns>A <see cref="Response"/> containing information about the success or failure of the command and any data returned by the command.</returns>
    /// <exception cref="ArgumentNullException">If <paramref name="driverCommandToExecute"/> is <see langword="null"/>.</exception>
    protected internal virtual Response Execute(string driverCommandToExecute, Dictionary<string,
#nullable disable
        object
#nullable enable
        >? parameters)
    {
        return Task.Run(() => this.ExecuteAsync(driverCommandToExecute, parameters)).GetAwaiter().GetResult();
    }

    /// <summary>
    /// Executes a command with this driver.
    /// </summary>
    /// <param name="driverCommandToExecute">A <see cref="DriverCommand"/> value representing the command to execute.</param>
    /// <param name="parameters">A <see cref="Dictionary{K, V}"/> containing the names and values of the parameters of the command.</param>
    /// <returns>A <see cref="Response"/> containing information about the success or failure of the command and any data returned by the command.</returns>
    /// <exception cref="ArgumentNullException">If <paramref name="driverCommandToExecute"/> is <see langword="null"/>.</exception>
    protected internal virtual async Task<Response> ExecuteAsync(string driverCommandToExecute, Dictionary<string,
#nullable disable
        object
#nullable enable
        >? parameters)
    {
        Command commandToExecute = new Command(SessionId, driverCommandToExecute, parameters);

        Response commandResponse = await this.CommandExecutor.ExecuteAsync(commandToExecute).ConfigureAwait(false);

        if (commandResponse.Status != WebDriverResult.Success)
        {
            UnpackAndThrowOnError(commandResponse, driverCommandToExecute);
        }

        return commandResponse;
    }

    /// <summary>
    /// Starts a session with the driver
    /// </summary>
    /// <param name="capabilities">Capabilities of the browser</param>
    [MemberNotNull(nameof(SessionId))]
    [MemberNotNull(nameof(Capabilities))]
    protected void StartSession(ICapabilities capabilities)
    {
        Dictionary<string, object> parameters = new Dictionary<string, object>();

        // If the object passed into the RemoteWebDriver constructor is a
        // RemoteSessionSettings object, it is expected that all intermediate
        // and end nodes are compliant with the W3C WebDriver Specification,
        // and therefore will already contain all of the appropriate values
        // for establishing a session.
        if (capabilities is not RemoteSessionSettings remoteSettings)
        {
            Dictionary<string, object> matchCapabilities = this.GetCapabilitiesDictionary(capabilities);

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

        response.EnsureValueIsNotNull();
        if (response.Value is not Dictionary<string, object> rawCapabilities)
        {
            string errorMessage = string.Format(CultureInfo.InvariantCulture, "The new session command returned a value ('{0}') that is not a valid JSON object.", response.Value);
            throw new WebDriverException(errorMessage);
        }

        this.Capabilities = new ReturnedCapabilities(rawCapabilities);

        string sessionId = response.SessionId ?? throw new WebDriverException($"The remote end did not respond with ID of a session when it was required. {response.Value}");
        this.SessionId = new SessionId(sessionId);
    }

    /// <summary>
    /// Gets the capabilities as a dictionary.
    /// </summary>
    /// <param name="capabilitiesToConvert">The dictionary to return.</param>
    /// <returns>A Dictionary consisting of the capabilities requested.</returns>
    /// <remarks>This method is only transitional. Do not rely on it. It will be removed
    /// once browser driver capability formats stabilize.</remarks>
    /// <exception cref="ArgumentNullException">If <paramref name="capabilitiesToConvert"/> is <see langword="null"/>.</exception>
    protected virtual Dictionary<string, object> GetCapabilitiesDictionary(ICapabilities capabilitiesToConvert)
    {
        if (capabilitiesToConvert is null)
        {
            throw new ArgumentNullException(nameof(capabilitiesToConvert));
        }

        Dictionary<string, object> capabilitiesDictionary = new Dictionary<string, object>();

        foreach (KeyValuePair<string, object> entry in ((IHasCapabilitiesDictionary)capabilitiesToConvert).CapabilitiesDictionary)
        {
            if (CapabilityType.IsSpecCompliantCapabilityName(entry.Key))
            {
                capabilitiesDictionary.Add(entry.Key, entry.Value);
            }
        }

        return capabilitiesDictionary;
    }

    /// <summary>
    /// Registers a command to be executed with this driver instance as an internally known driver command.
    /// </summary>
    /// <param name="commandName">The unique name of the command to register.</param>
    /// <param name="commandInfo">The <see cref="CommandInfo"/> object describing the command.</param>
    /// <returns><see langword="true"/> if the command was registered; otherwise, <see langword="false"/>.</returns>
    protected bool RegisterInternalDriverCommand(string commandName, [NotNullWhen(true)] CommandInfo? commandInfo)
    {
        return this.RegisterDriverCommand(commandName, commandInfo, true);
    }

    /// <summary>
    /// Stops the client from running
    /// </summary>
    /// <param name="disposing">if its in the process of disposing</param>
    protected virtual void Dispose(bool disposing)
    {
        try
        {
            if (this.SessionId is not null)
            {
                this.Execute(DriverCommand.Quit, null);
            }
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
            this.SessionId = null!;
        }

        this.CommandExecutor.Dispose();
    }

    private static void UnpackAndThrowOnError(Response errorResponse, string commandToExecute)
    {
        // Check the status code of the error, and only handle if not success.
        if (errorResponse.Status != WebDriverResult.Success)
        {
            if (errorResponse.Value is Dictionary<string, object?> errorAsDictionary)
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

                    case WebDriverResult.InvalidElementState:
                        throw new InvalidElementStateException(errorMessage);

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
                        string? alertText = null;
                        if (errorAsDictionary.TryGetValue("alert", out object? alert))
                        {
                            if (alert is Dictionary<string, object?> alertDescription
                                && alertDescription.TryGetValue("text", out object? text))
                            {
                                alertText = text?.ToString();
                            }
                        }
                        else if (errorAsDictionary.TryGetValue("data", out object? data))
                        {
                            if (data is Dictionary<string, object?> alertData
                                && alertData.TryGetValue("text", out object? dataText))
                            {
                                alertText = dataText?.ToString();
                            }
                        }

                        throw new UnhandledAlertException(errorMessage, alertText ?? string.Empty);

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

                    case WebDriverResult.DetachedShadowRoot:
                        throw new DetachedShadowRootException(errorMessage);

                    case WebDriverResult.InsecureCertificate:
                        throw new InsecureCertificateException(errorMessage);

                    case WebDriverResult.UnknownError:
                        throw new UnknownErrorException(errorMessage);

                    case WebDriverResult.UnknownMethod:
                        throw new UnknownMethodException(errorMessage);

                    case WebDriverResult.UnsupportedOperation:
                        throw new UnsupportedOperationException(errorMessage);

                    case WebDriverResult.NoSuchCookie:
                        throw new NoSuchCookieException(errorMessage);

                    default:
                        throw new InvalidOperationException(string.Format(CultureInfo.InvariantCulture, "{0} ({1})", errorMessage, errorResponse.Status));
                }
            }

            throw new WebDriverException($"The {commandToExecute} command returned an unexpected error. {errorResponse.Value}");
        }
    }

    /// <summary>
    /// Executes JavaScript in the context of the currently selected frame or window using a specific command.
    /// </summary>
    /// <param name="script">The JavaScript code to execute.</param>
    /// <param name="commandName">The name of the command to execute.</param>
    /// <param name="args">The arguments to the script.</param>
    /// <returns>The value returned by the script.</returns>
    protected object? ExecuteScriptCommand(string script, string commandName, params object?[]? args)
    {
        object?[] convertedArgs = ConvertArgumentsToJavaScriptObjects(args);

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

    private static object? ConvertObjectToJavaScriptObject(object? arg)
    {
        IWebDriverObjectReference? argAsObjectReference = arg as IWebDriverObjectReference;

        if (argAsObjectReference == null && arg is IWrapsElement argAsWrapsElement)
        {
            argAsObjectReference = argAsWrapsElement.WrappedElement as IWebDriverObjectReference;
        }

        object? converted;

        if (arg is string || arg is float || arg is double || arg is int || arg is long || arg is bool || arg == null)
        {
            converted = arg;
        }
        else if (argAsObjectReference != null)
        {
            Dictionary<string, object> webDriverObjectReferenceDictionary = argAsObjectReference.ToDictionary();
            converted = webDriverObjectReferenceDictionary;
        }
        else if (arg is IDictionary argAsDictionary)
        {
            // Note that we must check for the argument being a dictionary before
            // checking for IEnumerable, since dictionaries also implement IEnumerable.
            // Additionally, JavaScript objects have property names as strings, so all
            // keys will be converted to strings.
            Dictionary<string, object?> dictionary = new Dictionary<string, object?>();
            foreach (DictionaryEntry argEntry in argAsDictionary)
            {
                dictionary.Add(argEntry.Key.ToString()!, ConvertObjectToJavaScriptObject(argEntry.Value));
            }

            converted = dictionary;
        }
        else if (arg is IEnumerable argAsEnumerable)
        {
            List<object?> objectList = new List<object?>();
            foreach (object? item in argAsEnumerable)
            {
                objectList.Add(ConvertObjectToJavaScriptObject(item));
            }

            converted = objectList.ToArray();
        }
        else
        {
            throw new ArgumentException("Argument is of an illegal type: " + arg.ToString(), nameof(arg));
        }

        return converted;
    }

    /// <summary>
    /// Converts the arguments to JavaScript objects.
    /// </summary>
    /// <param name="args">The arguments.</param>
    /// <returns>The list of the arguments converted to JavaScript objects.</returns>
    private static object?[] ConvertArgumentsToJavaScriptObjects(object?[]? args)
    {
        if (args == null)
        {
            return new object?[] { null };
        }

        for (int i = 0; i < args.Length; i++)
        {
            args[i] = ConvertObjectToJavaScriptObject(args[i]);
        }

        return args;
    }

    private object? ParseJavaScriptReturnValue(object? responseValue)
    {
        object? returnValue;

        if (responseValue is Dictionary<string, object?> resultAsDictionary)
        {
            if (this.elementFactory.ContainsElementReference(resultAsDictionary))
            {
                returnValue = this.elementFactory.CreateElement(resultAsDictionary);
            }
            else if (ShadowRoot.TryCreate(this, resultAsDictionary, out ShadowRoot? shadowRoot))
            {
                returnValue = shadowRoot;
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
        else if (responseValue is object?[] resultAsArray)
        {
            bool allElementsAreWebElements = true;
            List<object?> toReturn = new List<object?>(resultAsArray.Length);
            foreach (object? item in resultAsArray)
            {
                object? parsedItem = this.ParseJavaScriptReturnValue(item);
                if (parsedItem is not IWebElement)
                {
                    allElementsAreWebElements = false;
                }

                toReturn.Add(parsedItem);
            }

            if (toReturn.Count > 0 && allElementsAreWebElements)
            {
                List<IWebElement> elementList = new List<IWebElement>(resultAsArray.Length);
                foreach (object? listItem in toReturn)
                {
                    elementList.Add((IWebElement)listItem!);
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

    /// <summary>
    /// Creates a Virtual Authenticator.
    /// </summary>
    /// <param name="options"><see href="https://w3c.github.io/webauthn/#sctn-automation-virtual-authenticators">Virtual Authenticator Options</see>.</param>
    /// <returns> Authenticator id as string </returns>
    /// <exception cref="ArgumentNullException">If <paramref name="options"/> is <see langword="null"/>.</exception>
    public string AddVirtualAuthenticator(VirtualAuthenticatorOptions options)
    {
        if (options is null)
        {
            throw new ArgumentNullException(nameof(options));
        }

        Response commandResponse = this.Execute(DriverCommand.AddVirtualAuthenticator, options.ToDictionary());

        commandResponse.EnsureValueIsNotNull();
        string id = (string)commandResponse.Value;
        this.AuthenticatorId = id;
        return id;
    }

    /// <summary>
    /// Removes the Virtual Authenticator
    /// </summary>
    /// <param name="authenticatorId">Id as string that uniquely identifies a Virtual Authenticator.</param>
    /// <exception cref="ArgumentNullException">If <paramref name="authenticatorId"/> is <see langword="null"/>.</exception>
    public void RemoveVirtualAuthenticator(string authenticatorId)
    {
        if (authenticatorId is null)
        {
            throw new ArgumentNullException(nameof(authenticatorId));
        }

        Dictionary<string, object> parameters = new Dictionary<string, object>();
        parameters.Add("authenticatorId", authenticatorId);

        this.Execute(DriverCommand.RemoveVirtualAuthenticator, parameters);
        this.AuthenticatorId = null;
    }

    /// <summary>
    /// Gets the cached virtual authenticator ID, or <see langword="null"/> if no authenticator ID is set.
    /// </summary>
    public string? AuthenticatorId { get; private set; }

    /// <summary>
    /// Add a credential to the Virtual Authenticator/
    /// </summary>
    /// <param name="credential"> The credential to be stored in the Virtual Authenticator</param>
    /// <exception cref="ArgumentNullException">If <paramref name="credential"/> is <see langword="null"/>.</exception>
    /// <exception cref="InvalidOperationException">If a Virtual Authenticator has not been added yet.</exception>
    public void AddCredential(Credential credential)
    {
        if (credential is null)
        {
            throw new ArgumentNullException(nameof(credential));
        }

        string authenticatorId = this.AuthenticatorId ?? throw new InvalidOperationException("Virtual Authenticator needs to be added before it can perform operations");

        Dictionary<string, object> parameters = new Dictionary<string, object>(credential.ToDictionary());
        parameters.Add("authenticatorId", authenticatorId);

        this.Execute(driverCommandToExecute: DriverCommand.AddCredential, parameters);
    }

    /// <summary>
    /// Retrieves all the credentials stored in the Virtual Authenticator
    /// </summary>
    /// <returns> List of credentials </returns>
    /// <exception cref="InvalidOperationException">If a Virtual Authenticator has not been added yet.</exception>
    public List<Credential> GetCredentials()
    {
        string authenticatorId = this.AuthenticatorId ?? throw new InvalidOperationException("Virtual Authenticator needs to be added before it can perform operations");

        Dictionary<string, object> parameters = new Dictionary<string, object>();
        parameters.Add("authenticatorId", authenticatorId);

        Response getCredentialsResponse = this.Execute(driverCommandToExecute: DriverCommand.GetCredentials, parameters);

        getCredentialsResponse.EnsureValueIsNotNull();
        if (getCredentialsResponse.Value is not object?[] credentialsList)
        {
            throw new WebDriverException($"Get credentials call succeeded, but the response was not a list of credentials: {getCredentialsResponse.Value}");
        }

        List<Credential> credentials = new List<Credential>(credentialsList.Length);
        foreach (object? dictionary in credentialsList)
        {
            Credential credential = Credential.FromDictionary((Dictionary<string, object>)dictionary!);
            credentials.Add(credential);
        }

        return credentials;
    }

    /// <summary>
    /// Removes the credential identified by the credentialId from the Virtual Authenticator.
    /// </summary>
    /// <param name="credentialId"> The id as byte array that uniquely identifies a credential </param>
    /// <exception cref="ArgumentNullException">If <paramref name="credentialId"/> is <see langword="null"/>.</exception>
    /// <exception cref="InvalidOperationException">If a Virtual Authenticator has not been added yet.</exception>
    public void RemoveCredential(byte[] credentialId)
    {
        RemoveCredential(Base64UrlEncoder.Encode(credentialId));
    }

    /// <summary>
    /// Removes the credential identified by the credentialId from the Virtual Authenticator.
    /// </summary>
    /// <param name="credentialId"> The id as string that uniquely identifies a credential </param>
    /// <exception cref="ArgumentNullException">If <paramref name="credentialId"/> is <see langword="null"/>.</exception>
    /// <exception cref="InvalidOperationException">If a Virtual Authenticator has not been added yet.</exception>
    public void RemoveCredential(string credentialId)
    {
        if (credentialId is null)
        {
            throw new ArgumentNullException(nameof(credentialId));
        }

        string authenticatorId = this.AuthenticatorId ?? throw new InvalidOperationException("Virtual Authenticator needs to be added before it can perform operations");

        Dictionary<string, object> parameters = new Dictionary<string, object>();
        parameters.Add("authenticatorId", authenticatorId);
        parameters.Add("credentialId", credentialId);

        this.Execute(driverCommandToExecute: DriverCommand.RemoveCredential, parameters);
    }

    /// <summary>
    /// Removes all the credentials stored in the Virtual Authenticator.
    /// </summary>
    /// <exception cref="InvalidOperationException">If a Virtual Authenticator has not been added yet.</exception>
    public void RemoveAllCredentials()
    {
        string authenticatorId = this.AuthenticatorId ?? throw new InvalidOperationException("Virtual Authenticator needs to be added before it can perform operations");

        Dictionary<string, object> parameters = new Dictionary<string, object>();
        parameters.Add("authenticatorId", authenticatorId);

        this.Execute(driverCommandToExecute: DriverCommand.RemoveAllCredentials, parameters);
    }

    /// <summary>
    ///  Sets the isUserVerified property for the Virtual Authenticator.
    /// </summary>
    /// <param name="verified">The boolean value representing value to be set </param>
    public void SetUserVerified(bool verified)
    {
        string authenticatorId = this.AuthenticatorId ?? throw new InvalidOperationException("Virtual Authenticator needs to be added before it can perform operations");

        Dictionary<string, object> parameters = new Dictionary<string, object>();
        parameters.Add("authenticatorId", authenticatorId);
        parameters.Add("isUserVerified", verified);

        this.Execute(driverCommandToExecute: DriverCommand.SetUserVerified, parameters);
    }
}
