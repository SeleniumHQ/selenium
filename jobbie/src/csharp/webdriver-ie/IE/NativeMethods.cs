using System;
using System.Runtime.InteropServices;
using System.Text;

namespace OpenQA.Selenium.IE
{
    /// <summary>
    /// Wrapper class for using InternetExplorerDriver.dll C++
    /// </summary>
    internal static class NativeMethods
    {
        #region Memory management functions
        [DllImport("InternetExplorerDriver")]
        internal static extern WebDriverResult wdeFreeElement(IntPtr handle);

        [DllImport("InternetExplorerDriver")]
        internal static extern WebDriverResult wdFreeElementCollection(IntPtr elementCollection, int index);

        [DllImport("InternetExplorerDriver")]
        internal static extern WebDriverResult wdFreeStringCollection(IntPtr elementCollection);

        [DllImport("InternetExplorerDriver")]
        internal static extern WebDriverResult wdFreeScriptArgs(IntPtr scriptArgs);

        [DllImport("InternetExplorerDriver")]
        internal static extern WebDriverResult wdFreeScriptResult(IntPtr scriptResult);
        #endregion

        #region WebDriver functions
        [DllImport("InternetExplorerDriver")]
        internal static extern WebDriverResult wdFreeDriver(IntPtr driver);

        [DllImport("InternetExplorerDriver")]
        internal static extern WebDriverResult wdClose(SafeInternetExplorerDriverHandle driver);

        [DllImport("InternetExplorerDriver")]
        internal static extern WebDriverResult wdNewDriverInstance(ref SafeInternetExplorerDriverHandle handle);

        [DllImport("InternetExplorerDriver", CharSet = CharSet.Unicode)]
        internal static extern WebDriverResult wdGet(SafeInternetExplorerDriverHandle handle, string url);

        [DllImport("InternetExplorerDriver")]
        internal static extern WebDriverResult wdGoBack(SafeInternetExplorerDriverHandle driver);

        [DllImport("InternetExplorerDriver")]
        internal static extern WebDriverResult wdGoForward(SafeInternetExplorerDriverHandle driver);

        [DllImport("InternetExplorerDriver")]
        internal static extern WebDriverResult wdRefresh(SafeInternetExplorerDriverHandle driver);

        [DllImport("InternetExplorerDriver", CharSet = CharSet.Unicode)]
        internal static extern WebDriverResult wdGetVisible(SafeInternetExplorerDriverHandle handle, ref int visible);

        [DllImport("InternetExplorerDriver", CharSet = CharSet.Unicode)]
        internal static extern WebDriverResult wdSetVisible(SafeInternetExplorerDriverHandle handle, int visible);
        
        [DllImport("InternetExplorerDriver", CharSet = CharSet.Unicode)]
        internal static extern WebDriverResult wdGetCurrentUrl(SafeInternetExplorerDriverHandle handle, ref SafeStringWrapperHandle result);

        [DllImport("InternetExplorerDriver", CharSet = CharSet.Unicode)]
        internal static extern WebDriverResult wdGetTitle(SafeInternetExplorerDriverHandle handle, ref SafeStringWrapperHandle result);

        [DllImport("InternetExplorerDriver")]
        internal static extern WebDriverResult wdGetPageSource(SafeInternetExplorerDriverHandle driver, ref SafeStringWrapperHandle wrapper);

        [DllImport("InternetExplorerDriver", CharSet = CharSet.Unicode)]
        internal static extern WebDriverResult wdGetCookies(SafeInternetExplorerDriverHandle handle, ref SafeStringWrapperHandle cookies);
 
        ////[DllImport("InternetExplorerDriver", CharSet = CharSet.Unicode)]
        ////internal static extern WebDriverResult wdAddCookie(SafeInternetExplorerDriverHandle handle, string cookie);

        [DllImport("InternetExplorerDriver")]
        internal static extern WebDriverResult wdSwitchToActiveElement(SafeInternetExplorerDriverHandle driver, ref SafeInternetExplorerWebElementHandle result);

        [DllImport("InternetExplorerDriver", CharSet = CharSet.Unicode)]
        internal static extern WebDriverResult wdSwitchToWindow(SafeInternetExplorerDriverHandle handle, string windowName);

        [DllImport("InternetExplorerDriver", CharSet = CharSet.Unicode)]
        internal static extern WebDriverResult wdSwitchToFrame(SafeInternetExplorerDriverHandle handle, string frameName);

        [DllImport("InternetExplorerDriver")]
        internal static extern WebDriverResult wdWaitForLoadToComplete(SafeInternetExplorerDriverHandle driver);

        [DllImport("InternetExplorerDriver")]
        internal static extern WebDriverResult wdGetAllWindowHandles(SafeInternetExplorerDriverHandle driver, ref SafeStringCollectionHandle handles);

