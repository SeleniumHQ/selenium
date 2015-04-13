// <copyright file="WebDriverCommandProcessor.cs" company="WebDriver Committers">
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
using System.Collections.Generic;
using System.Globalization;
using OpenQA.Selenium;
using Selenium.Internal;
using Selenium.Internal.SeleniumEmulation;

namespace Selenium
{
    /// <summary>
    /// Provides an implementation the ICommandProcessor interface which uses WebDriver to complete
    /// the Selenium commands.
    /// </summary>
    public class WebDriverCommandProcessor : ICommandProcessor
    {
        #region Private members
        private IWebDriver driver;
        private Uri baseUrl;
        private Dictionary<string, SeleneseCommand> seleneseMethods = new Dictionary<string, SeleneseCommand>();
        private ElementFinder elementFinder = new ElementFinder();
        private CommandTimer timer;
        private AlertOverride alertOverride;
        private IScriptMutator mutator;
        #endregion

        /// <summary>
        /// Initializes a new instance of the <see cref="WebDriverCommandProcessor"/> class.
        /// </summary>
        /// <param name="baseUrl">The base URL of the Selenium server.</param>
        /// <param name="baseDriver">The IWebDriver object used for executing commands.</param>
        public WebDriverCommandProcessor(string baseUrl, IWebDriver baseDriver)
            : this(new Uri(baseUrl), baseDriver)
        {
        }

        /// <summary>
        /// Initializes a new instance of the <see cref="WebDriverCommandProcessor"/> class.
        /// </summary>
        /// <param name="baseUrl">The base URL of the Selenium server.</param>
        /// <param name="baseDriver">The IWebDriver object used for executing commands.</param>
        public WebDriverCommandProcessor(Uri baseUrl, IWebDriver baseDriver)
        {
            if (baseUrl == null)
            {
                throw new ArgumentNullException("baseUrl", "baseUrl cannot be null");
            }

            this.driver = baseDriver;
            this.baseUrl = baseUrl;
            this.mutator = new CompoundMutator(baseUrl.ToString());
            this.timer = new CommandTimer(30000);
            this.alertOverride = new AlertOverride(baseDriver);
        }
        
        /// <summary>
        /// Gets the <see cref="IWebDriver"/> object that executes the commands for this command processor.
        /// </summary>
        public IWebDriver UnderlyingWebDriver
        {
            get { return this.driver; }
        }

        /// <summary>
        /// Sends the specified remote command to the browser to be performed
        /// </summary>
        /// <param name="command">The remote command verb.</param>
        /// <param name="args">The arguments to the remote command (depends on the verb).</param>
        /// <returns>the command result, defined by the remote JavaScript. "getX" style
        /// commands may return data from the browser</returns>
        public string DoCommand(string command, string[] args)
        {
            object val = this.Execute(command, args);
            if (val == null)
            {
                return null;
            }

            return val.ToString();
        }
        
        /// <summary>
        /// Sets the script to use as user extensions.
        /// </summary>
        /// <param name="extensionJs">The script to use as user extensions.</param>
        public void SetExtensionJs(string extensionJs)
        {
            throw new NotImplementedException();
        }
        
        /// <summary>
        /// Starts the command processor.
        /// </summary>
        public void Start()
        {
            this.PopulateSeleneseMethods();
        }

        /// <summary>
        /// Starts the command processor using the specified options.
        /// </summary>
        /// <param name="optionsString">A string representing the options to use.</param>
        public void Start(string optionsString)
        {
            // Not porting this till other process is decided
            throw new NotImplementedException("This is not been ported to WebDriverBackedSelenium");
        }

        /// <summary>
        /// Starts the command processor using the specified options.
        /// </summary>
        /// <param name="optionsObject">An object representing the options to use.</param>
        public void Start(object optionsObject)
        {
            // Not porting this till other process is decided
            throw new NotImplementedException("This is not been ported to WebDriverBackedSelenium");
        }
        
        /// <summary>
        /// Stops the command processor.
        /// </summary>
        public void Stop()
        {
            if (this.driver != null)
            {
                this.driver.Quit();
            }

            this.driver = null;
        }
        
        /// <summary>
        /// Gets a string from the command processor.
        /// </summary>
        /// <param name="command">The command to send.</param>
        /// <param name="args">The arguments of the command.</param>
        /// <returns>The result of the command.</returns>
        public string GetString(string command, string[] args)
        {
            return (string)this.Execute(command, args);
        }

