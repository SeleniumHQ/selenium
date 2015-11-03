using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace OpenQA.Selenium.Remote
{
    internal static class WebDriverError
    {
        public const string ElementNotSelectable = "element not selectable";
        public const string ElementNotVisible = "element not visible";
        public const string InvalidArgument = "invalid argument";
        public const string InvalidElementCoordinates = "invalid element coordinates";
        public const string InvalidElementState = "invalid element state";
        public const string InvalidSelector = "invalid selector";
        public const string InvalidSessionId = "invalid session id";
        public const string JavaScriptError = "javascript error";
        public const string MoveTargetOutOfBounds = "move target out of bounds";
        public const string NoSuchAlert = "no such alert";
        public const string NoSuchElement = "no such element";
        public const string NoSuchFrame = "no such frame";
        public const string NoSuchWindow = "no such window";
        public const string ScriptTimeout = "script timeout";
        public const string SessionNotCreated = "session not created";
        public const string StaleElementReference = "stale element reference";
        public const string Timeout = "timeout";
        public const string UnableToSetCookie = "unable to set cookie";
        public const string UnableToCaptureScreen = "unable to capture screen";
        public const string UnexpectedAlertOpen = "unexpected alert open";
        public const string UnknownCommand = "unknown command";
        public const string UnknownError = "unknown error";
        public const string UnknownMethod = "unknown method";
        public const string UnsupportedOperation = "unsupported operation";

        private static Dictionary<string, WebDriverResult> resultMap;

        public static WebDriverResult ResultFromError(string error)
        {
            if (resultMap == null)
            {
                InitializeResultMap();
            }

            if (!resultMap.ContainsKey(error))
            {
                error = UnsupportedOperation;
            }

            return resultMap[error];
        }

        private static void InitializeResultMap()
        {
            resultMap = new Dictionary<string, WebDriverResult>();
            resultMap[ElementNotSelectable] = WebDriverResult.ElementNotSelectable;
            resultMap[ElementNotVisible] = WebDriverResult.ElementNotDisplayed;
            resultMap[InvalidArgument] = WebDriverResult.IndexOutOfBounds;
            resultMap[InvalidElementCoordinates] = WebDriverResult.InvalidElementCoordinates;
            resultMap[InvalidElementState] = WebDriverResult.InvalidElementState;
            resultMap[InvalidSelector] = WebDriverResult.InvalidSelector;
            resultMap[InvalidSessionId] = WebDriverResult.NoSuchDriver;
            resultMap[JavaScriptError] = WebDriverResult.UnexpectedJavaScriptError;
            resultMap[MoveTargetOutOfBounds] = WebDriverResult.InvalidElementCoordinates;
            resultMap[NoSuchAlert] = WebDriverResult.NoAlertPresent;
            resultMap[NoSuchElement] = WebDriverResult.NoSuchElement;
            resultMap[NoSuchFrame] = WebDriverResult.NoSuchFrame;
            resultMap[NoSuchWindow] = WebDriverResult.NoSuchWindow;
            resultMap[ScriptTimeout] = WebDriverResult.AsyncScriptTimeout;
            resultMap[SessionNotCreated] = WebDriverResult.NoSuchDriver;
            resultMap[StaleElementReference] = WebDriverResult.ObsoleteElement;
            resultMap[Timeout] = WebDriverResult.Timeout;
            resultMap[UnableToSetCookie] = WebDriverResult.UnableToSetCookie;
            resultMap[UnableToCaptureScreen] = WebDriverResult.UnhandledError;
            resultMap[UnexpectedAlertOpen] = WebDriverResult.UnexpectedAlertOpen;
            resultMap[UnknownCommand] = WebDriverResult.UnknownCommand;
            resultMap[UnknownError] = WebDriverResult.UnhandledError;
            resultMap[UnknownMethod] = WebDriverResult.UnknownCommand;
            resultMap[UnsupportedOperation] = WebDriverResult.UnhandledError;
        }
    }
}