        [DllImport("InternetExplorerDriver")]
        internal static extern WebDriverResult wdGetCurrentWindowHandle(SafeInternetExplorerDriverHandle driver, out SafeStringWrapperHandle handle);

        [DllImport("InternetExplorerDriver")]
        internal static extern WebDriverResult wdCaptureScreenshotAsBase64(SafeInternetExplorerDriverHandle driver, out SafeStringWrapperHandle handle);
        #endregion

        #region Element functions
        [DllImport("InternetExplorerDriver")]
        internal static extern WebDriverResult wdeClick(SafeInternetExplorerWebElementHandle wrapper);

        [DllImport("InternetExplorerDriver", CharSet = CharSet.Unicode)]
        internal static extern WebDriverResult wdeGetAttribute(SafeInternetExplorerDriverHandle driver, SafeInternetExplorerWebElementHandle wrapper, [MarshalAs(UnmanagedType.LPWStr)] string attributeName, ref SafeStringWrapperHandle result);

        [DllImport("InternetExplorerDriver")]
        internal static extern WebDriverResult wdeGetValueOfCssProperty(SafeInternetExplorerWebElementHandle handle, [MarshalAs(UnmanagedType.LPWStr)] string attributeName, ref SafeStringWrapperHandle result);

        [DllImport("InternetExplorerDriver", CharSet = CharSet.Unicode)]
        internal static extern WebDriverResult wdeGetText(SafeInternetExplorerWebElementHandle wrapper, ref SafeStringWrapperHandle result);

        [DllImport("InternetExplorerDriver")]
        internal static extern WebDriverResult wdeGetTagName(SafeInternetExplorerWebElementHandle wrapper, ref SafeStringWrapperHandle result);

        [DllImport("InternetExplorerDriver")]
        internal static extern WebDriverResult wdeIsSelected(SafeInternetExplorerWebElementHandle handle, ref int selected);

        [DllImport("InternetExplorerDriver")]
        internal static extern WebDriverResult wdeSetSelected(SafeInternetExplorerWebElementHandle handle);

        [DllImport("InternetExplorerDriver")]
        internal static extern WebDriverResult wdeToggle(SafeInternetExplorerWebElementHandle handle, ref int toggled);

        [DllImport("InternetExplorerDriver")]
        internal static extern WebDriverResult wdeIsEnabled(SafeInternetExplorerWebElementHandle handle, ref int enabled);

        [DllImport("InternetExplorerDriver")]
        internal static extern WebDriverResult wdeIsDisplayed(SafeInternetExplorerWebElementHandle handle, ref int displayed);

        [DllImport("InternetExplorerDriver", CharSet = CharSet.Unicode)]
        internal static extern WebDriverResult wdeSendKeys(SafeInternetExplorerWebElementHandle wrapper, [MarshalAs(UnmanagedType.LPWStr)] string text);

        [DllImport("InternetExplorerDriver")]
        internal static extern WebDriverResult wdeClear(SafeInternetExplorerWebElementHandle handle);

        [DllImport("InternetExplorerDriver")]
        internal static extern WebDriverResult wdeSubmit(SafeInternetExplorerWebElementHandle wrapper);

        [DllImport("InternetExplorerDriver")]
        internal static extern WebDriverResult wdeGetDetailsOnceScrolledOnToScreen(SafeInternetExplorerWebElementHandle element, ref IntPtr hwnd, ref int x, ref int y, ref int width, ref int height);

        [DllImport("InternetExplorerDriver")]
        internal static extern WebDriverResult wdeGetLocation(SafeInternetExplorerWebElementHandle element, ref int x, ref int y);

        [DllImport("InternetExplorerDriver")]
        internal static extern WebDriverResult wdeGetSize(SafeInternetExplorerWebElementHandle element, ref int width, ref int height);
        #endregion

        #region Element locating functions
        [DllImport("InternetExplorerDriver", CharSet = CharSet.Unicode)]
        internal static extern WebDriverResult wdFindElementById(SafeInternetExplorerDriverHandle driver, SafeInternetExplorerWebElementHandle element, [MarshalAs(UnmanagedType.LPWStr)] string id, ref SafeInternetExplorerWebElementHandle result);

        [DllImport("InternetExplorerDriver", CharSet = CharSet.Unicode)]
        internal static extern WebDriverResult wdFindElementsById(SafeInternetExplorerDriverHandle driver, SafeInternetExplorerWebElementHandle element, [MarshalAs(UnmanagedType.LPWStr)] string id, ref SafeWebElementCollectionHandle result);