        /// <summary>
        /// Gets a string array from the command processor.
        /// </summary>
        /// <param name="command">The command to send.</param>
        /// <param name="args">The arguments of the command.</param>
        /// <returns>The result of the command.</returns>
        public string[] GetStringArray(string command, string[] args)
        {
            return (string[])this.Execute(command, args);
        }

        /// <summary>
        /// Gets a number from the command processor.
        /// </summary>
        /// <param name="command">The command to send.</param>
        /// <param name="args">The arguments of the command.</param>
        /// <returns>The result of the command.</returns>
        public decimal GetNumber(string command, string[] args)
        {
            return Convert.ToDecimal(this.Execute(command, args), CultureInfo.InvariantCulture);
        }
        
        /// <summary>
        /// Gets a number array from the command processor.
        /// </summary>
        /// <param name="command">The command to send.</param>
        /// <param name="args">The arguments of the command.</param>
        /// <returns>The result of the command.</returns>
        public decimal[] GetNumberArray(string command, string[] args)
        {
            throw new NotImplementedException();
        }

        /// <summary>
        /// Gets a boolean value from the command processor.
        /// </summary>
        /// <param name="command">The command to send.</param>
        /// <param name="args">The arguments of the command.</param>
        /// <returns>The result of the command.</returns>
        public bool GetBoolean(string command, string[] args)
        {
            return (bool)this.Execute(command, args);
        }
        
        /// <summary>
        /// Gets an array of boolean values from the command processor.
        /// </summary>
        /// <param name="command">The command to send.</param>
        /// <param name="args">The arguments of the command.</param>
        /// <returns>The result of the command.</returns>
        public bool[] GetBooleanArray(string command, string[] args)
        {
            throw new NotImplementedException();
        }

        private object Execute(string commandName, string[] args)
        {
            SeleneseCommand command;
            if (!this.seleneseMethods.TryGetValue(commandName, out command))
            {
                if (this.seleneseMethods.Count == 0)
                {
                    throw new NotSupportedException(commandName + " is not supported\n" +
                        "Note: Start() must be called before any other methods may be called - make sure you've called Start().");
                }

                throw new NotSupportedException(commandName);
            }

            // return command.Apply(driver, args);
            return this.timer.Execute(command, this.driver, args);
        }

