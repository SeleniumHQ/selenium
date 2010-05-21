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
using OpenQA.Selenium;
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
        private SeleniumOptionSelector select;
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
            this.driver = baseDriver;
            this.baseUrl = baseUrl;
            this.select = new SeleniumOptionSelector(elementFinder);
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
            object val = Execute(command, args);
            if (val == null)
            {
                return null;
            }

            return val.ToString();
        }
        
        public void SetExtensionJs(string extensionJs)
        {
            throw new NotImplementedException();
        }
        
        public void Start()
        {
            PopulateSeleneseMethods();
        }
        
        public void Stop()
        {
            driver.Quit();
        }
        
        public string GetString(string command, string[] args)
        {
            return (string)Execute(command, args);
        }
        
        public string[] GetStringArray(string command, string[] args)
        {
            throw new NotImplementedException();
        }
        
        public decimal GetNumber(string command, string[] args)
        {
            return (decimal)Execute(command, args);
        }
        
        public decimal[] GetNumberArray(string command, string[] args)
        {
            throw new NotImplementedException();
        }
        
        public bool GetBoolean(string command, string[] args)
        {
            return (bool)Execute(command, args);
        }
        
        public bool[] GetBooleanArray(string command, string[] args)
        {
            throw new NotImplementedException();
        }

        private object Execute(string commandName, string[] args)
        {
            SeleneseCommand command;
            if (!seleneseMethods.TryGetValue(commandName, out command))
            {
                throw new NotSupportedException(commandName);
            }

            return command.Apply(driver, args);
        }

        private void PopulateSeleneseMethods()
        {
            KeyState keyState = new KeyState();
            WindowSelector windows = new WindowSelector(driver);

            // Note the we use the names used by the CommandProcessor
            seleneseMethods.Add("addLocationStrategy", new AddLocationStrategy(elementFinder));
            seleneseMethods.Add("addSelection", new AddSelection(elementFinder, select));
            seleneseMethods.Add("altKeyDown", new AltKeyDown(keyState));
            seleneseMethods.Add("altKeyUp", new AltKeyUp(keyState));
            seleneseMethods.Add("assignId", new AssignId(elementFinder));
            seleneseMethods.Add("attachFile", new AttachFile(elementFinder));
            seleneseMethods.Add("captureScreenshotToString", new CaptureScreenshotToString());
            seleneseMethods.Add("click", new Click(elementFinder));
            seleneseMethods.Add("check", new Check(elementFinder));
            seleneseMethods.Add("close", new Close());
            seleneseMethods.Add("createCookie", new CreateCookie());
            seleneseMethods.Add("controlKeyDown", new ControlKeyDown(keyState));
            seleneseMethods.Add("controlKeyUp", new ControlKeyUp(keyState));
            seleneseMethods.Add("deleteAllVisibleCookies", new DeleteAllVisibleCookies());
            seleneseMethods.Add("deleteCookie", new DeleteCookie());
            seleneseMethods.Add("doubleClick", new DoubleClick(elementFinder));
            seleneseMethods.Add("dragdrop", new DragAndDrop(elementFinder));
            seleneseMethods.Add("dragAndDrop", new DragAndDrop(elementFinder));
            seleneseMethods.Add("dragAndDropToObject", new DragAndDropToObject(elementFinder));
            seleneseMethods.Add("fireEvent", new FireEvent(elementFinder));
            seleneseMethods.Add("focus", new FireNamedEvent(elementFinder, "focus"));
            seleneseMethods.Add("getAllButtons", new GetAllButtons());
            seleneseMethods.Add("getAllFields", new GetAllFields());
            seleneseMethods.Add("getAllLinks", new GetAllLinks());
            seleneseMethods.Add("getAllWindowTitles", new GetAllWindowTitles());
            seleneseMethods.Add("getAttribute", new GetAttribute(elementFinder));
            seleneseMethods.Add("getAttributeFromAllWindows", new GetAttributeFromAllWindows());
            seleneseMethods.Add("getBodyText", new GetBodyText());
            seleneseMethods.Add("getCookie", new GetCookie());
            seleneseMethods.Add("getCookieByName", new GetCookieByName());
            seleneseMethods.Add("getElementHeight", new GetElementHeight(elementFinder));
            seleneseMethods.Add("getElementIndex", new GetElementIndex(elementFinder));
            seleneseMethods.Add("getElementPositionLeft", new GetElementPositionLeft(elementFinder));
            seleneseMethods.Add("getElementPositionTop", new GetElementPositionTop(elementFinder));
            seleneseMethods.Add("getElementWidth", new GetElementWidth(elementFinder));
            seleneseMethods.Add("getEval", new GetEval(baseUrl));
            seleneseMethods.Add("getHtmlSource", new GetHtmlSource());
            seleneseMethods.Add("getLocation", new GetLocation());
            seleneseMethods.Add("getSelectedId", new FindFirstSelectedOptionProperty(select, SeleniumOptionSelector.Property.ID));
            seleneseMethods.Add("getSelectedIds", new FindSelectedOptionProperties(select, SeleniumOptionSelector.Property.ID));
            seleneseMethods.Add("getSelectedIndex", new FindFirstSelectedOptionProperty(select, SeleniumOptionSelector.Property.Index));
            seleneseMethods.Add("getSelectedIndexes", new FindSelectedOptionProperties(select, SeleniumOptionSelector.Property.Index));
            seleneseMethods.Add("getSelectedLabel", new FindFirstSelectedOptionProperty(select, SeleniumOptionSelector.Property.Text));
            seleneseMethods.Add("getSelectedLabels", new FindSelectedOptionProperties(select, SeleniumOptionSelector.Property.Text));
            seleneseMethods.Add("getSelectedValue", new FindFirstSelectedOptionProperty(select, SeleniumOptionSelector.Property.Value));
            seleneseMethods.Add("getSelectedValues", new FindSelectedOptionProperties(select, SeleniumOptionSelector.Property.Value));
            seleneseMethods.Add("getSelectOptions", new GetSelectOptions(select));
            seleneseMethods.Add("getSpeed", new NoOp("0"));
            seleneseMethods.Add("getTable", new GetTable(elementFinder));
            seleneseMethods.Add("getText", new GetText(elementFinder));
            seleneseMethods.Add("getTitle", new GetTitle());
            seleneseMethods.Add("getValue", new GetValue(elementFinder));
            seleneseMethods.Add("getXpathCount", new GetXpathCount());
            seleneseMethods.Add("goBack", new GoBack());
            seleneseMethods.Add("highlight", new Highlight(elementFinder));
            seleneseMethods.Add("isChecked", new IsChecked(elementFinder));
            seleneseMethods.Add("isCookiePresent", new IsCookiePresent());
            seleneseMethods.Add("isEditable", new IsEditable(elementFinder));
            seleneseMethods.Add("isElementPresent", new IsElementPresent(elementFinder));
            seleneseMethods.Add("isOrdered", new IsOrdered(elementFinder));
            seleneseMethods.Add("isSomethingSelected", new IsSomethingSelected(select));
            seleneseMethods.Add("isTextPresent", new IsTextPresent());
            seleneseMethods.Add("isVisible", new IsVisible(elementFinder));
            seleneseMethods.Add("keyDown", new KeyEvent(elementFinder, keyState, "doKeyDown"));
            seleneseMethods.Add("keyPress", new TypeKeys(elementFinder));
            seleneseMethods.Add("keyUp", new KeyEvent(elementFinder, keyState, "doKeyUp"));
            seleneseMethods.Add("metaKeyDown", new MetaKeyDown(keyState));
            seleneseMethods.Add("metaKeyUp", new MetaKeyUp(keyState));
            seleneseMethods.Add("mouseOver", new MouseEvent(elementFinder, "mouseover"));
            seleneseMethods.Add("mouseOut", new MouseEvent(elementFinder, "mouseout"));
            seleneseMethods.Add("mouseDown", new MouseEvent(elementFinder, "mousedown"));
            seleneseMethods.Add("mouseDownAt", new MouseEventAt(elementFinder, "mousedown"));
            seleneseMethods.Add("mouseMove", new MouseEvent(elementFinder, "mousemove"));
            seleneseMethods.Add("mouseMoveAt", new MouseEventAt(elementFinder, "mousemove"));
            seleneseMethods.Add("mouseUp", new MouseEvent(elementFinder, "mouseup"));
            seleneseMethods.Add("mouseUpAt", new MouseEventAt(elementFinder, "mouseup"));
            seleneseMethods.Add("open", new Open(baseUrl));
            seleneseMethods.Add("openWindow", new OpenWindow(new GetEval(baseUrl)));
            seleneseMethods.Add("refresh", new Refresh());
            seleneseMethods.Add("removeAllSelections", new RemoveAllSelections(elementFinder));
            seleneseMethods.Add("removeSelection", new RemoveSelection(elementFinder, select));
            seleneseMethods.Add("runScript", new RunScript());
            seleneseMethods.Add("select", new SelectOption(select));
            seleneseMethods.Add("selectFrame", new SelectFrame(windows));
            seleneseMethods.Add("selectWindow", new SelectWindow(windows));
            seleneseMethods.Add("setBrowserLogLevel", new NoOp(null));
            seleneseMethods.Add("setContext", new NoOp(null));
            seleneseMethods.Add("setSpeed", new NoOp(null));
            ////seleneseMethods.Add("setTimeout", new SetTimeout(timer));
            seleneseMethods.Add("shiftKeyDown", new ShiftKeyDown(keyState));
            seleneseMethods.Add("shiftKeyUp", new ShiftKeyUp(keyState));
            seleneseMethods.Add("submit", new Submit(elementFinder));
            seleneseMethods.Add("type", new Selenium.Internal.SeleniumEmulation.Type(elementFinder, keyState));
            seleneseMethods.Add("typeKeys", new TypeKeys(elementFinder));
            seleneseMethods.Add("uncheck", new Uncheck(elementFinder));
            seleneseMethods.Add("useXpathLibrary", new NoOp(null));
            seleneseMethods.Add("waitForCondition", new WaitForCondition());
            seleneseMethods.Add("waitForFrameToLoad", new NoOp(null));
            seleneseMethods.Add("waitForPageToLoad", new WaitForPageToLoad());
            seleneseMethods.Add("waitForPopUp", new WaitForPopup(windows));
            seleneseMethods.Add("windowFocus", new WindowFocus());
            seleneseMethods.Add("windowMaximize", new WindowMaximize());
        }
    }
}
