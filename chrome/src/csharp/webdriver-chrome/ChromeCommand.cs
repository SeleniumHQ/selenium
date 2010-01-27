using System;
using System.Collections.Generic;
using System.Text;
using OpenQA.Selenium.Remote;
using Newtonsoft.Json;

namespace OpenQA.Selenium.Chrome
{
    public class ChromeCommand : Command
    {
        private static Dictionary<DriverCommand, string> commandNameMap;
        private string[] commandParameterNames;

        public ChromeCommand(SessionId sessionId, Context context, DriverCommand commandName, object[] parameters)
            : base(sessionId, context, commandName, parameters)
        {
        }

        public string[] ParameterNames
        {
            get { return commandParameterNames; }
            set { commandParameterNames = value; }
        }

        [JsonProperty("request")]
        public string RequestValue
        {
            get { return GetCommandRequestValue(Name); }
        }

        private static string GetCommandRequestValue(DriverCommand commandValue)
        {
            if (commandNameMap == null)
            {
                InitializeCommandNameMap();
            }
            return commandNameMap[commandValue];
        }

        private static void InitializeCommandNameMap()
        {
            commandNameMap = new Dictionary<DriverCommand, string>();
            commandNameMap.Add(DriverCommand.NewSession, "newSession");
            commandNameMap.Add(DriverCommand.DeleteSession, "deleteSession");

            commandNameMap.Add(DriverCommand.Close, "close");
            commandNameMap.Add(DriverCommand.Quit, "quit");

            commandNameMap.Add(DriverCommand.Get, "get");
            commandNameMap.Add(DriverCommand.GoBack, "goBack");
            commandNameMap.Add(DriverCommand.GoForward, "goForward");
            commandNameMap.Add(DriverCommand.Refresh, "refresh");

            commandNameMap.Add(DriverCommand.AddCookie, "addCookie");
            commandNameMap.Add(DriverCommand.GetCookie, "getCookie");
            commandNameMap.Add(DriverCommand.GetAllCookies, "getCookies");
            commandNameMap.Add(DriverCommand.DeleteCookie, "deleteCookie");
            commandNameMap.Add(DriverCommand.DeleteAllCookies, "deleteAllCookies");

            commandNameMap.Add(DriverCommand.FindElement, "findElement");
            commandNameMap.Add(DriverCommand.FindElements, "findElements");
            commandNameMap.Add(DriverCommand.FindChildElement, "findChildElement");
            commandNameMap.Add(DriverCommand.FindChildElements, "findChildElements");

            commandNameMap.Add(DriverCommand.ClearElement, "clearElement");
            commandNameMap.Add(DriverCommand.ClickElement, "clickElement");
            commandNameMap.Add(DriverCommand.HoverOverElement, "hoverOverElement");
            commandNameMap.Add(DriverCommand.SendKeysToElement, "sendKeysToElement");
            commandNameMap.Add(DriverCommand.SubmitElement, "submitElement");
            commandNameMap.Add(DriverCommand.ToggleElement, "toggleElement");

            commandNameMap.Add(DriverCommand.GetCurrentWindowHandle, "getCurrentWindowHandle");
            commandNameMap.Add(DriverCommand.GetWindowHandles, "getWindowHandles");

            commandNameMap.Add(DriverCommand.SwitchToWindow, "switchToWindow");
            commandNameMap.Add(DriverCommand.SwitchToFrame, "switchToFrame");
            commandNameMap.Add(DriverCommand.SwitchToFrameByIndex, "switchToFrameByIndex");
            commandNameMap.Add(DriverCommand.SwitchToFrameByName, "switchToFrameByName");
            commandNameMap.Add(DriverCommand.SwitchToDefaultContent, "switchToDefaultContent");
            commandNameMap.Add(DriverCommand.GetActiveElement, "getActiveElement");

            commandNameMap.Add(DriverCommand.GetCurrentUrl, "getCurrentUrl");
            commandNameMap.Add(DriverCommand.GetPageSource, "getPageSource");
            commandNameMap.Add(DriverCommand.GetTitle, "getTitle");

            commandNameMap.Add(DriverCommand.ExecuteScript, "executeScript");

            commandNameMap.Add(DriverCommand.GetSpeed, "getSpeed");
            commandNameMap.Add(DriverCommand.SetSpeed, "setSpeed");

            commandNameMap.Add(DriverCommand.SetBrowserVisible, "setBrowserVisible");
            commandNameMap.Add(DriverCommand.IsBrowserVisible, "isBrowserVisible");

            commandNameMap.Add(DriverCommand.GetElementText, "getElementText");
            commandNameMap.Add(DriverCommand.GetElementValue, "getElementValue");
            commandNameMap.Add(DriverCommand.GetElementTagName, "getElementTagName");
            commandNameMap.Add(DriverCommand.SetElementSelected, "setElementSelected");
            commandNameMap.Add(DriverCommand.DragElement, "dragElement");
            commandNameMap.Add(DriverCommand.IsElementSelected, "isElementSelected");
            commandNameMap.Add(DriverCommand.IsElementEnabled, "isElementEnabled");
            commandNameMap.Add(DriverCommand.IsElementDisplayed, "isElementDisplayed");
            commandNameMap.Add(DriverCommand.GetElementLocation, "getElementLocation");
            commandNameMap.Add(DriverCommand.GetElementLocationOnceScrolledIntoView, "getElementLocationOnceScrolledIntoView");
            commandNameMap.Add(DriverCommand.GetElementSize, "getElementSize");
            commandNameMap.Add(DriverCommand.GetElementAttribute, "getElementAttribute");
            commandNameMap.Add(DriverCommand.GetElementValueOfCssProperty, "getElementValueOfCssProperty");
            commandNameMap.Add(DriverCommand.ElementEquals, "elementEquals");

            commandNameMap.Add(DriverCommand.Screenshot, "screenshot");
        }
    }
}
