using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace OpenQA.Selenium.Remote
{
    internal static class WebDriverError
    {
        public static readonly string ElementNotSelectable = "element not selectable";
        public static readonly string ElementNotVisible = "element not visible";
        public static readonly string InvalidArgument = "invalid argument";
        public static readonly string InvalidElementCoordinates = "invalid element coordinates";
        public static readonly string InvalidElementState = "invalid element state";
        public static readonly string InvalidSelector = "invalid selector";
        public static readonly string InvalidSessionId = "invalid session id";
        public static readonly string JavaScriptError = "javascript error";
        public static readonly string MoveTargetOutOfBounds = "move target out of bounds";
        public static readonly string NoSuchAlert = "no such alert";
        public static readonly string NoSuchElement = "no such element";
        public static readonly string NoSuchFrame = "no such frame";
        public static readonly string NoSuchWindow = "no such window";
        public static readonly string ScriptTimeout = "script timeout";
        public static readonly string SessionNotCreated = "session not created";
        public static readonly string StaleElementReference = "stale element reference";
        public static readonly string Timeout = "timeout";
        public static readonly string UnableToSetCookie = "unable to set cookie";
        public static readonly string UnableToCaptureScreen = "unable to capture screen";
        public static readonly string UnexpectedAlertOpen = "unexpected alert open";
        public static readonly string UnknownCommand = "unknown command";
        public static readonly string UnknownError = "unknown error";
        public static readonly string UnknownMethod = "unknown method";
        public static readonly string UnsupportedOperation = "unsupported operation";

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