        private void PopulateSeleneseMethods()
        {
            KeyState keyState = new KeyState();
            WindowSelector windows = new WindowSelector(this.driver);

            // Note the we use the names used by the CommandProcessor
            this.seleneseMethods.Add("addLocationStrategy", new AddLocationStrategy(this.elementFinder));
            this.seleneseMethods.Add("addSelection", new AddSelection(this.elementFinder));
            this.seleneseMethods.Add("altKeyDown", new AltKeyDown(keyState));
            this.seleneseMethods.Add("altKeyUp", new AltKeyUp(keyState));
            this.seleneseMethods.Add("assignId", new AssignId(this.elementFinder));
            this.seleneseMethods.Add("attachFile", new AttachFile(this.elementFinder));
            this.seleneseMethods.Add("captureScreenshotToString", new CaptureScreenshotToString());
            this.seleneseMethods.Add("click", new Click(this.alertOverride, this.elementFinder));
            this.seleneseMethods.Add("clickAt", new ClickAt(this.alertOverride, this.elementFinder));
            this.seleneseMethods.Add("check", new Check(this.alertOverride, this.elementFinder));
            this.seleneseMethods.Add("chooseCancelOnNextConfirmation", new SetNextConfirmationState(false));
            this.seleneseMethods.Add("chooseOkOnNextConfirmation", new SetNextConfirmationState(true));
            this.seleneseMethods.Add("close", new Close());
            this.seleneseMethods.Add("createCookie", new CreateCookie());
            this.seleneseMethods.Add("controlKeyDown", new ControlKeyDown(keyState));
            this.seleneseMethods.Add("controlKeyUp", new ControlKeyUp(keyState));
            this.seleneseMethods.Add("deleteAllVisibleCookies", new DeleteAllVisibleCookies());
            this.seleneseMethods.Add("deleteCookie", new DeleteCookie());
            this.seleneseMethods.Add("doubleClick", new DoubleClick(this.elementFinder));
            this.seleneseMethods.Add("dragdrop", new DragAndDrop(this.elementFinder));
            this.seleneseMethods.Add("dragAndDrop", new DragAndDrop(this.elementFinder));
            this.seleneseMethods.Add("dragAndDropToObject", new DragAndDropToObject(this.elementFinder));
            this.seleneseMethods.Add("fireEvent", new FireEvent(this.elementFinder));
            this.seleneseMethods.Add("focus", new FireNamedEvent(this.elementFinder, "focus"));
            this.seleneseMethods.Add("getAlert", new GetAlert(this.alertOverride));
            this.seleneseMethods.Add("getAllButtons", new GetAllButtons());
            this.seleneseMethods.Add("getAllFields", new GetAllFields());
            this.seleneseMethods.Add("getAllLinks", new GetAllLinks());
            this.seleneseMethods.Add("getAllWindowTitles", new GetAllWindowTitles());
            this.seleneseMethods.Add("getAttribute", new GetAttribute(this.elementFinder));
            this.seleneseMethods.Add("getAttributeFromAllWindows", new GetAttributeFromAllWindows());
            this.seleneseMethods.Add("getBodyText", new GetBodyText());
            this.seleneseMethods.Add("getConfirmation", new GetConfirmation(this.alertOverride));
            this.seleneseMethods.Add("getCookie", new GetCookie());
            this.seleneseMethods.Add("getCookieByName", new GetCookieByName());
            this.seleneseMethods.Add("getElementHeight", new GetElementHeight(this.elementFinder));
            this.seleneseMethods.Add("getElementIndex", new GetElementIndex(this.elementFinder));
            this.seleneseMethods.Add("getElementPositionLeft", new GetElementPositionLeft(this.elementFinder));
            this.seleneseMethods.Add("getElementPositionTop", new GetElementPositionTop(this.elementFinder));
            this.seleneseMethods.Add("getElementWidth", new GetElementWidth(this.elementFinder));
            this.seleneseMethods.Add("getEval", new GetEval(this.mutator));
            this.seleneseMethods.Add("getHtmlSource", new GetHtmlSource());
            this.seleneseMethods.Add("getLocation", new GetLocation());
            this.seleneseMethods.Add("getSelectedId", new FindFirstSelectedOptionProperty(this.elementFinder, "id"));
            this.seleneseMethods.Add("getSelectedIds", new FindSelectedOptionProperties(this.elementFinder, "id"));
            this.seleneseMethods.Add("getSelectedIndex", new FindFirstSelectedOptionProperty(this.elementFinder, "index"));
            this.seleneseMethods.Add("getSelectedIndexes", new FindSelectedOptionProperties(this.elementFinder, "index"));
            this.seleneseMethods.Add("getSelectedLabel", new FindFirstSelectedOptionProperty(this.elementFinder, "text"));
            this.seleneseMethods.Add("getSelectedLabels", new FindSelectedOptionProperties(this.elementFinder, "text"));
            this.seleneseMethods.Add("getSelectedValue", new FindFirstSelectedOptionProperty(this.elementFinder, "value"));
            this.seleneseMethods.Add("getSelectedValues", new FindSelectedOptionProperties(this.elementFinder, "value"));
            this.seleneseMethods.Add("getSelectOptions", new GetSelectOptions(this.elementFinder));
            this.seleneseMethods.Add("getSpeed", new NoOp("0"));
            this.seleneseMethods.Add("getTable", new GetTable(this.elementFinder));
            this.seleneseMethods.Add("getText", new GetText(this.elementFinder));
            this.seleneseMethods.Add("getTitle", new GetTitle());
            this.seleneseMethods.Add("getValue", new GetValue(this.elementFinder));
            this.seleneseMethods.Add("getXpathCount", new GetXpathCount());
            this.seleneseMethods.Add("getCssCount", new GetCssCount());
            this.seleneseMethods.Add("goBack", new GoBack());
            this.seleneseMethods.Add("highlight", new Highlight(this.elementFinder));
            this.seleneseMethods.Add("isAlertPresent", new IsAlertPresent(this.alertOverride));
            this.seleneseMethods.Add("isChecked", new IsChecked(this.elementFinder));
            this.seleneseMethods.Add("isConfirmationPresent", new IsConfirmationPresent(this.alertOverride));
            this.seleneseMethods.Add("isCookiePresent", new IsCookiePresent());
            this.seleneseMethods.Add("isEditable", new IsEditable(this.elementFinder));
            this.seleneseMethods.Add("isElementPresent", new IsElementPresent(this.elementFinder));
            this.seleneseMethods.Add("isOrdered", new IsOrdered(this.elementFinder));
            this.seleneseMethods.Add("isSomethingSelected", new IsSomethingSelected());
            this.seleneseMethods.Add("isTextPresent", new IsTextPresent());
            this.seleneseMethods.Add("isVisible", new IsVisible(this.elementFinder));
            this.seleneseMethods.Add("keyDown", new KeyEvent(this.elementFinder, keyState, "doKeyDown"));
            this.seleneseMethods.Add("keyPress", new TypeKeys(this.alertOverride, this.elementFinder));
            this.seleneseMethods.Add("keyUp", new KeyEvent(this.elementFinder, keyState, "doKeyUp"));
            this.seleneseMethods.Add("metaKeyDown", new MetaKeyDown(keyState));
            this.seleneseMethods.Add("metaKeyUp", new MetaKeyUp(keyState));
            this.seleneseMethods.Add("mouseOver", new MouseEvent(this.elementFinder, "mouseover"));
            this.seleneseMethods.Add("mouseOut", new MouseEvent(this.elementFinder, "mouseout"));
            this.seleneseMethods.Add("mouseDown", new MouseEvent(this.elementFinder, "mousedown"));
            this.seleneseMethods.Add("mouseDownAt", new MouseEventAt(this.elementFinder, "mousedown"));
            this.seleneseMethods.Add("mouseMove", new MouseEvent(this.elementFinder, "mousemove"));
            this.seleneseMethods.Add("mouseMoveAt", new MouseEventAt(this.elementFinder, "mousemove"));
            this.seleneseMethods.Add("mouseUp", new MouseEvent(this.elementFinder, "mouseup"));
            this.seleneseMethods.Add("mouseUpAt", new MouseEventAt(this.elementFinder, "mouseup"));
            this.seleneseMethods.Add("open", new Open(this.baseUrl));
            this.seleneseMethods.Add("openWindow", new OpenWindow(new GetEval(this.mutator)));
            this.seleneseMethods.Add("refresh", new Refresh());
            this.seleneseMethods.Add("removeAllSelections", new RemoveAllSelections(this.elementFinder));
            this.seleneseMethods.Add("removeSelection", new RemoveSelection(this.elementFinder));
            this.seleneseMethods.Add("runScript", new RunScript(this.mutator));
            this.seleneseMethods.Add("select", new SelectOption(this.alertOverride, this.elementFinder));
            this.seleneseMethods.Add("selectFrame", new SelectFrame(windows));
            this.seleneseMethods.Add("selectWindow", new SelectWindow(windows));
            this.seleneseMethods.Add("setBrowserLogLevel", new NoOp(null));
            this.seleneseMethods.Add("setContext", new NoOp(null));
            this.seleneseMethods.Add("setSpeed", new NoOp(null));
            this.seleneseMethods.Add("setTimeout", new SetTimeout(this.timer));
            this.seleneseMethods.Add("shiftKeyDown", new ShiftKeyDown(keyState));
            this.seleneseMethods.Add("shiftKeyUp", new ShiftKeyUp(keyState));
            this.seleneseMethods.Add("submit", new Submit(this.alertOverride, this.elementFinder));
            this.seleneseMethods.Add("type", new Selenium.Internal.SeleniumEmulation.Type(this.alertOverride, this.elementFinder, keyState));
            this.seleneseMethods.Add("typeKeys", new TypeKeys(this.alertOverride, this.elementFinder));
            this.seleneseMethods.Add("uncheck", new Uncheck(this.elementFinder));
            this.seleneseMethods.Add("useXpathLibrary", new NoOp(null));
            this.seleneseMethods.Add("waitForCondition", new WaitForCondition(this.mutator));
            this.seleneseMethods.Add("waitForFrameToLoad", new NoOp(null));
            this.seleneseMethods.Add("waitForPageToLoad", new WaitForPageToLoad());
            this.seleneseMethods.Add("waitForPopUp", new WaitForPopup(windows));
            this.seleneseMethods.Add("windowFocus", new WindowFocus());
            this.seleneseMethods.Add("windowMaximize", new WindowMaximize());
        }
    }
}
