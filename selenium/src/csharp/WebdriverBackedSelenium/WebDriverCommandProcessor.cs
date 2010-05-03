
using System;
using System.Collections.Generic;
using Selenium.Internal.SeleniumEmulation;
using OpenQA.Selenium;

namespace Selenium
{
	/// <summary>
	/// Description of WebdriverCommandProcessor.
	/// </summary>
	public class WebDriverCommandProcessor : ICommandProcessor
	{
        IWebDriver driver;
        string baseUrl;
        Dictionary<String, SeleneseCommand> seleneseMethods = new Dictionary<string, SeleneseCommand>();
        ElementFinder elementFinder = new ElementFinder();
        SeleniumOptionSelector select;

		public WebDriverCommandProcessor(String baseUrl, IWebDriver baseDriver)
		{
            this.driver = baseDriver;
            this.baseUrl = baseUrl;
            select = new SeleniumOptionSelector(elementFinder);
		}
		
		public IWebDriver GetUnderlyingWebDriver() 
		{
			return this.driver;
		}

        public string DoCommand(string command, string[] args)
        {
            Object val = Execute(command, args);
            if (val == null)
            {
                return null;
            }

            return val.ToString();
        }

        private void PopulateSeleneseMethods()
        {
            JavaScriptLibrary javascriptLibrary = new JavaScriptLibrary();
            KeyState keyState = new KeyState();
            WindowSelector windows = new WindowSelector(driver);

            // Note the we use the names used by the CommandProcessor
            seleneseMethods.Add("addLocationStrategy", new AddLocationStrategy(elementFinder));
            seleneseMethods.Add("addSelection", new AddSelection(elementFinder, select));
            seleneseMethods.Add("altKeyDown", new AltKeyDown(keyState));
            seleneseMethods.Add("altKeyUp", new AltKeyUp(keyState));
            seleneseMethods.Add("assignId", new AssignId(javascriptLibrary, elementFinder));
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
            seleneseMethods.Add("fireEvent", new FireEvent(elementFinder, javascriptLibrary));
            seleneseMethods.Add("focus", new FireNamedEvent(elementFinder, javascriptLibrary, "focus"));
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
            seleneseMethods.Add("getElementIndex", new GetElementIndex(elementFinder, javascriptLibrary));
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
            seleneseMethods.Add("getTable", new GetTable(elementFinder, javascriptLibrary));
            seleneseMethods.Add("getText", new GetText(elementFinder));
            seleneseMethods.Add("getTitle", new GetTitle());
            seleneseMethods.Add("getValue", new GetValue(elementFinder));
            seleneseMethods.Add("getXpathCount", new GetXpathCount());
            seleneseMethods.Add("goBack", new GoBack());
            seleneseMethods.Add("highlight", new Highlight(elementFinder, javascriptLibrary));
            seleneseMethods.Add("isChecked", new IsChecked(elementFinder));
            seleneseMethods.Add("isCookiePresent", new IsCookiePresent());
            seleneseMethods.Add("isEditable", new IsEditable(elementFinder));
            seleneseMethods.Add("isElementPresent", new IsElementPresent(elementFinder));
            seleneseMethods.Add("isOrdered", new IsOrdered(elementFinder, javascriptLibrary));
            seleneseMethods.Add("isSomethingSelected", new IsSomethingSelected(select));
            seleneseMethods.Add("isTextPresent", new IsTextPresent(javascriptLibrary));
            seleneseMethods.Add("isVisible", new IsVisible(elementFinder));
            seleneseMethods.Add("keyDown", new KeyEvent(elementFinder, javascriptLibrary, keyState, "doKeyDown"));
            seleneseMethods.Add("keyPress", new TypeKeys(elementFinder));
            seleneseMethods.Add("keyUp", new KeyEvent(elementFinder, javascriptLibrary, keyState, "doKeyUp"));
            seleneseMethods.Add("metaKeyDown", new MetaKeyDown(keyState));
            seleneseMethods.Add("metaKeyUp", new MetaKeyUp(keyState));
            seleneseMethods.Add("mouseOver", new MouseEvent(elementFinder, javascriptLibrary, "mouseover"));
            seleneseMethods.Add("mouseOut", new MouseEvent(elementFinder, javascriptLibrary, "mouseout"));
            seleneseMethods.Add("mouseDown", new MouseEvent(elementFinder, javascriptLibrary, "mousedown"));
            seleneseMethods.Add("mouseDownAt", new MouseEventAt(elementFinder, javascriptLibrary, "mousedown"));
            seleneseMethods.Add("mouseMove", new MouseEvent(elementFinder, javascriptLibrary, "mousemove"));
            seleneseMethods.Add("mouseMoveAt", new MouseEventAt(elementFinder, javascriptLibrary, "mousemove"));
            seleneseMethods.Add("mouseUp", new MouseEvent(elementFinder, javascriptLibrary, "mouseup"));
            seleneseMethods.Add("mouseUpAt", new MouseEventAt(elementFinder, javascriptLibrary, "mouseup"));
            seleneseMethods.Add("open", new Open(baseUrl));
            seleneseMethods.Add("openWindow", new OpenWindow(new GetEval(baseUrl)));
            seleneseMethods.Add("refresh", new Refresh());
            seleneseMethods.Add("removeAllSelections", new RemoveAllSelections(elementFinder));
            seleneseMethods.Add("removeSelection", new RemoveSelection(elementFinder, select));
            seleneseMethods.Add("runScript", new RunScript(javascriptLibrary));
            seleneseMethods.Add("select", new SelectOption(select));
            seleneseMethods.Add("selectFrame", new SelectFrame(windows));
            seleneseMethods.Add("selectWindow", new SelectWindow(windows));
            seleneseMethods.Add("setBrowserLogLevel", new NoOp(null));
            seleneseMethods.Add("setContext", new NoOp(null));
            seleneseMethods.Add("setSpeed", new NoOp(null));
            //seleneseMethods.Add("setTimeout", new SetTimeout(timer));
            seleneseMethods.Add("shiftKeyDown", new ShiftKeyDown(keyState));
            seleneseMethods.Add("shiftKeyUp", new ShiftKeyUp(keyState));
            seleneseMethods.Add("submit", new Submit(elementFinder));
            seleneseMethods.Add("type", new Selenium.Internal.SeleniumEmulation.Type(javascriptLibrary, elementFinder, keyState));
            seleneseMethods.Add("typeKeys", new TypeKeys(elementFinder));
            seleneseMethods.Add("uncheck", new Uncheck(elementFinder));
            seleneseMethods.Add("useXpathLibrary", new NoOp(null));
            seleneseMethods.Add("waitForCondition", new WaitForCondition());
            seleneseMethods.Add("waitForFrameToLoad", new NoOp(null));
            seleneseMethods.Add("waitForPageToLoad", new WaitForPageToLoad());
            seleneseMethods.Add("waitForPopUp", new WaitForPopup(windows));
            seleneseMethods.Add("windowFocus", new WindowFocus(javascriptLibrary));
            //seleneseMethods.Add("windowMaximize", new WindowMaximize(javascriptLibrary));
        }

        private object Execute(string commandName, string[] args)
        {
            SeleneseCommand command;
            if (seleneseMethods.TryGetValue(commandName, out command) == false)
            {
                throw new NotSupportedException(commandName);
            }

            return command.Apply(driver, args);

            //return timer.run(new Callable<Object>() {
            //  public Object call() throws Exception {
            //    return command.apply(driver, args);
            //  }
            //});
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
	}
}