        [DllImport("InternetExplorerDriver", CharSet = CharSet.Unicode)]
        internal static extern WebDriverResult wdFindElementByClassName(SafeInternetExplorerDriverHandle driver, SafeInternetExplorerWebElementHandle element, [MarshalAs(UnmanagedType.LPWStr)] string linkText, ref SafeInternetExplorerWebElementHandle result);

        [DllImport("InternetExplorerDriver", CharSet = CharSet.Unicode)]
        internal static extern WebDriverResult wdFindElementsByClassName(SafeInternetExplorerDriverHandle driver, SafeInternetExplorerWebElementHandle element, [MarshalAs(UnmanagedType.LPWStr)] string className, ref SafeWebElementCollectionHandle result);

        [DllImport("InternetExplorerDriver", CharSet = CharSet.Unicode)]
        internal static extern WebDriverResult wdFindElementByLinkText(SafeInternetExplorerDriverHandle driver, SafeInternetExplorerWebElementHandle element, [MarshalAs(UnmanagedType.LPWStr)] string linkText, ref SafeInternetExplorerWebElementHandle result);

        [DllImport("InternetExplorerDriver", CharSet = CharSet.Unicode)]
        internal static extern WebDriverResult wdFindElementsByLinkText(SafeInternetExplorerDriverHandle driver, SafeInternetExplorerWebElementHandle element, [MarshalAs(UnmanagedType.LPWStr)] string linkText, ref SafeWebElementCollectionHandle result);

        [DllImport("InternetExplorerDriver", CharSet = CharSet.Unicode)]
        internal static extern WebDriverResult wdFindElementByPartialLinkText(SafeInternetExplorerDriverHandle driver, SafeInternetExplorerWebElementHandle element, [MarshalAs(UnmanagedType.LPWStr)] string linkText, ref SafeInternetExplorerWebElementHandle result);

        [DllImport("InternetExplorerDriver", CharSet = CharSet.Unicode)]
        internal static extern WebDriverResult wdFindElementsByPartialLinkText(SafeInternetExplorerDriverHandle driver, SafeInternetExplorerWebElementHandle element, [MarshalAs(UnmanagedType.LPWStr)] string partialLinkText, ref SafeWebElementCollectionHandle result);

        [DllImport("InternetExplorerDriver", CharSet = CharSet.Unicode)]
        internal static extern WebDriverResult wdFindElementByName(SafeInternetExplorerDriverHandle driver, SafeInternetExplorerWebElementHandle element, [MarshalAs(UnmanagedType.LPWStr)] string name, ref SafeInternetExplorerWebElementHandle result);

        [DllImport("InternetExplorerDriver", CharSet = CharSet.Unicode)]
        internal static extern WebDriverResult wdFindElementsByName(SafeInternetExplorerDriverHandle driver, SafeInternetExplorerWebElementHandle element, [MarshalAs(UnmanagedType.LPWStr)] string name, ref SafeWebElementCollectionHandle result);

        [DllImport("InternetExplorerDriver", CharSet = CharSet.Unicode)]
        internal static extern WebDriverResult wdFindElementByTagName(SafeInternetExplorerDriverHandle driver, SafeInternetExplorerWebElementHandle element, [MarshalAs(UnmanagedType.LPWStr)] string linkText, ref SafeInternetExplorerWebElementHandle result);

        [DllImport("InternetExplorerDriver", CharSet = CharSet.Unicode)]
        internal static extern WebDriverResult wdFindElementsByTagName(SafeInternetExplorerDriverHandle driver, SafeInternetExplorerWebElementHandle element, [MarshalAs(UnmanagedType.LPWStr)] string tagName, ref SafeWebElementCollectionHandle result);

        [DllImport("InternetExplorerDriver", CharSet = CharSet.Unicode)]
        internal static extern WebDriverResult wdFindElementByXPath(SafeInternetExplorerDriverHandle driver, SafeInternetExplorerWebElementHandle element, [MarshalAs(UnmanagedType.LPWStr)] string xpath, ref SafeInternetExplorerWebElementHandle result);

        [DllImport("InternetExplorerDriver", CharSet = CharSet.Unicode)]
        internal static extern WebDriverResult wdFindElementsByXPath(SafeInternetExplorerDriverHandle driver, SafeInternetExplorerWebElementHandle element, [MarshalAs(UnmanagedType.LPWStr)] string xpath, ref SafeWebElementCollectionHandle result);
        #endregion

        #region JavaScript executing functions
        [DllImport("InternetExplorerDriver")]
        internal static extern WebDriverResult wdNewScriptArgs(ref SafeScriptArgsHandle scriptArgs, int maxLength);

        [DllImport("InternetExplorerDriver", CharSet = CharSet.Unicode)]
        internal static extern WebDriverResult wdAddStringScriptArg(SafeScriptArgsHandle scriptArgs, string arg);

        [DllImport("InternetExplorerDriver")]
        internal static extern WebDriverResult wdAddBooleanScriptArg(SafeScriptArgsHandle scriptArgs, int boolean);

        [DllImport("InternetExplorerDriver")]
        internal static extern WebDriverResult wdAddNumberScriptArg(SafeScriptArgsHandle scriptArgs, long param);

        [DllImport("InternetExplorerDriver")]
        internal static extern WebDriverResult wdAddDoubleScriptArg(SafeScriptArgsHandle scriptArgs, double param);

        [DllImport("InternetExplorerDriver")]
        internal static extern WebDriverResult wdAddElementScriptArg(SafeScriptArgsHandle scriptArgs, SafeInternetExplorerWebElementHandle handle);

        [DllImport("InternetExplorerDriver", CharSet = CharSet.Unicode)]
        internal static extern WebDriverResult wdExecuteScript(SafeInternetExplorerDriverHandle driver, string script, SafeScriptArgsHandle scriptArgs, ref SafeScriptResultHandle scriptRes);

        [DllImport("InternetExplorerDriver")]
        internal static extern WebDriverResult wdGetScriptResultType(SafeInternetExplorerDriverHandle driver, SafeScriptResultHandle scriptResult, out int type);

        [DllImport("InternetExplorerDriver", CharSet = CharSet.Unicode)]
        internal static extern WebDriverResult wdGetStringScriptResult(SafeScriptResultHandle scriptResult, ref SafeStringWrapperHandle resultString);

        [DllImport("InternetExplorerDriver")]
        internal static extern WebDriverResult wdGetNumberScriptResult(SafeScriptResultHandle scriptResult, out long resultNumber);

        [DllImport("InternetExplorerDriver")]
        internal static extern WebDriverResult wdGetDoubleScriptResult(SafeScriptResultHandle scriptResult, out double resultDouble);

        [DllImport("InternetExplorerDriver")]
        internal static extern WebDriverResult wdGetBooleanScriptResult(SafeScriptResultHandle scriptResult, out int resultNumber);

        [DllImport("InternetExplorerDriver")]
        internal static extern WebDriverResult wdGetElementScriptResult(SafeScriptResultHandle scriptResult, SafeInternetExplorerDriverHandle driver, out SafeInternetExplorerWebElementHandle value);

        [DllImport("InternetExplorerDriver")]
        internal static extern WebDriverResult wdGetArrayLengthScriptResult(SafeInternetExplorerDriverHandle driver, SafeScriptResultHandle scriptResult, out int arrayLength);

        [DllImport("InternetExplorerDriver")]
        internal static extern WebDriverResult wdGetArrayItemFromScriptResult(SafeInternetExplorerDriverHandle driver, SafeScriptResultHandle scriptResult, int itemIndex, out SafeScriptResultHandle item); 
        #endregion

        #region Element collection functions
        [DllImport("InternetExplorerDriver")]
        internal static extern WebDriverResult wdcGetElementCollectionLength(SafeWebElementCollectionHandle elementCollection, ref int count);

        [DllImport("InternetExplorerDriver")]
        internal static extern WebDriverResult wdcGetElementAtIndex(SafeWebElementCollectionHandle elementCollection, int index, ref SafeInternetExplorerWebElementHandle result);

        [DllImport("InternetExplorerDriver")]
        internal static extern WebDriverResult wdcGetStringCollectionLength(SafeStringCollectionHandle elementCollection, ref int count);

        [DllImport("InternetExplorerDriver")]
        internal static extern WebDriverResult wdcGetStringAtIndex(SafeStringCollectionHandle elementCollection, int index, ref SafeStringWrapperHandle result);
        #endregion

        #region String manipulation functions
        [DllImport("InternetExplorerDriver")]
        internal static extern WebDriverResult wdStringLength(SafeStringWrapperHandle handle, ref int length);

        [DllImport("InternetExplorerDriver")]
        internal static extern WebDriverResult wdFreeString(IntPtr driver);

        [DllImport("InternetExplorerDriver")]
        internal static extern WebDriverResult wdCopyString(SafeStringWrapperHandle handle, int length, [Out, MarshalAs(UnmanagedType.LPWStr)] StringBuilder res);
        #endregion

        #region Things that should be interactions
        [DllImport("InternetExplorerDriver")]
        internal static extern WebDriverResult wdeMouseDownAt(IntPtr hwnd, int windowX, int windowY);

        [DllImport("InternetExplorerDriver")]
        internal static extern WebDriverResult wdeMouseUpAt(IntPtr hwnd, int windowX, int windowY);

        [DllImport("InternetExplorerDriver")]
        internal static extern WebDriverResult wdeMouseMoveTo(IntPtr hwnd, int duration, int fromX, int fromY, int toX, int toY);
        #endregion
    }
}
