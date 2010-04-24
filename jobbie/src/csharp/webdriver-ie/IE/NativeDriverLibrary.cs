using System;
using System.Collections.Generic;
using System.Globalization;
using System.IO;
using System.Reflection;
using System.Runtime.InteropServices;
using System.Security.Permissions;
using System.Text;
using OpenQA.Selenium;
using OpenQA.Selenium.IE;

namespace OpenQA.Selenium.IE
{
    /// <summary>
    /// Provides a wrapper for the native-code Internet Explorer driver library.
    /// </summary>
    internal class NativeDriverLibrary
    {
        #region Private constants
        private const string LibraryName = "InternetExplorerDriver.dll";
        private const string FreeElementFunctionName = "wdeFreeElement";
        private const string FreeElementCollectionFunctionName = "wdFreeElementCollection";
        private const string FreeStringCollectionFunctionName = "wdFreeStringCollection";
        private const string FreeScriptArgsFunctionName = "wdFreeScriptArgs";
        private const string FreeScriptResultFunctionName = "wdFreeScriptResult";
        private const string FreeDriverFunctionName = "wdFreeDriver";
        private const string FreeStringFunctionName = "wdFreeString";

        private const string CloseFunctionName = "wdClose";
        private const string NewDriverInstanceFunctionName = "wdNewDriverInstance";
        private const string ChangeUrlFunctionName = "wdGet";
        private const string GoBackFunctionName = "wdGoBack";
        private const string GoForwardFunctionName = "wdGoForward";
        private const string RefreshFunctionName = "wdRefresh";
        private const string IsBrowserVisibleFunctionName = "wdGetVisible";
        private const string SetBrowserVisibleFunctionName = "wdSetVisible";
        private const string GetCurrentUrlFunctionName = "wdGetCurrentUrl";
        private const string GetTitleFunctionName = "wdGetTitle";
        private const string GetPageSourceFunctionName = "wdGetPageSource";
        private const string GetAllCookiesFunctionName = "wdGetCookies";
        private const string AddCookieFunctionName = "wdAddCookie";
        private const string SwitchToActiveElementFunctionName = "wdSwitchToActiveElement";
        private const string SwitchToWindowFunctionName = "wdSwitchToWindow";
        private const string SwitchToFrameFunctionName = "wdSwitchToFrame";
        private const string WaitForLoadToCompleteFunctionName = "wdWaitForLoadToComplete";
        private const string GetAllWindowHandlesFunctionName = "wdGetAllWindowHandles";
        private const string GetCurrentWindowHandleFunctionName = "wdGetCurrentWindowHandle";
        private const string CaptureScreenshotFunctionName = "wdCaptureScreenshotAsBase64";
        private const string SetImplicitWaitTimeoutFunctionName = "wdSetImplicitWaitTimeout";

        private const string ClickElementFunctionName = "wdeClick";
        private const string GetElementAttributeFunctionName = "wdeGetAttribute";
        private const string GetValueOfCssPropertyFunctionName = "wdeGetValueOfCssProperty";
        private const string GetElementTextFunctionName = "wdeGetText";
        private const string GetElementTagNameFunctionName = "wdeGetTagName";
        private const string GetElementSelectedFunctionName = "wdeIsSelected";
        private const string SetElementSelectedFunctionName = "wdeSetSelected";
        private const string ToggleElementFunctionName = "wdeToggle";
        private const string GetElementEnabledFunctionName = "wdeIsEnabled";
        private const string GetElementDisplayedFunctionName = "wdeIsDisplayed";
        private const string SendKeysToElementFunctionName = "wdeSendKeys";
        private const string ClearElementFunctionName = "wdeClear";
        private const string SubmitElementFunctionName = "wdeSubmit";
        private const string GetElementDetailsOnceScrolledOnToScreenFunctionName = "wdeGetDetailsOnceScrolledOnToScreen";
        private const string GetElementLocationFunctionName = "wdeGetLocation";
        private const string GetElementSizeFunctionName = "wdeGetSize";

        private const string FindElementByIdFunctionName = "wdFindElementById";
        private const string FindElementsByIdFunctionName = "wdFindElementsById";
        private const string FindElementByClassNameFunctionName = "wdFindElementByClassName";
        private const string FindElementsByClassNameFunctionName = "wdFindElementsByClassName";
        private const string FindElementByLinkTextFunctionName = "wdFindElementByLinkText";
        private const string FindElementsByLinkTextFunctionName = "wdFindElementsByLinkText";
        private const string FindElementByPartialLinkTextFunctionName = "wdFindElementByPartialLinkText";
        private const string FindElementsByPartialLinkTextFunctionName = "wdFindElementsByPartialLinkText";
        private const string FindElementByNameFunctionName = "wdFindElementByName";
        private const string FindElementsByNameFunctionName = "wdFindElementsByName";
        private const string FindElementByTagNameFunctionName = "wdFindElementByTagName";
        private const string FindElementsByTagNameFunctionName = "wdFindElementsByTagName";
        private const string FindElementByXPathFunctionName = "wdFindElementByXPath";
        private const string FindElementsByXPathFunctionName = "wdFindElementsByXPath";

        private const string NewScriptArgsFunctionName = "wdNewScriptArgs";
        private const string AddStringScriptArgFunctionName = "wdAddStringScriptArg";
        private const string AddBooleanScriptArgFunctionName = "wdAddBooleanScriptArg";
        private const string AddNumberScriptArgFunctionName = "wdAddNumberScriptArg";
        private const string AddDoubleScriptArgFunctionName = "wdAddDoubleScriptArg";
        private const string AddElementScriptArgFunctionName = "wdAddElementScriptArg";
        private const string ExecuteScriptFunctionName = "wdExecuteScript";
        private const string GetScriptResultTypeFunctionName = "wdGetScriptResultType";
        private const string GetStringScriptResultFunctionName = "wdGetStringScriptResult";
        private const string GetNumberScriptResultFunctionName = "wdGetNumberScriptResult";
        private const string GetDoubleScriptResultFunctionName = "wdGetDoubleScriptResult";
        private const string GetBooleanScriptResultFunctionName = "wdGetBooleanScriptResult";
        private const string GetElementScriptResultFunctionName = "wdGetElementScriptResult";
        private const string GetArrayLengthScriptResultFunctionName = "wdGetArrayLengthScriptResult";
        private const string GetArrayItemFromScriptResultFunctionName = "wdGetArrayItemFromScriptResult";

        private const string GetElementCollectionLengthFunctionName = "wdcGetElementCollectionLength";
        private const string GetElementAtIndexFunctionName = "wdcGetElementAtIndex";
        private const string GetStringCollectionLengthFunctionName = "wdcGetStringCollectionLength";
        private const string GetStringAtIndexFunctionName = "wdcGetStringAtIndex";

        private const string StringLengthFunctionName = "wdStringLength";
        private const string CopyStringFunctionName = "wdCopyString";

        private const string MouseDownAtFunctionName = "wdeMouseDownAt";
        private const string MouseUpAtFunctionName = "wdeMouseUpAt";
        private const string MouseMoveToFunctionName = "wdeMouseMoveTo";
        #endregion

        #region Private member variables
        private static NativeDriverLibrary libraryInstance;
        private static object lockObject = new object();
        private static Random tempFileGenerator = new Random();

        private IntPtr nativeLibraryHandle = IntPtr.Zero;
        #endregion

        #region Constructor/Destructor
        /// <summary>
        /// Prevents a default instance of the <see cref="NativeDriverLibrary"/> class from being created.
        /// </summary>
        /// <remarks>This is a singleton class, so it does not require instantiation by consumers. They
        /// should use the Instance property instead.</remarks>
        private NativeDriverLibrary()
        {
            string nativeLibraryPath = GetNativeLibraryPath();
            nativeLibraryHandle = NativeMethods.LoadLibrary(nativeLibraryPath);
            int errorCode = Marshal.GetLastWin32Error();
            if (nativeLibraryHandle == IntPtr.Zero)
            {
                throw new WebDriverException(string.Format(CultureInfo.InvariantCulture, "An error (code: {0}) occured while attempting to load the native code library", errorCode));
            }
        }
        #endregion

        #region Private delegates
        private delegate WebDriverResult MemoryFunction(IntPtr handle);

        private delegate WebDriverResult IntParameterMemoryFunction(IntPtr handle, int parameter);

        private delegate WebDriverResult DriverFunction(SafeInternetExplorerDriverHandle driverHandle);

        private delegate WebDriverResult DriverReturningFunction(ref SafeInternetExplorerDriverHandle driverHandle);

        private delegate WebDriverResult StringParameterDriverFunction(SafeInternetExplorerDriverHandle driverHandle, [MarshalAs(UnmanagedType.LPTStr)] string parameter);

        private delegate WebDriverResult StringReturningDriverFunction(SafeInternetExplorerDriverHandle driverHandle, ref SafeStringWrapperHandle result);

        private delegate WebDriverResult StringCollectionReturningDriverFunction(SafeInternetExplorerDriverHandle driverHandle, ref SafeStringCollectionHandle result);

        private delegate WebDriverResult IntParameterDriverFunction(SafeInternetExplorerDriverHandle driverHandle, int parameter);

        private delegate WebDriverResult IntReturningDriverFunction(SafeInternetExplorerDriverHandle driverHandle, ref int result);

        private delegate WebDriverResult ElementReturningDriverFunction(SafeInternetExplorerDriverHandle driverHandle, ref SafeInternetExplorerWebElementHandle result);

        private delegate WebDriverResult ElementFunction(SafeInternetExplorerWebElementHandle elementHandle);

        private delegate WebDriverResult StringParameterElementFunction(SafeInternetExplorerWebElementHandle elementHandle, [MarshalAs(UnmanagedType.LPTStr)]string parameter);

        private delegate WebDriverResult IntReturningElementFunction(SafeInternetExplorerWebElementHandle elementHandle, ref int result);

        private delegate WebDriverResult StringReturningElementFunction(SafeInternetExplorerWebElementHandle elementHandle, ref SafeStringWrapperHandle result);

        private delegate WebDriverResult CoordinateReturningElementFunction(SafeInternetExplorerWebElementHandle elementHandle, ref int horizontalCoordinate, ref int verticalCoordinate);

        private delegate WebDriverResult ExtentsReturningElementFunction(SafeInternetExplorerWebElementHandle elementHandle, ref IntPtr hwnd, ref int x, ref int y, ref int width, ref int height);

        private delegate WebDriverResult GetElementAttributeFunction(SafeInternetExplorerDriverHandle driverHandle, SafeInternetExplorerWebElementHandle elementHandle, [MarshalAs(UnmanagedType.LPTStr)] string attributeName, ref SafeStringWrapperHandle result);

        private delegate WebDriverResult CssPropertyValueElementFunction(SafeInternetExplorerWebElementHandle elementHandle, [MarshalAs(UnmanagedType.LPTStr)] string propertyName, ref SafeStringWrapperHandle result);

        private delegate WebDriverResult ElementFindingFunction(SafeInternetExplorerDriverHandle driverHandle, SafeInternetExplorerWebElementHandle elementHandle, [MarshalAs(UnmanagedType.LPTStr)] string findCriteria, ref SafeInternetExplorerWebElementHandle result);

        private delegate WebDriverResult ElementCollectionFindingFunction(SafeInternetExplorerDriverHandle driverHandle, SafeInternetExplorerWebElementHandle elementHandle, [MarshalAs(UnmanagedType.LPTStr)] string findCriteria, ref SafeWebElementCollectionHandle result);

        private delegate WebDriverResult ScriptArgsReturningFunction(ref SafeScriptArgsHandle scriptArgsHandle, int maxLength);

        private delegate WebDriverResult StringParameterScriptArgsFunction(SafeScriptArgsHandle scriptArgsHandle, [MarshalAs(UnmanagedType.LPTStr)] string argument);

        private delegate WebDriverResult BooleanParameterScriptArgsFunction(SafeScriptArgsHandle scriptArgsHandle, int argument);

        private delegate WebDriverResult NumberParameterScriptArgsFunction(SafeScriptArgsHandle scriptArgsHandle, long argument);

        private delegate WebDriverResult DoubleParameterScriptArgsFunction(SafeScriptArgsHandle scriptArgsHandle, double argument);

        private delegate WebDriverResult ElementParameterScriptArgsFunction(SafeScriptArgsHandle scriptArgsHandle, SafeInternetExplorerWebElementHandle elementHandle);

        private delegate WebDriverResult ExecuteScriptFunction(SafeInternetExplorerDriverHandle driverHandle, [MarshalAs(UnmanagedType.LPTStr)] string script, SafeScriptArgsHandle scriptArgsHandle, ref SafeScriptResultHandle result);

        private delegate WebDriverResult GetScriptResultTypeFunction(SafeInternetExplorerDriverHandle driverHandle, SafeScriptResultHandle scriptResultHandle, out int result);

        private delegate WebDriverResult StringReturningScriptResultFunction(SafeScriptResultHandle scriptResultHandle, ref SafeStringWrapperHandle result);

        private delegate WebDriverResult NumberReturningScriptResultFunction(SafeScriptResultHandle scriptResultHandle, out long result);

        private delegate WebDriverResult DoubleReturningScriptResultFunction(SafeScriptResultHandle scriptResultHandle, out double result);

        private delegate WebDriverResult BooleanReturningScriptResultFunction(SafeScriptResultHandle scriptResultHandle, out int result);

        private delegate WebDriverResult ElementReturningScriptResultFunction(SafeScriptResultHandle scriptResultHandle, SafeInternetExplorerDriverHandle driverHandle, out SafeInternetExplorerWebElementHandle result);

        private delegate WebDriverResult ArrayLengthReturningScriptResultFunction(SafeInternetExplorerDriverHandle driverHandle, SafeScriptResultHandle scriptResultHandle, out int result);

        private delegate WebDriverResult ArrayItemReturningScriptResultFunction(SafeInternetExplorerDriverHandle driverHandle, SafeScriptResultHandle scriptResultHandle, int itemIndex, out SafeScriptResultHandle result);

        private delegate WebDriverResult GetElementCollectionLengthFunction(SafeWebElementCollectionHandle elementCollection, ref int count);

        private delegate WebDriverResult GetElementAtIndexFunction(SafeWebElementCollectionHandle elementCollection, int index, ref SafeInternetExplorerWebElementHandle result);

        private delegate WebDriverResult GetStringCollectionLengthFunction(SafeStringCollectionHandle elementCollection, ref int count);

        private delegate WebDriverResult GetStringAtIndexFunction(SafeStringCollectionHandle elementCollection, int index, ref SafeStringWrapperHandle result);

        private delegate WebDriverResult CopyStringFunction(SafeStringWrapperHandle stringHandle, int length, [Out, MarshalAs(UnmanagedType.LPTStr)] StringBuilder result);

        private delegate WebDriverResult StringLengthFunction(SafeStringWrapperHandle stringHandle, ref int length);

        private delegate WebDriverResult WindowMouseFunction(IntPtr windowHandle, int x, int y);

        private delegate WebDriverResult WindowMouseMoveFunction(IntPtr windowHandle, int duration, int fromX, int fromY, int toX, int toY);
        #endregion

        #region Singleton instance property
        /// <summary>
        /// Gets the singleton instance of the <see cref="NativeDriverLibrary"/> class.
        /// </summary>
        internal static NativeDriverLibrary Instance
        {
            get
            {
                lock (lockObject)
                {
                    if (libraryInstance == null)
                    {
                        libraryInstance = new NativeDriverLibrary();
                    }

                    return libraryInstance;
                }
            }
        }
        #endregion

        #region Memory management functions
        /// <summary>
        /// Releases all memory associated with an <see cref="InternetExplorerDriver"/> instance.
        /// </summary>
        /// <param name="driverHandle">A pointer to the driver instance.</param>
        /// <returns>A <see cref="WebDriverResult"/> value indicating success or failure.</returns>
        internal WebDriverResult FreeDriver(IntPtr driverHandle)
        {
            IntPtr functionPointer = NativeMethods.GetProcAddress(nativeLibraryHandle, FreeDriverFunctionName);
            MemoryFunction freeDriverFunction = Marshal.GetDelegateForFunctionPointer(functionPointer, typeof(MemoryFunction)) as MemoryFunction;
            WebDriverResult result = freeDriverFunction(driverHandle);
            return result;
        }

        /// <summary>
        /// Releases all memory associated with an <see cref="InternetExplorerWebElement"/> instance.
        /// </summary>
        /// <param name="elementHandle">A pointer to the web element instance.</param>
        /// <returns>A <see cref="WebDriverResult"/> value indicating success or failure.</returns>
        internal WebDriverResult FreeElement(IntPtr elementHandle)
        {
            IntPtr functionPointer = NativeMethods.GetProcAddress(nativeLibraryHandle, FreeElementFunctionName);
            MemoryFunction freeElementFunction = Marshal.GetDelegateForFunctionPointer(functionPointer, typeof(MemoryFunction)) as MemoryFunction;
            WebDriverResult result = freeElementFunction(elementHandle);
            return result;
        }

        /// <summary>
        /// Releases all memory associated with an <see cref="InternetExplorerWebElementCollection"/> instance.
        /// </summary>
        /// <param name="elementCollectionHandle">A pointer to the web element collection instance.</param>
        /// <param name="freeElements">An integer value indicating whether or not to free the elements contained within the collection.</param>
        /// <returns>A <see cref="WebDriverResult"/> value indicating success or failure.</returns>
        internal WebDriverResult FreeElementCollection(IntPtr elementCollectionHandle, int freeElements)
        {
            IntPtr functionPointer = NativeMethods.GetProcAddress(nativeLibraryHandle, FreeElementCollectionFunctionName);
            IntParameterMemoryFunction freeElementCollectionFunction = Marshal.GetDelegateForFunctionPointer(functionPointer, typeof(IntParameterMemoryFunction)) as IntParameterMemoryFunction;
            WebDriverResult result = freeElementCollectionFunction(elementCollectionHandle, freeElements);
            return result;
        }

        /// <summary>
        /// Releases all memory associated with a <see cref="StringCollection"/> instance.
        /// </summary>
        /// <param name="stringCollectionHandle">A pointer to the string collection instance.</param>
        /// <returns>A <see cref="WebDriverResult"/> value indicating success or failure.</returns>
        internal WebDriverResult FreeStringCollection(IntPtr stringCollectionHandle)
        {
            IntPtr functionPointer = NativeMethods.GetProcAddress(nativeLibraryHandle, FreeStringCollectionFunctionName);
            MemoryFunction freeStringCollectionFunction = Marshal.GetDelegateForFunctionPointer(functionPointer, typeof(MemoryFunction)) as MemoryFunction;
            WebDriverResult result = freeStringCollectionFunction(stringCollectionHandle);
            return result;
        }

        /// <summary>
        /// Releases all memory associated with a set of JavaScript arguments.
        /// </summary>
        /// <param name="scriptArgsHandle">A pointer to the script argument collection instance.</param>
        /// <returns>A <see cref="WebDriverResult"/> value indicating success or failure.</returns>
        internal WebDriverResult FreeScriptArgs(IntPtr scriptArgsHandle)
        {
            IntPtr functionPointer = NativeMethods.GetProcAddress(nativeLibraryHandle, FreeScriptArgsFunctionName);
            MemoryFunction freeScriptArgsFunction = Marshal.GetDelegateForFunctionPointer(functionPointer, typeof(MemoryFunction)) as MemoryFunction;
            WebDriverResult result = freeScriptArgsFunction(scriptArgsHandle);
            return result;
        }

        /// <summary>
        /// Releases all memory associated with a JavaScript result.
        /// </summary>
        /// <param name="scriptResultHandle">A pointer to the result instance.</param>
        /// <returns>A <see cref="WebDriverResult"/> value indicating success or failure.</returns>
        internal WebDriverResult FreeScriptResult(IntPtr scriptResultHandle)
        {
            IntPtr functionPointer = NativeMethods.GetProcAddress(nativeLibraryHandle, FreeScriptResultFunctionName);
            MemoryFunction freeScriptResultFunction = Marshal.GetDelegateForFunctionPointer(functionPointer, typeof(MemoryFunction)) as MemoryFunction;
            WebDriverResult result = freeScriptResultFunction(scriptResultHandle);
            return result;
        }

        /// <summary>
        /// Releases all memory associated with a string.
        /// </summary>
        /// <param name="stringHandle">A pointer to the string.</param>
        /// <returns>A <see cref="WebDriverResult"/> value indicating success or failure.</returns>
        internal WebDriverResult FreeString(IntPtr stringHandle)
        {
            IntPtr functionPointer = NativeMethods.GetProcAddress(nativeLibraryHandle, FreeStringFunctionName);
            MemoryFunction freeStringFunction = Marshal.GetDelegateForFunctionPointer(functionPointer, typeof(MemoryFunction)) as MemoryFunction;
            WebDriverResult result = freeStringFunction(stringHandle);
            return result;
        }
        #endregion

        #region WebDriver functions
        /// <summary>
        /// Closes the current driver window.
        /// </summary>
        /// <param name="driverHandle">A handle to the instance of the <see cref="InternetExplorerDriver"/> class.</param>
        /// <returns>A <see cref="WebDriverResult"/> value indicating success or failure.</returns>
        internal WebDriverResult Close(SafeInternetExplorerDriverHandle driverHandle)
        {
            IntPtr functionPointer = NativeMethods.GetProcAddress(nativeLibraryHandle, CloseFunctionName);
            DriverFunction closeFunction = Marshal.GetDelegateForFunctionPointer(functionPointer, typeof(DriverFunction)) as DriverFunction;
            WebDriverResult result = closeFunction(driverHandle);
            return result;
        }

        /// <summary>
        /// Creates a new instance of the <see cref="InternetExplorerDriver"/>.
        /// </summary>
        /// <param name="driverHandle">A handle to the instance of the <see cref="InternetExplorerDriver"/> class.</param>
        /// <returns>A <see cref="WebDriverResult"/> value indicating success or failure.</returns>
        internal WebDriverResult NewDriverInstance(ref SafeInternetExplorerDriverHandle driverHandle)
        {
            IntPtr functionPointer = NativeMethods.GetProcAddress(nativeLibraryHandle, NewDriverInstanceFunctionName);
            DriverReturningFunction newDriverInstanceFunction = Marshal.GetDelegateForFunctionPointer(functionPointer, typeof(DriverReturningFunction)) as DriverReturningFunction;
            WebDriverResult result = newDriverInstanceFunction(ref driverHandle);
            return result;
        }

        /// <summary>
        /// Navigates to a new URL.
        /// </summary>
        /// <param name="driverHandle">A handle to the instance of the <see cref="InternetExplorerDriver"/> class.</param>
        /// <param name="url">The URL to which to navigate.</param>
        /// <returns>A <see cref="WebDriverResult"/> value indicating success or failure.</returns>
        internal WebDriverResult ChangeCurrentUrl(SafeInternetExplorerDriverHandle driverHandle, string url)
        {
            IntPtr functionPointer = NativeMethods.GetProcAddress(nativeLibraryHandle, ChangeUrlFunctionName);
            StringParameterDriverFunction changeCurrentUrlFunction = Marshal.GetDelegateForFunctionPointer(functionPointer, typeof(StringParameterDriverFunction)) as StringParameterDriverFunction;
            WebDriverResult result = changeCurrentUrlFunction(driverHandle, url);
            return result;
        }

        /// <summary>
        /// Navigates back one entry in the browser history.
        /// </summary>
        /// <param name="driverHandle">A handle to the instance of the <see cref="InternetExplorerDriver"/> class.</param>
        /// <returns>A <see cref="WebDriverResult"/> value indicating success or failure.</returns>
        internal WebDriverResult GoBack(SafeInternetExplorerDriverHandle driverHandle)
        {
            IntPtr functionPointer = NativeMethods.GetProcAddress(nativeLibraryHandle, GoBackFunctionName);
            DriverFunction navigateBackFunction = Marshal.GetDelegateForFunctionPointer(functionPointer, typeof(DriverFunction)) as DriverFunction;
            WebDriverResult result = navigateBackFunction(driverHandle);
            return result;
        }

        /// <summary>
        /// Navigates forward one entry in the browser history.
        /// </summary>
        /// <param name="driverHandle">A handle to the instance of the <see cref="InternetExplorerDriver"/> class.</param>
        /// <returns>A <see cref="WebDriverResult"/> value indicating success or failure.</returns>
        internal WebDriverResult GoForward(SafeInternetExplorerDriverHandle driverHandle)
        {
            IntPtr functionPointer = NativeMethods.GetProcAddress(nativeLibraryHandle, GoForwardFunctionName);
            DriverFunction navigateForwardFunction = Marshal.GetDelegateForFunctionPointer(functionPointer, typeof(DriverFunction)) as DriverFunction;
            WebDriverResult result = navigateForwardFunction(driverHandle);
            return result;
        }

        /// <summary>
        /// Refreshes the browser page.
        /// </summary>
        /// <param name="driverHandle">A handle to the instance of the <see cref="InternetExplorerDriver"/> class.</param>
        /// <returns>A <see cref="WebDriverResult"/> value indicating success or failure.</returns>
        internal WebDriverResult Refresh(SafeInternetExplorerDriverHandle driverHandle)
        {
            IntPtr functionPointer = NativeMethods.GetProcAddress(nativeLibraryHandle, RefreshFunctionName);
            DriverFunction refreshFunction = Marshal.GetDelegateForFunctionPointer(functionPointer, typeof(DriverFunction)) as DriverFunction;
            WebDriverResult result = refreshFunction(driverHandle);
            return result;
        }

        /// <summary>
        /// Gets a value indicating whether the browser is visible.
        /// </summary>
        /// <param name="driverHandle">A handle to the instance of the <see cref="InternetExplorerDriver"/> class.</param>
        /// <param name="visible">An returned integer value indicating whether the browser is visible.</param>
        /// <returns>A <see cref="WebDriverResult"/> value indicating success or failure.</returns>
        internal WebDriverResult GetVisible(SafeInternetExplorerDriverHandle driverHandle, ref int visible)
        {
            IntPtr functionPointer = NativeMethods.GetProcAddress(nativeLibraryHandle, IsBrowserVisibleFunctionName);
            IntReturningDriverFunction isBrowserVisibleFunction = Marshal.GetDelegateForFunctionPointer(functionPointer, typeof(IntReturningDriverFunction)) as IntReturningDriverFunction;
            WebDriverResult result = isBrowserVisibleFunction(driverHandle, ref visible);
            return result;
        }

        /// <summary>
        /// Sets the visibility of the browser.
        /// </summary>
        /// <param name="driverHandle">A handle to the instance of the <see cref="InternetExplorerDriver"/> class.</param>
        /// <param name="visible">An integer value indicating whether the browser should be visible.</param>
        /// <returns>A <see cref="WebDriverResult"/> value indicating success or failure.</returns>
        internal WebDriverResult SetVisible(SafeInternetExplorerDriverHandle driverHandle, int visible)
        {
            IntPtr functionPointer = NativeMethods.GetProcAddress(nativeLibraryHandle, SetBrowserVisibleFunctionName);
            IntParameterDriverFunction setBrowserVisibleFunction = Marshal.GetDelegateForFunctionPointer(functionPointer, typeof(IntParameterDriverFunction)) as IntParameterDriverFunction;
            WebDriverResult result = setBrowserVisibleFunction(driverHandle, visible);
            return result;
        }

        /// <summary>
        /// Gets the current URL the browser is browsing.
        /// </summary>
        /// <param name="driverHandle">A handle to the instance of the <see cref="InternetExplorerDriver"/> class.</param>
        /// <param name="currentUrlWrapperHandle">A pointer to a string containing the URL.</param>
        /// <returns>A <see cref="WebDriverResult"/> value indicating success or failure.</returns>
        internal WebDriverResult GetCurrentUrl(SafeInternetExplorerDriverHandle driverHandle, ref SafeStringWrapperHandle currentUrlWrapperHandle)
        {
            IntPtr functionPointer = NativeMethods.GetProcAddress(nativeLibraryHandle, GetCurrentUrlFunctionName);
            StringReturningDriverFunction getCurrentUrlFunction = Marshal.GetDelegateForFunctionPointer(functionPointer, typeof(StringReturningDriverFunction)) as StringReturningDriverFunction;
            WebDriverResult result = getCurrentUrlFunction(driverHandle, ref currentUrlWrapperHandle);
            return result;
        }

        /// <summary>
        /// Gets the title of the current page.
        /// </summary>
        /// <param name="driverHandle">A handle to the instance of the <see cref="InternetExplorerDriver"/> class.</param>
        /// <param name="titleWrapperHandle">A pointer to a string containing the title.</param>
        /// <returns>A <see cref="WebDriverResult"/> value indicating success or failure.</returns>
        internal WebDriverResult GetTitle(SafeInternetExplorerDriverHandle driverHandle, ref SafeStringWrapperHandle titleWrapperHandle)
        {
            IntPtr functionPointer = NativeMethods.GetProcAddress(nativeLibraryHandle, GetTitleFunctionName);
            StringReturningDriverFunction getTitleFunction = Marshal.GetDelegateForFunctionPointer(functionPointer, typeof(StringReturningDriverFunction)) as StringReturningDriverFunction;
            WebDriverResult result = getTitleFunction(driverHandle, ref titleWrapperHandle);
            return result;
        }

        /// <summary>
        /// Gets the HTML source of the current page.
        /// </summary>
        /// <param name="driverHandle">A handle to the instance of the <see cref="InternetExplorerDriver"/> class.</param>
        /// <param name="pageSourceWrapperHandle">A pointer to a string containing the HTML source.</param>
        /// <returns>A <see cref="WebDriverResult"/> value indicating success or failure.</returns>
        internal WebDriverResult GetPageSource(SafeInternetExplorerDriverHandle driverHandle, ref SafeStringWrapperHandle pageSourceWrapperHandle)
        {
            IntPtr functionPointer = NativeMethods.GetProcAddress(nativeLibraryHandle, GetPageSourceFunctionName);
            StringReturningDriverFunction getPageSourceFunction = Marshal.GetDelegateForFunctionPointer(functionPointer, typeof(StringReturningDriverFunction)) as StringReturningDriverFunction;
            WebDriverResult result = getPageSourceFunction(driverHandle, ref pageSourceWrapperHandle);
            return result;
        }

        /// <summary>
        /// Gets the cookies set for the current page.
        /// </summary>
        /// <param name="driverHandle">A handle to the instance of the <see cref="InternetExplorerDriver"/> class.</param>
        /// <param name="cookiesWrapperHandle">A pointer to a string containing the cookie strings.</param>
        /// <returns>A <see cref="WebDriverResult"/> value indicating success or failure.</returns>
        internal WebDriverResult GetCookies(SafeInternetExplorerDriverHandle driverHandle, ref SafeStringWrapperHandle cookiesWrapperHandle)
        {
            IntPtr functionPointer = NativeMethods.GetProcAddress(nativeLibraryHandle, GetAllCookiesFunctionName);
            StringReturningDriverFunction getCookiesFunction = Marshal.GetDelegateForFunctionPointer(functionPointer, typeof(StringReturningDriverFunction)) as StringReturningDriverFunction;
            WebDriverResult result = getCookiesFunction(driverHandle, ref cookiesWrapperHandle);
            return result;
        }

        /// <summary>
        /// Switches focus to the active element.
        /// </summary>
        /// <param name="driverHandle">A handle to the instance of the <see cref="InternetExplorerDriver"/> class.</param>
        /// <param name="elementHandle">A handle to the instance of the <see cref="InternetExplorerWebElement"/> class.</param>
        /// <returns>A <see cref="WebDriverResult"/> value indicating success or failure.</returns>
        internal WebDriverResult SwitchToActiveElement(SafeInternetExplorerDriverHandle driverHandle, ref SafeInternetExplorerWebElementHandle elementHandle)
        {
            IntPtr functionPointer = NativeMethods.GetProcAddress(nativeLibraryHandle, SwitchToActiveElementFunctionName);
            ElementReturningDriverFunction switchToActiveElementFunction = Marshal.GetDelegateForFunctionPointer(functionPointer, typeof(ElementReturningDriverFunction)) as ElementReturningDriverFunction;
            WebDriverResult result = switchToActiveElementFunction(driverHandle, ref elementHandle);
            return result;
        }

        /// <summary>
        /// Switches focus to the specified window.
        /// </summary>
        /// <param name="driverHandle">A handle to the instance of the <see cref="InternetExplorerDriver"/> class.</param>
        /// <param name="windowName">The identifying string of the window to switch to.</param>
        /// <returns>A <see cref="WebDriverResult"/> value indicating success or failure.</returns>
        internal WebDriverResult SwitchToWindow(SafeInternetExplorerDriverHandle driverHandle, string windowName)
        {
            IntPtr functionPointer = NativeMethods.GetProcAddress(nativeLibraryHandle, SwitchToWindowFunctionName);
            StringParameterDriverFunction switchToWindowFunction = Marshal.GetDelegateForFunctionPointer(functionPointer, typeof(StringParameterDriverFunction)) as StringParameterDriverFunction;
            WebDriverResult result = switchToWindowFunction(driverHandle, windowName);
            return result;
        }

        /// <summary>
        /// Switches focus to the specified frame.
        /// </summary>
        /// <param name="driverHandle">A handle to the instance of the <see cref="InternetExplorerDriver"/> class.</param>
        /// <param name="frameName">The identifying string of the frame to switch to.</param>
        /// <returns>A <see cref="WebDriverResult"/> value indicating success or failure.</returns>
        internal WebDriverResult SwitchToFrame(SafeInternetExplorerDriverHandle driverHandle, string frameName)
        {
            IntPtr functionPointer = NativeMethods.GetProcAddress(nativeLibraryHandle, SwitchToFrameFunctionName);
            StringParameterDriverFunction switchToFrameFunction = Marshal.GetDelegateForFunctionPointer(functionPointer, typeof(StringParameterDriverFunction)) as StringParameterDriverFunction;
            WebDriverResult result = switchToFrameFunction(driverHandle, frameName);
            return result;
        }

        /// <summary>
        /// Waits for the page load to complete.
        /// </summary>
        /// <param name="driverHandle">A handle to the instance of the <see cref="InternetExplorerDriver"/> class.</param>
        /// <returns>A <see cref="WebDriverResult"/> value indicating success or failure.</returns>
        internal WebDriverResult WaitForLoadToComplete(SafeInternetExplorerDriverHandle driverHandle)
        {
            IntPtr functionPointer = NativeMethods.GetProcAddress(nativeLibraryHandle, WaitForLoadToCompleteFunctionName);
            DriverFunction waitForLoadToCompleteFunction = Marshal.GetDelegateForFunctionPointer(functionPointer, typeof(DriverFunction)) as DriverFunction;
            WebDriverResult result = waitForLoadToCompleteFunction(driverHandle);
            return result;
        }

        /// <summary>
        /// Gets all window handles known to this driver.
        /// </summary>
        /// <param name="driverHandle">A handle to the instance of the <see cref="InternetExplorerDriver"/> class.</param>
        /// <param name="windowHandlesCollectionHandle">A pointer to a string collection containing the window handles.</param>
        /// <returns>A <see cref="WebDriverResult"/> value indicating success or failure.</returns>
        internal WebDriverResult GetAllWindowHandles(SafeInternetExplorerDriverHandle driverHandle, ref SafeStringCollectionHandle windowHandlesCollectionHandle)
        {
            IntPtr functionPointer = NativeMethods.GetProcAddress(nativeLibraryHandle, GetAllWindowHandlesFunctionName);
            StringCollectionReturningDriverFunction getAllWindowHandlesFunction = Marshal.GetDelegateForFunctionPointer(functionPointer, typeof(StringCollectionReturningDriverFunction)) as StringCollectionReturningDriverFunction;
            WebDriverResult result = getAllWindowHandlesFunction(driverHandle, ref windowHandlesCollectionHandle);
            return result;
        }

        /// <summary>
        /// Gets the identifying handle string of the current window.
        /// </summary>
        /// <param name="driverHandle">A handle to the instance of the <see cref="InternetExplorerDriver"/> class.</param>
        /// <param name="handleWrapperHandle">A pointer to a string containing the window .</param>
        /// <returns>A <see cref="WebDriverResult"/> value indicating success or failure.</returns>
        internal WebDriverResult GetCurrentWindowHandle(SafeInternetExplorerDriverHandle driverHandle, ref SafeStringWrapperHandle handleWrapperHandle)
        {
            IntPtr functionPointer = NativeMethods.GetProcAddress(nativeLibraryHandle, GetCurrentWindowHandleFunctionName);
            StringReturningDriverFunction getCurrentWindowHandleFunction = Marshal.GetDelegateForFunctionPointer(functionPointer, typeof(StringReturningDriverFunction)) as StringReturningDriverFunction;
            WebDriverResult result = getCurrentWindowHandleFunction(driverHandle, ref handleWrapperHandle);
            return result;
        }

        /// <summary>
        /// Gets a screenshot of the browser window as a base64 encoded string.
        /// </summary>
        /// <param name="driverHandle">A handle to the instance of the <see cref="InternetExplorerDriver"/> class.</param>
        /// <param name="screenshotWrapperHandle">A pointer to a string containing the screenshot.</param>
        /// <returns>A <see cref="WebDriverResult"/> value indicating success or failure.</returns>
        internal WebDriverResult CaptureScreenshotAsBase64(SafeInternetExplorerDriverHandle driverHandle, ref SafeStringWrapperHandle screenshotWrapperHandle)
        {
            IntPtr functionPointer = NativeMethods.GetProcAddress(nativeLibraryHandle, CaptureScreenshotFunctionName);
            StringReturningDriverFunction captureScreenshotFunction = Marshal.GetDelegateForFunctionPointer(functionPointer, typeof(StringReturningDriverFunction)) as StringReturningDriverFunction;
            WebDriverResult result = captureScreenshotFunction(driverHandle, ref screenshotWrapperHandle);
            return result;
        }

        /// <summary>
        /// Sets the timeout used for implicitly waiting for an element to appear on the page.
        /// </summary>
        /// <param name="driverHandle">A handle to the instance of the <see cref="InternetExplorerDriver"/> class.</param>
        /// <param name="timeoutInMillis">The amount of time, in milliseconds, before returning that an element was not found.</param>
        /// <returns>A <see cref="WebDriverResult"/> value indicating success or failure.</returns>
        internal WebDriverResult SetImplicitWaitTimeout(SafeInternetExplorerDriverHandle driverHandle, int timeoutInMillis)
        {
            IntPtr functionPointer = NativeMethods.GetProcAddress(nativeLibraryHandle, SetImplicitWaitTimeoutFunctionName);
            IntParameterDriverFunction setImplicitWaitTimeoutFunction  = Marshal.GetDelegateForFunctionPointer(functionPointer, typeof(IntParameterDriverFunction)) as IntParameterDriverFunction;
            WebDriverResult result = setImplicitWaitTimeoutFunction(driverHandle, timeoutInMillis);
            return result;
        }
        #endregion

        #region Element functions
        /// <summary>
        /// Clicks an element.
        /// </summary>
        /// <param name="elementHandle">A handle to the instance of the <see cref="InternetExplorerWebElement"/> class.</param>
        /// <returns>A <see cref="WebDriverResult"/> value indicating success or failure.</returns>
        internal WebDriverResult ClickElement(SafeInternetExplorerWebElementHandle elementHandle)
        {
            IntPtr functionPointer = NativeMethods.GetProcAddress(nativeLibraryHandle, ClickElementFunctionName);
            ElementFunction clickElementFunction = Marshal.GetDelegateForFunctionPointer(functionPointer, typeof(ElementFunction)) as ElementFunction;
            WebDriverResult result = clickElementFunction(elementHandle);
            return result;
        }

        /// <summary>
        /// Gets an attribute of the specified element.
        /// </summary>
        /// <param name="driverHandle">A handle to the instance of the <see cref="InternetExplorerDriver"/> class.</param>
        /// <param name="elementHandle">A handle to the instance of the <see cref="InternetExplorerWebElement"/> class.</param>
        /// <param name="attributeName">The name of the attribute.</param>
        /// <param name="attributeValueWrapperHandle">A pointer to a string containing the attribute value.</param>
        /// <returns>A <see cref="WebDriverResult"/> value indicating success or failure.</returns>
        internal WebDriverResult GetElementAttribute(SafeInternetExplorerDriverHandle driverHandle, SafeInternetExplorerWebElementHandle elementHandle, string attributeName, ref SafeStringWrapperHandle attributeValueWrapperHandle)
        {
            IntPtr functionPointer = NativeMethods.GetProcAddress(nativeLibraryHandle, GetElementAttributeFunctionName);
            GetElementAttributeFunction getAttributeFunction = Marshal.GetDelegateForFunctionPointer(functionPointer, typeof(GetElementAttributeFunction)) as GetElementAttributeFunction;
            WebDriverResult result = getAttributeFunction(driverHandle, elementHandle, attributeName, ref attributeValueWrapperHandle);
            return result;
        }

        /// <summary>
        /// Gets a value of a CSS property for the element.
        /// </summary>
        /// <param name="elementHandle">A handle to the instance of the <see cref="InternetExplorerWebElement"/> class.</param>
        /// <param name="propertyName">The name of the property.</param>
        /// <param name="propertyValueWrapperHandle">A pointer to a string containing the property value.</param>
        /// <returns>A <see cref="WebDriverResult"/> value indicating success or failure.</returns>
        internal WebDriverResult GetElementValueOfCssProperty(SafeInternetExplorerWebElementHandle elementHandle, string propertyName, ref SafeStringWrapperHandle propertyValueWrapperHandle)
        {
            IntPtr functionPointer = NativeMethods.GetProcAddress(nativeLibraryHandle, GetValueOfCssPropertyFunctionName);
            CssPropertyValueElementFunction getCssPropertyValueFunction = Marshal.GetDelegateForFunctionPointer(functionPointer, typeof(CssPropertyValueElementFunction)) as CssPropertyValueElementFunction;
            WebDriverResult result = getCssPropertyValueFunction(elementHandle, propertyName, ref propertyValueWrapperHandle);
            return result;
        }

        /// <summary>
        /// Gets a text of the element.
        /// </summary>
        /// <param name="elementHandle">A handle to the instance of the <see cref="InternetExplorerWebElement"/> class.</param>
        /// <param name="textWrapperHandle">A pointer to a string containing the text.</param>
        /// <returns>A <see cref="WebDriverResult"/> value indicating success or failure.</returns>
        internal WebDriverResult GetElementText(SafeInternetExplorerWebElementHandle elementHandle, ref SafeStringWrapperHandle textWrapperHandle)
        {
            IntPtr functionPointer = NativeMethods.GetProcAddress(nativeLibraryHandle, GetElementTextFunctionName);
            StringReturningElementFunction getElementTextFunction = Marshal.GetDelegateForFunctionPointer(functionPointer, typeof(StringReturningElementFunction)) as StringReturningElementFunction;
            WebDriverResult result = getElementTextFunction(elementHandle, ref textWrapperHandle);
            return result;
        }

        /// <summary>
        /// Gets the tag name of the element.
        /// </summary>
        /// <param name="elementHandle">A handle to the instance of the <see cref="InternetExplorerWebElement"/> class.</param>
        /// <param name="tagNameWrapperHandle">A pointer to a string containing the tag name.</param>
        /// <returns>A <see cref="WebDriverResult"/> value indicating success or failure.</returns>
        internal WebDriverResult GetElementTagName(SafeInternetExplorerWebElementHandle elementHandle, ref SafeStringWrapperHandle tagNameWrapperHandle)
        {
            IntPtr functionPointer = NativeMethods.GetProcAddress(nativeLibraryHandle, GetElementTagNameFunctionName);
            StringReturningElementFunction getElementTagNameFunction = Marshal.GetDelegateForFunctionPointer(functionPointer, typeof(StringReturningElementFunction)) as StringReturningElementFunction;
            WebDriverResult result = getElementTagNameFunction(elementHandle, ref tagNameWrapperHandle);
            return result;
        }

        /// <summary>
        /// Gets a value indicating whether the element is selected.
        /// </summary>
        /// <param name="elementHandle">A handle to the instance of the <see cref="InternetExplorerWebElement"/> class.</param>
        /// <param name="selected">A value determining if the element is selected..</param>
        /// <returns>A <see cref="WebDriverResult"/> value indicating success or failure.</returns>
        internal WebDriverResult IsElementSelected(SafeInternetExplorerWebElementHandle elementHandle, ref int selected)
        {
            IntPtr functionPointer = NativeMethods.GetProcAddress(nativeLibraryHandle, GetElementSelectedFunctionName);
            IntReturningElementFunction getElementSelectedFunction = Marshal.GetDelegateForFunctionPointer(functionPointer, typeof(IntReturningElementFunction)) as IntReturningElementFunction;
            WebDriverResult result = getElementSelectedFunction(elementHandle, ref selected);
            return result;
        }

        /// <summary>
        /// Selects an element.
        /// </summary>
        /// <param name="elementHandle">A handle to the instance of the <see cref="InternetExplorerWebElement"/> class.</param>
        /// <returns>A <see cref="WebDriverResult"/> value indicating success or failure.</returns>
        internal WebDriverResult SetElementSelected(SafeInternetExplorerWebElementHandle elementHandle)
        {
            IntPtr functionPointer = NativeMethods.GetProcAddress(nativeLibraryHandle, SetElementSelectedFunctionName);
            ElementFunction setElementSelectedFunction = Marshal.GetDelegateForFunctionPointer(functionPointer, typeof(ElementFunction)) as ElementFunction;
            WebDriverResult result = setElementSelectedFunction(elementHandle);
            return result;
        }

        /// <summary>
        /// Toggles an element.
        /// </summary>
        /// <param name="elementHandle">A handle to the instance of the <see cref="InternetExplorerWebElement"/> class.</param>
        /// <param name="toggled">A value representing the toggled state of the element.</param>
        /// <returns>A <see cref="WebDriverResult"/> value indicating success or failure.</returns>
        internal WebDriverResult ToggleElement(SafeInternetExplorerWebElementHandle elementHandle, ref int toggled)
        {
            IntPtr functionPointer = NativeMethods.GetProcAddress(nativeLibraryHandle, ToggleElementFunctionName);
            IntReturningElementFunction toggleElementFunction = Marshal.GetDelegateForFunctionPointer(functionPointer, typeof(IntReturningElementFunction)) as IntReturningElementFunction;
            WebDriverResult result = toggleElementFunction(elementHandle, ref toggled);
            return result;
        }

        /// <summary>
        /// Gets a value indicating if the element is enabled.
        /// </summary>
        /// <param name="elementHandle">A handle to the instance of the <see cref="InternetExplorerWebElement"/> class.</param>
        /// <param name="enabled">A value representing the enabled state of the element.</param>
        /// <returns>A <see cref="WebDriverResult"/> value indicating success or failure.</returns>
        internal WebDriverResult IsElementEnabled(SafeInternetExplorerWebElementHandle elementHandle, ref int enabled)
        {
            IntPtr functionPointer = NativeMethods.GetProcAddress(nativeLibraryHandle, GetElementEnabledFunctionName);
            IntReturningElementFunction getElementEnabledFunction = Marshal.GetDelegateForFunctionPointer(functionPointer, typeof(IntReturningElementFunction)) as IntReturningElementFunction;
            WebDriverResult result = getElementEnabledFunction(elementHandle, ref enabled);
            return result;
        }

        /// <summary>
        /// Gets a value indicating if the element is displayed.
        /// </summary>
        /// <param name="elementHandle">A handle to the instance of the <see cref="InternetExplorerWebElement"/> class.</param>
        /// <param name="displayed">A value representing the displayed state of the element.</param>
        /// <returns>A <see cref="WebDriverResult"/> value indicating success or failure.</returns>
        internal WebDriverResult IsElementDisplayed(SafeInternetExplorerWebElementHandle elementHandle, ref int displayed)
        {
            IntPtr functionPointer = NativeMethods.GetProcAddress(nativeLibraryHandle, GetElementDisplayedFunctionName);
            IntReturningElementFunction getElementDisplayedFunction = Marshal.GetDelegateForFunctionPointer(functionPointer, typeof(IntReturningElementFunction)) as IntReturningElementFunction;
            WebDriverResult result = getElementDisplayedFunction(elementHandle, ref displayed);
            return result;
        }

        /// <summary>
        /// Sends keystrokes to an element.
        /// </summary>
        /// <param name="elementHandle">A handle to the instance of the <see cref="InternetExplorerWebElement"/> class.</param>
        /// <param name="keysToSend">The keystrokes to send to the element.</param>
        /// <returns>A <see cref="WebDriverResult"/> value indicating success or failure.</returns>
        internal WebDriverResult SendKeysToElement(SafeInternetExplorerWebElementHandle elementHandle, string keysToSend)
        {
            IntPtr functionPointer = NativeMethods.GetProcAddress(nativeLibraryHandle, SendKeysToElementFunctionName);
            StringParameterElementFunction sendKeysToElementFunction = Marshal.GetDelegateForFunctionPointer(functionPointer, typeof(StringParameterElementFunction)) as StringParameterElementFunction;
            WebDriverResult result = sendKeysToElementFunction(elementHandle, keysToSend);
            return result;
        }

        /// <summary>
        /// Clears an element.
        /// </summary>
        /// <param name="elementHandle">A handle to the instance of the <see cref="InternetExplorerWebElement"/> class.</param>
        /// <returns>A <see cref="WebDriverResult"/> value indicating success or failure.</returns>
        internal WebDriverResult ClearElement(SafeInternetExplorerWebElementHandle elementHandle)
        {
            IntPtr functionPointer = NativeMethods.GetProcAddress(nativeLibraryHandle, ClearElementFunctionName);
            ElementFunction clearElementFunction = Marshal.GetDelegateForFunctionPointer(functionPointer, typeof(ElementFunction)) as ElementFunction;
            WebDriverResult result = clearElementFunction(elementHandle);
            return result;
        }

        /// <summary>
        /// Submits an element.
        /// </summary>
        /// <param name="elementHandle">A handle to the instance of the <see cref="InternetExplorerWebElement"/> class.</param>
        /// <returns>A <see cref="WebDriverResult"/> value indicating success or failure.</returns>
        internal WebDriverResult SubmitElement(SafeInternetExplorerWebElementHandle elementHandle)
        {
            IntPtr functionPointer = NativeMethods.GetProcAddress(nativeLibraryHandle, SubmitElementFunctionName);
            ElementFunction submitElementFunction = Marshal.GetDelegateForFunctionPointer(functionPointer, typeof(ElementFunction)) as ElementFunction;
            WebDriverResult result = submitElementFunction(elementHandle);
            return result;
        }

        /// <summary>
        /// Gets the details of an element once scrolled onto the screen.
        /// </summary>
        /// <param name="elementHandle">A handle to the instance of the <see cref="InternetExplorerWebElement"/> class.</param>
        /// <param name="hwnd">The window handle of the browser.</param>
        /// <param name="x">The coordinate of the left side of the element.</param>
        /// <param name="y">The coordinate of the top of the element.</param>
        /// <param name="width">The width of the element.</param>
        /// <param name="height">The height of the element.</param>
        /// <returns>A <see cref="WebDriverResult"/> value indicating success or failure.</returns>
        internal WebDriverResult GetElementDetailsOnceScrolledOnToScreen(SafeInternetExplorerWebElementHandle elementHandle, ref IntPtr hwnd, ref int x, ref int y, ref int width, ref int height)
        {
            IntPtr functionPointer = NativeMethods.GetProcAddress(nativeLibraryHandle, GetElementDetailsOnceScrolledOnToScreenFunctionName);
            ExtentsReturningElementFunction getElementDetailsFunction = Marshal.GetDelegateForFunctionPointer(functionPointer, typeof(ExtentsReturningElementFunction)) as ExtentsReturningElementFunction;
            WebDriverResult result = getElementDetailsFunction(elementHandle, ref hwnd, ref x, ref y, ref width, ref height);
            return result;
        }

        /// <summary>
        /// Gets the location of the element.
        /// </summary>
        /// <param name="elementHandle">A handle to the instance of the <see cref="InternetExplorerWebElement"/> class.</param>
        /// <param name="x">The coordinate of the left side of the element.</param>
        /// <param name="y">The coordinate of the top of the element.</param>
        /// <returns>A <see cref="WebDriverResult"/> value indicating success or failure.</returns>
        internal WebDriverResult GetElementLocation(SafeInternetExplorerWebElementHandle elementHandle, ref int x, ref int y)
        {
            IntPtr functionPointer = NativeMethods.GetProcAddress(nativeLibraryHandle, GetElementLocationFunctionName);
            CoordinateReturningElementFunction getElementLocationFunction = Marshal.GetDelegateForFunctionPointer(functionPointer, typeof(CoordinateReturningElementFunction)) as CoordinateReturningElementFunction;
            WebDriverResult result = getElementLocationFunction(elementHandle, ref x, ref y);
            return result;
        }

        /// <summary>
        /// Gets the size of an element.
        /// </summary>
        /// <param name="elementHandle">A handle to the instance of the <see cref="InternetExplorerWebElement"/> class.</param>
        /// <param name="width">The width of the element.</param>
        /// <param name="height">The height of the element.</param>
        /// <returns>A <see cref="WebDriverResult"/> value indicating success or failure.</returns>
        internal WebDriverResult GetElementSize(SafeInternetExplorerWebElementHandle elementHandle, ref int width, ref int height)
        {
            IntPtr functionPointer = NativeMethods.GetProcAddress(nativeLibraryHandle, GetElementSizeFunctionName);
            CoordinateReturningElementFunction getElementSizeFunction = Marshal.GetDelegateForFunctionPointer(functionPointer, typeof(CoordinateReturningElementFunction)) as CoordinateReturningElementFunction;
            WebDriverResult result = getElementSizeFunction(elementHandle, ref width, ref height);
            return result;
        }
        #endregion

        #region Element locating functions
        /// <summary>
        /// Finds the first element on the page meeting the specified criteria.
        /// </summary>
        /// <param name="driverHandle">A handle to the instance of the <see cref="InternetExplorerDriver"/> class.</param>
        /// <param name="elementHandle">A handle to the instance of the <see cref="InternetExplorerWebElement"/> class.</param>
        /// <param name="id">The criteria to use to find the element.</param>
        /// <param name="foundElementHandle">A handle to the found element.</param>
        /// <returns>A <see cref="WebDriverResult"/> value indicating success or failure.</returns>
        internal WebDriverResult FindElementById(SafeInternetExplorerDriverHandle driverHandle, SafeInternetExplorerWebElementHandle elementHandle, string id, ref SafeInternetExplorerWebElementHandle foundElementHandle)
        {
            IntPtr functionPointer = NativeMethods.GetProcAddress(nativeLibraryHandle, FindElementByIdFunctionName);
            ElementFindingFunction findElementFunction = Marshal.GetDelegateForFunctionPointer(functionPointer, typeof(ElementFindingFunction)) as ElementFindingFunction;
            WebDriverResult result = findElementFunction(driverHandle, elementHandle, id, ref foundElementHandle);
            return result;
        }

        /// <summary>
        /// Finds all elements on the page meeting the specified criteria.
        /// </summary>
        /// <param name="driverHandle">A handle to the instance of the <see cref="InternetExplorerDriver"/> class.</param>
        /// <param name="elementHandle">A handle to the instance of the <see cref="InternetExplorerWebElement"/> class.</param>
        /// <param name="id">The criteria to use to find the elements.</param>
        /// <param name="foundElementCollectionHandle">A handle to the collection containing found elements.</param>
        /// <returns>A <see cref="WebDriverResult"/> value indicating success or failure.</returns>
        internal WebDriverResult FindElementsById(SafeInternetExplorerDriverHandle driverHandle, SafeInternetExplorerWebElementHandle elementHandle, string id, ref SafeWebElementCollectionHandle foundElementCollectionHandle)
        {
            IntPtr functionPointer = NativeMethods.GetProcAddress(nativeLibraryHandle, FindElementsByIdFunctionName);
            ElementCollectionFindingFunction findElementsFunction = Marshal.GetDelegateForFunctionPointer(functionPointer, typeof(ElementCollectionFindingFunction)) as ElementCollectionFindingFunction;
            WebDriverResult result = findElementsFunction(driverHandle, elementHandle, id, ref foundElementCollectionHandle);
            return result;
        }

        /// <summary>
        /// Finds the first element on the page meeting the specified criteria.
        /// </summary>
        /// <param name="driverHandle">A handle to the instance of the <see cref="InternetExplorerDriver"/> class.</param>
        /// <param name="elementHandle">A handle to the instance of the <see cref="InternetExplorerWebElement"/> class.</param>
        /// <param name="className">The criteria to use to find the element.</param>
        /// <param name="foundElementHandle">A handle to the found element.</param>
        /// <returns>A <see cref="WebDriverResult"/> value indicating success or failure.</returns>
        internal WebDriverResult FindElementByClassName(SafeInternetExplorerDriverHandle driverHandle, SafeInternetExplorerWebElementHandle elementHandle, string className, ref SafeInternetExplorerWebElementHandle foundElementHandle)
        {
            IntPtr functionPointer = NativeMethods.GetProcAddress(nativeLibraryHandle, FindElementByClassNameFunctionName);
            ElementFindingFunction findElementFunction = Marshal.GetDelegateForFunctionPointer(functionPointer, typeof(ElementFindingFunction)) as ElementFindingFunction;
            WebDriverResult result = findElementFunction(driverHandle, elementHandle, className, ref foundElementHandle);
            return result;
        }

        /// <summary>
        /// Finds all elements on the page meeting the specified criteria.
        /// </summary>
        /// <param name="driverHandle">A handle to the instance of the <see cref="InternetExplorerDriver"/> class.</param>
        /// <param name="elementHandle">A handle to the instance of the <see cref="InternetExplorerWebElement"/> class.</param>
        /// <param name="className">The criteria to use to find the elements.</param>
        /// <param name="foundElementCollectionHandle">A handle to the collection containing found elements.</param>
        /// <returns>A <see cref="WebDriverResult"/> value indicating success or failure.</returns>
        internal WebDriverResult FindElementsByClassName(SafeInternetExplorerDriverHandle driverHandle, SafeInternetExplorerWebElementHandle elementHandle, string className, ref SafeWebElementCollectionHandle foundElementCollectionHandle)
        {
            IntPtr functionPointer = NativeMethods.GetProcAddress(nativeLibraryHandle, FindElementsByClassNameFunctionName);
            ElementCollectionFindingFunction findElementsFunction = Marshal.GetDelegateForFunctionPointer(functionPointer, typeof(ElementCollectionFindingFunction)) as ElementCollectionFindingFunction;
            WebDriverResult result = findElementsFunction(driverHandle, elementHandle, className, ref foundElementCollectionHandle);
            return result;
        }

        /// <summary>
        /// Finds the first element on the page meeting the specified criteria.
        /// </summary>
        /// <param name="driverHandle">A handle to the instance of the <see cref="InternetExplorerDriver"/> class.</param>
        /// <param name="elementHandle">A handle to the instance of the <see cref="InternetExplorerWebElement"/> class.</param>
        /// <param name="linkText">The criteria to use to find the element.</param>
        /// <param name="foundElementHandle">A handle to the found element.</param>
        /// <returns>A <see cref="WebDriverResult"/> value indicating success or failure.</returns>
        internal WebDriverResult FindElementByLinkText(SafeInternetExplorerDriverHandle driverHandle, SafeInternetExplorerWebElementHandle elementHandle, string linkText, ref SafeInternetExplorerWebElementHandle foundElementHandle)
        {
            IntPtr functionPointer = NativeMethods.GetProcAddress(nativeLibraryHandle, FindElementByLinkTextFunctionName);
            ElementFindingFunction findElementFunction = Marshal.GetDelegateForFunctionPointer(functionPointer, typeof(ElementFindingFunction)) as ElementFindingFunction;
            WebDriverResult result = findElementFunction(driverHandle, elementHandle, linkText, ref foundElementHandle);
            return result;
        }

        /// <summary>
        /// Finds all elements on the page meeting the specified criteria.
        /// </summary>
        /// <param name="driverHandle">A handle to the instance of the <see cref="InternetExplorerDriver"/> class.</param>
        /// <param name="elementHandle">A handle to the instance of the <see cref="InternetExplorerWebElement"/> class.</param>
        /// <param name="linkText">The criteria to use to find the elements.</param>
        /// <param name="foundElementCollectionHandle">A handle to the collection containing found elements.</param>
        /// <returns>A <see cref="WebDriverResult"/> value indicating success or failure.</returns>
        internal WebDriverResult FindElementsByLinkText(SafeInternetExplorerDriverHandle driverHandle, SafeInternetExplorerWebElementHandle elementHandle, string linkText, ref SafeWebElementCollectionHandle foundElementCollectionHandle)
        {
            IntPtr functionPointer = NativeMethods.GetProcAddress(nativeLibraryHandle, FindElementsByLinkTextFunctionName);
            ElementCollectionFindingFunction findElementsFunction = Marshal.GetDelegateForFunctionPointer(functionPointer, typeof(ElementCollectionFindingFunction)) as ElementCollectionFindingFunction;
            WebDriverResult result = findElementsFunction(driverHandle, elementHandle, linkText, ref foundElementCollectionHandle);
            return result;
        }

        /// <summary>
        /// Finds the first element on the page meeting the specified criteria.
        /// </summary>
        /// <param name="driverHandle">A handle to the instance of the <see cref="InternetExplorerDriver"/> class.</param>
        /// <param name="elementHandle">A handle to the instance of the <see cref="InternetExplorerWebElement"/> class.</param>
        /// <param name="partialLinkText">The criteria to use to find the element.</param>
        /// <param name="foundElementHandle">A handle to the found element.</param>
        /// <returns>A <see cref="WebDriverResult"/> value indicating success or failure.</returns>
        internal WebDriverResult FindElementByPartialLinkText(SafeInternetExplorerDriverHandle driverHandle, SafeInternetExplorerWebElementHandle elementHandle, string partialLinkText, ref SafeInternetExplorerWebElementHandle foundElementHandle)
        {
            IntPtr functionPointer = NativeMethods.GetProcAddress(nativeLibraryHandle, FindElementByPartialLinkTextFunctionName);
            ElementFindingFunction findElementFunction = Marshal.GetDelegateForFunctionPointer(functionPointer, typeof(ElementFindingFunction)) as ElementFindingFunction;
            WebDriverResult result = findElementFunction(driverHandle, elementHandle, partialLinkText, ref foundElementHandle);
            return result;
        }

        /// <summary>
        /// Finds all elements on the page meeting the specified criteria.
        /// </summary>
        /// <param name="driverHandle">A handle to the instance of the <see cref="InternetExplorerDriver"/> class.</param>
        /// <param name="elementHandle">A handle to the instance of the <see cref="InternetExplorerWebElement"/> class.</param>
        /// <param name="partialLinkText">The criteria to use to find the elements.</param>
        /// <param name="foundElementCollectionHandle">A handle to the collection containing found elements.</param>
        /// <returns>A <see cref="WebDriverResult"/> value indicating success or failure.</returns>
        internal WebDriverResult FindElementsByPartialLinkText(SafeInternetExplorerDriverHandle driverHandle, SafeInternetExplorerWebElementHandle elementHandle, string partialLinkText, ref SafeWebElementCollectionHandle foundElementCollectionHandle)
        {
            IntPtr functionPointer = NativeMethods.GetProcAddress(nativeLibraryHandle, FindElementsByPartialLinkTextFunctionName);
            ElementCollectionFindingFunction findElementsFunction = Marshal.GetDelegateForFunctionPointer(functionPointer, typeof(ElementCollectionFindingFunction)) as ElementCollectionFindingFunction;
            WebDriverResult result = findElementsFunction(driverHandle, elementHandle, partialLinkText, ref foundElementCollectionHandle);
            return result;
        }

        /// <summary>
        /// Finds the first element on the page meeting the specified criteria.
        /// </summary>
        /// <param name="driverHandle">A handle to the instance of the <see cref="InternetExplorerDriver"/> class.</param>
        /// <param name="elementHandle">A handle to the instance of the <see cref="InternetExplorerWebElement"/> class.</param>
        /// <param name="name">The criteria to use to find the element.</param>
        /// <param name="foundElementHandle">A handle to the found element.</param>
        /// <returns>A <see cref="WebDriverResult"/> value indicating success or failure.</returns>
        internal WebDriverResult FindElementByName(SafeInternetExplorerDriverHandle driverHandle, SafeInternetExplorerWebElementHandle elementHandle, string name, ref SafeInternetExplorerWebElementHandle foundElementHandle)
        {
            IntPtr functionPointer = NativeMethods.GetProcAddress(nativeLibraryHandle, FindElementByNameFunctionName);
            ElementFindingFunction findElementFunction = Marshal.GetDelegateForFunctionPointer(functionPointer, typeof(ElementFindingFunction)) as ElementFindingFunction;
            WebDriverResult result = findElementFunction(driverHandle, elementHandle, name, ref foundElementHandle);
            return result;
        }

        /// <summary>
        /// Finds all elements on the page meeting the specified criteria.
        /// </summary>
        /// <param name="driverHandle">A handle to the instance of the <see cref="InternetExplorerDriver"/> class.</param>
        /// <param name="elementHandle">A handle to the instance of the <see cref="InternetExplorerWebElement"/> class.</param>
        /// <param name="name">The criteria to use to find the elements.</param>
        /// <param name="foundElementCollectionHandle">A handle to the collection containing found elements.</param>
        /// <returns>A <see cref="WebDriverResult"/> value indicating success or failure.</returns>
        internal WebDriverResult FindElementsByName(SafeInternetExplorerDriverHandle driverHandle, SafeInternetExplorerWebElementHandle elementHandle, string name, ref SafeWebElementCollectionHandle foundElementCollectionHandle)
        {
            IntPtr functionPointer = NativeMethods.GetProcAddress(nativeLibraryHandle, FindElementsByNameFunctionName);
            ElementCollectionFindingFunction findElementsFunction = Marshal.GetDelegateForFunctionPointer(functionPointer, typeof(ElementCollectionFindingFunction)) as ElementCollectionFindingFunction;
            WebDriverResult result = findElementsFunction(driverHandle, elementHandle, name, ref foundElementCollectionHandle);
            return result;
        }

        /// <summary>
        /// Finds the first element on the page meeting the specified criteria.
        /// </summary>
        /// <param name="driverHandle">A handle to the instance of the <see cref="InternetExplorerDriver"/> class.</param>
        /// <param name="elementHandle">A handle to the instance of the <see cref="InternetExplorerWebElement"/> class.</param>
        /// <param name="tagName">The criteria to use to find the element.</param>
        /// <param name="foundElementHandle">A handle to the found element.</param>
        /// <returns>A <see cref="WebDriverResult"/> value indicating success or failure.</returns>
        internal WebDriverResult FindElementByTagName(SafeInternetExplorerDriverHandle driverHandle, SafeInternetExplorerWebElementHandle elementHandle, string tagName, ref SafeInternetExplorerWebElementHandle foundElementHandle)
        {
            IntPtr functionPointer = NativeMethods.GetProcAddress(nativeLibraryHandle, FindElementByTagNameFunctionName);
            ElementFindingFunction findElementFunction = Marshal.GetDelegateForFunctionPointer(functionPointer, typeof(ElementFindingFunction)) as ElementFindingFunction;
            WebDriverResult result = findElementFunction(driverHandle, elementHandle, tagName, ref foundElementHandle);
            return result;
        }

        /// <summary>
        /// Finds all elements on the page meeting the specified criteria.
        /// </summary>
        /// <param name="driverHandle">A handle to the instance of the <see cref="InternetExplorerDriver"/> class.</param>
        /// <param name="elementHandle">A handle to the instance of the <see cref="InternetExplorerWebElement"/> class.</param>
        /// <param name="tagName">The criteria to use to find the elements.</param>
        /// <param name="foundElementCollectionHandle">A handle to the collection containing found elements.</param>
        /// <returns>A <see cref="WebDriverResult"/> value indicating success or failure.</returns>
        internal WebDriverResult FindElementsByTagName(SafeInternetExplorerDriverHandle driverHandle, SafeInternetExplorerWebElementHandle elementHandle, string tagName, ref SafeWebElementCollectionHandle foundElementCollectionHandle)
        {
            IntPtr functionPointer = NativeMethods.GetProcAddress(nativeLibraryHandle, FindElementsByTagNameFunctionName);
            ElementCollectionFindingFunction findElementsFunction = Marshal.GetDelegateForFunctionPointer(functionPointer, typeof(ElementCollectionFindingFunction)) as ElementCollectionFindingFunction;
            WebDriverResult result = findElementsFunction(driverHandle, elementHandle, tagName, ref foundElementCollectionHandle);
            return result;
        }

        /// <summary>
        /// Finds the first element on the page meeting the specified criteria.
        /// </summary>
        /// <param name="driverHandle">A handle to the instance of the <see cref="InternetExplorerDriver"/> class.</param>
        /// <param name="elementHandle">A handle to the instance of the <see cref="InternetExplorerWebElement"/> class.</param>
        /// <param name="xpath">The criteria to use to find the element.</param>
        /// <param name="foundElementHandle">A handle to the found element.</param>
        /// <returns>A <see cref="WebDriverResult"/> value indicating success or failure.</returns>
        internal WebDriverResult FindElementByXPath(SafeInternetExplorerDriverHandle driverHandle, SafeInternetExplorerWebElementHandle elementHandle, string xpath, ref SafeInternetExplorerWebElementHandle foundElementHandle)
        {
            IntPtr functionPointer = NativeMethods.GetProcAddress(nativeLibraryHandle, FindElementByXPathFunctionName);
            ElementFindingFunction findElementFunction = Marshal.GetDelegateForFunctionPointer(functionPointer, typeof(ElementFindingFunction)) as ElementFindingFunction;
            WebDriverResult result = findElementFunction(driverHandle, elementHandle, xpath, ref foundElementHandle);
            return result;
        }

        /// <summary>
        /// Finds all elements on the page meeting the specified criteria.
        /// </summary>
        /// <param name="driverHandle">A handle to the instance of the <see cref="InternetExplorerDriver"/> class.</param>
        /// <param name="elementHandle">A handle to the instance of the <see cref="InternetExplorerWebElement"/> class.</param>
        /// <param name="xpath">The criteria to use to find the elements.</param>
        /// <param name="foundElementCollectionHandle">A handle to the collection containing found elements.</param>
        /// <returns>A <see cref="WebDriverResult"/> value indicating success or failure.</returns>
        internal WebDriverResult FindElementsByXPath(SafeInternetExplorerDriverHandle driverHandle, SafeInternetExplorerWebElementHandle elementHandle, string xpath, ref SafeWebElementCollectionHandle foundElementCollectionHandle)
        {
            IntPtr functionPointer = NativeMethods.GetProcAddress(nativeLibraryHandle, FindElementsByXPathFunctionName);
            ElementCollectionFindingFunction findElementsFunction = Marshal.GetDelegateForFunctionPointer(functionPointer, typeof(ElementCollectionFindingFunction)) as ElementCollectionFindingFunction;
            WebDriverResult result = findElementsFunction(driverHandle, elementHandle, xpath, ref foundElementCollectionHandle);
            return result;
        }
        #endregion

        #region JavaScript executing functions
        /// <summary>
        /// Creates a new set of script arguments.
        /// </summary>
        /// <param name="scriptArgsHandle">A handle to the instance of the script arguments.</param>
        /// <param name="maxLength">The maximum number of arguments to allocate.</param>
        /// <returns>A <see cref="WebDriverResult"/> value indicating success or failure.</returns>
        internal WebDriverResult NewScriptArgs(ref SafeScriptArgsHandle scriptArgsHandle, int maxLength)
        {
            IntPtr functionPointer = NativeMethods.GetProcAddress(nativeLibraryHandle, NewScriptArgsFunctionName);
            ScriptArgsReturningFunction newScriptArgsFunction = Marshal.GetDelegateForFunctionPointer(functionPointer, typeof(ScriptArgsReturningFunction)) as ScriptArgsReturningFunction;
            WebDriverResult result = newScriptArgsFunction(ref scriptArgsHandle, maxLength);
            return result;
        }

        /// <summary>
        /// Adds a string argument to the set of script arguments.
        /// </summary>
        /// <param name="scriptArgsHandle">A handle to the instance of the script arguments.</param>
        /// <param name="argument">The argument to add.</param>
        /// <returns>A <see cref="WebDriverResult"/> value indicating success or failure.</returns>
        internal WebDriverResult AddStringScriptArg(SafeScriptArgsHandle scriptArgsHandle, string argument)
        {
            IntPtr functionPointer = NativeMethods.GetProcAddress(nativeLibraryHandle, AddStringScriptArgFunctionName);
            StringParameterScriptArgsFunction addScriptArgFunction = Marshal.GetDelegateForFunctionPointer(functionPointer, typeof(StringParameterScriptArgsFunction)) as StringParameterScriptArgsFunction;
            WebDriverResult result = addScriptArgFunction(scriptArgsHandle, argument);
            return result;
        }

        /// <summary>
        /// Adds a boolean argument to the set of script arguments.
        /// </summary>
        /// <param name="scriptArgsHandle">A handle to the instance of the script arguments.</param>
        /// <param name="argument">The argument to add.</param>
        /// <returns>A <see cref="WebDriverResult"/> value indicating success or failure.</returns>
        internal WebDriverResult AddBooleanScriptArg(SafeScriptArgsHandle scriptArgsHandle, int argument)
        {
            IntPtr functionPointer = NativeMethods.GetProcAddress(nativeLibraryHandle, AddBooleanScriptArgFunctionName);
            BooleanParameterScriptArgsFunction addScriptArgFunction = Marshal.GetDelegateForFunctionPointer(functionPointer, typeof(BooleanParameterScriptArgsFunction)) as BooleanParameterScriptArgsFunction;
            WebDriverResult result = addScriptArgFunction(scriptArgsHandle, argument);
            return result;
        }

        /// <summary>
        /// Adds a number argument to the set of script arguments.
        /// </summary>
        /// <param name="scriptArgsHandle">A handle to the instance of the script arguments.</param>
        /// <param name="argument">The argument to add.</param>
        /// <returns>A <see cref="WebDriverResult"/> value indicating success or failure.</returns>
        internal WebDriverResult AddNumberScriptArg(SafeScriptArgsHandle scriptArgsHandle, long argument)
        {
            IntPtr functionPointer = NativeMethods.GetProcAddress(nativeLibraryHandle, AddNumberScriptArgFunctionName);
            NumberParameterScriptArgsFunction addScriptArgFunction = Marshal.GetDelegateForFunctionPointer(functionPointer, typeof(NumberParameterScriptArgsFunction)) as NumberParameterScriptArgsFunction;
            WebDriverResult result = addScriptArgFunction(scriptArgsHandle, argument);
            return result;
        }

        /// <summary>
        /// Adds a double argument to the set of script arguments.
        /// </summary>
        /// <param name="scriptArgsHandle">A handle to the instance of the script arguments.</param>
        /// <param name="argument">The argument to add.</param>
        /// <returns>A <see cref="WebDriverResult"/> value indicating success or failure.</returns>
        internal WebDriverResult AddDoubleScriptArg(SafeScriptArgsHandle scriptArgsHandle, double argument)
        {
            IntPtr functionPointer = NativeMethods.GetProcAddress(nativeLibraryHandle, AddDoubleScriptArgFunctionName);
            DoubleParameterScriptArgsFunction addScriptArgFunction = Marshal.GetDelegateForFunctionPointer(functionPointer, typeof(DoubleParameterScriptArgsFunction)) as DoubleParameterScriptArgsFunction;
            WebDriverResult result = addScriptArgFunction(scriptArgsHandle, argument);
            return result;
        }

        /// <summary>
        /// Adds an element argument to the set of script arguments.
        /// </summary>
        /// <param name="scriptArgsHandle">A handle to the instance of the script arguments.</param>
        /// <param name="argument">The argument to add.</param>
        /// <returns>A <see cref="WebDriverResult"/> value indicating success or failure.</returns>
        internal WebDriverResult AddElementScriptArg(SafeScriptArgsHandle scriptArgsHandle, SafeInternetExplorerWebElementHandle argument)
        {
            IntPtr functionPointer = NativeMethods.GetProcAddress(nativeLibraryHandle, AddElementScriptArgFunctionName);
            ElementParameterScriptArgsFunction addScriptArgFunction = Marshal.GetDelegateForFunctionPointer(functionPointer, typeof(ElementParameterScriptArgsFunction)) as ElementParameterScriptArgsFunction;
            WebDriverResult result = addScriptArgFunction(scriptArgsHandle, argument);
            return result;
        }

        /// <summary>
        /// Executes arbitrary JavaScript on the page.
        /// </summary>
        /// <param name="driverHandle">A handle to the instance of the <see cref="InternetExplorerDriver"/> class.</param>
        /// <param name="script">The script to run.</param>
        /// <param name="scriptArgsHandle">A handle to the instance of the script arguments.</param>
        /// <param name="scriptResultHandle">A handle to the result of the script.</param>
        /// <returns>A <see cref="WebDriverResult"/> value indicating success or failure.</returns>
        internal WebDriverResult ExecuteScript(SafeInternetExplorerDriverHandle driverHandle, string script, SafeScriptArgsHandle scriptArgsHandle, ref SafeScriptResultHandle scriptResultHandle)
        {
            IntPtr functionPointer = NativeMethods.GetProcAddress(nativeLibraryHandle, ExecuteScriptFunctionName);
            ExecuteScriptFunction executeFunction = Marshal.GetDelegateForFunctionPointer(functionPointer, typeof(ExecuteScriptFunction)) as ExecuteScriptFunction;
            WebDriverResult result = executeFunction(driverHandle, script, scriptArgsHandle, ref scriptResultHandle);
            return result;
        }

        /// <summary>
        /// Gets the type of object returned from the script.
        /// </summary>
        /// <param name="driverHandle">A handle to the instance of the <see cref="InternetExplorerDriver"/> class.</param>
        /// <param name="scriptResultHandle">A handle to the result of the script.</param>
        /// <param name="resultType">A value representing the return type.</param>
        /// <returns>A <see cref="WebDriverResult"/> value indicating success or failure.</returns>
        internal WebDriverResult GetScriptResultType(SafeInternetExplorerDriverHandle driverHandle, SafeScriptResultHandle scriptResultHandle, out int resultType)
        {
            IntPtr functionPointer = NativeMethods.GetProcAddress(nativeLibraryHandle, GetScriptResultTypeFunctionName);
            GetScriptResultTypeFunction scriptResultTypeFunction = Marshal.GetDelegateForFunctionPointer(functionPointer, typeof(GetScriptResultTypeFunction)) as GetScriptResultTypeFunction;
            WebDriverResult result = scriptResultTypeFunction(driverHandle, scriptResultHandle, out resultType);
            return result;
        }

        /// <summary>
        /// Retrieves the value from the script result.
        /// </summary>
        /// <param name="scriptResultHandle">A handle to the result of the script.</param>
        /// <param name="scriptResultValueWrapperHandle">A value representing the value of the returned object from the script.</param>
        /// <returns>A <see cref="WebDriverResult"/> value indicating success or failure.</returns>
        internal WebDriverResult GetStringScriptResult(SafeScriptResultHandle scriptResultHandle, ref SafeStringWrapperHandle scriptResultValueWrapperHandle)
        {
            IntPtr functionPointer = NativeMethods.GetProcAddress(nativeLibraryHandle, GetStringScriptResultFunctionName);
            StringReturningScriptResultFunction scriptResultFunction = Marshal.GetDelegateForFunctionPointer(functionPointer, typeof(StringReturningScriptResultFunction)) as StringReturningScriptResultFunction;
            WebDriverResult result = scriptResultFunction(scriptResultHandle, ref scriptResultValueWrapperHandle);
            return result;
        }

        /// <summary>
        /// Retrieves the value from the script result.
        /// </summary>
        /// <param name="scriptResultHandle">A handle to the result of the script.</param>
        /// <param name="scriptResultValue">A value representing the value of the returned object from the script.</param>
        /// <returns>A <see cref="WebDriverResult"/> value indicating success or failure.</returns>
        internal WebDriverResult GetNumberScriptResult(SafeScriptResultHandle scriptResultHandle, out long scriptResultValue)
        {
            IntPtr functionPointer = NativeMethods.GetProcAddress(nativeLibraryHandle, GetNumberScriptResultFunctionName);
            NumberReturningScriptResultFunction scriptResultFunction = Marshal.GetDelegateForFunctionPointer(functionPointer, typeof(NumberReturningScriptResultFunction)) as NumberReturningScriptResultFunction;
            WebDriverResult result = scriptResultFunction(scriptResultHandle, out scriptResultValue);
            return result;
        }

        /// <summary>
        /// Retrieves the value from the script result.
        /// </summary>
        /// <param name="scriptResultHandle">A handle to the result of the script.</param>
        /// <param name="scriptResultValue">A value representing the value of the returned object from the script.</param>
        /// <returns>A <see cref="WebDriverResult"/> value indicating success or failure.</returns>
        internal WebDriverResult GetDoubleScriptResult(SafeScriptResultHandle scriptResultHandle, out double scriptResultValue)
        {
            IntPtr functionPointer = NativeMethods.GetProcAddress(nativeLibraryHandle, GetDoubleScriptResultFunctionName);
            DoubleReturningScriptResultFunction scriptResultFunction = Marshal.GetDelegateForFunctionPointer(functionPointer, typeof(DoubleReturningScriptResultFunction)) as DoubleReturningScriptResultFunction;
            WebDriverResult result = scriptResultFunction(scriptResultHandle, out scriptResultValue);
            return result;
        }

        /// <summary>
        /// Retrieves the value from the script result.
        /// </summary>
        /// <param name="scriptResultHandle">A handle to the result of the script.</param>
        /// <param name="scriptResultValue">A value representing the value of the returned object from the script.</param>
        /// <returns>A <see cref="WebDriverResult"/> value indicating success or failure.</returns>
        internal WebDriverResult GetBooleanScriptResult(SafeScriptResultHandle scriptResultHandle, out int scriptResultValue)
        {
            IntPtr functionPointer = NativeMethods.GetProcAddress(nativeLibraryHandle, GetBooleanScriptResultFunctionName);
            BooleanReturningScriptResultFunction scriptResultFunction = Marshal.GetDelegateForFunctionPointer(functionPointer, typeof(BooleanReturningScriptResultFunction)) as BooleanReturningScriptResultFunction;
            WebDriverResult result = scriptResultFunction(scriptResultHandle, out scriptResultValue);
            return result;
        }

        /// <summary>
        /// Retrieves the value from the script result.
        /// </summary>
        /// <param name="scriptResultHandle">A handle to the result of the script.</param>
        /// <param name="driverHandle">A handle to the instance of the <see cref="InternetExplorerDriver"/> class.</param>
        /// <param name="scriptResultValue">A value representing the value of the returned object from the script.</param>
        /// <returns>A <see cref="WebDriverResult"/> value indicating success or failure.</returns>
        internal WebDriverResult GetElementScriptResult(SafeScriptResultHandle scriptResultHandle, SafeInternetExplorerDriverHandle driverHandle, out SafeInternetExplorerWebElementHandle scriptResultValue)
        {
            IntPtr functionPointer = NativeMethods.GetProcAddress(nativeLibraryHandle, GetElementScriptResultFunctionName);
            ElementReturningScriptResultFunction scriptResultFunction = Marshal.GetDelegateForFunctionPointer(functionPointer, typeof(ElementReturningScriptResultFunction)) as ElementReturningScriptResultFunction;
            WebDriverResult result = scriptResultFunction(scriptResultHandle, driverHandle, out scriptResultValue);
            return result;
        }

        /// <summary>
        /// Gets the length of an array returned by the script.
        /// </summary>
        /// <param name="driverHandle">A handle to the instance of the <see cref="InternetExplorerDriver"/> class.</param>
        /// <param name="scriptResultHandle">A handle to the result of the script.</param>
        /// <param name="arrayLength">The number of elements in the returned array.</param>
        /// <returns>A <see cref="WebDriverResult"/> value indicating success or failure.</returns>
        internal WebDriverResult GetArrayLengthScriptResult(SafeInternetExplorerDriverHandle driverHandle, SafeScriptResultHandle scriptResultHandle, out int arrayLength)
        {
            IntPtr functionPointer = NativeMethods.GetProcAddress(nativeLibraryHandle, GetArrayLengthScriptResultFunctionName);
            ArrayLengthReturningScriptResultFunction getArrayLengthFunction = Marshal.GetDelegateForFunctionPointer(functionPointer, typeof(ArrayLengthReturningScriptResultFunction)) as ArrayLengthReturningScriptResultFunction;
            WebDriverResult result = getArrayLengthFunction(driverHandle, scriptResultHandle, out arrayLength);
            return result;
        }

        /// <summary>
        /// Gets the length of an array returned by the script.
        /// </summary>
        /// <param name="driverHandle">A handle to the instance of the <see cref="InternetExplorerDriver"/> class.</param>
        /// <param name="scriptResultHandle">A handle to the result of the script.</param>
        /// <param name="itemIndex">The index of the item in the returned array.</param>
        /// <param name="item">A handle to the returned item.</param>
        /// <returns>A <see cref="WebDriverResult"/> value indicating success or failure.</returns>
        internal WebDriverResult GetArrayItemFromScriptResult(SafeInternetExplorerDriverHandle driverHandle, SafeScriptResultHandle scriptResultHandle, int itemIndex, out SafeScriptResultHandle item)
        {
            IntPtr functionPointer = NativeMethods.GetProcAddress(nativeLibraryHandle, GetArrayItemFromScriptResultFunctionName);
            ArrayItemReturningScriptResultFunction getArrayItemFunction = Marshal.GetDelegateForFunctionPointer(functionPointer, typeof(ArrayItemReturningScriptResultFunction)) as ArrayItemReturningScriptResultFunction;
            WebDriverResult result = getArrayItemFunction(driverHandle, scriptResultHandle, itemIndex, out item);
            return result;
        }
        #endregion

        #region Element collection functions
        /// <summary>
        /// Gets the length of an element collection.
        /// </summary>
        /// <param name="elementCollectionHandle">A handle to the web element collection.</param>
        /// <param name="count">The number of items in the collection.</param>
        /// <returns>A <see cref="WebDriverResult"/> value indicating success or failure.</returns>
        internal WebDriverResult GetElementCollectionLength(SafeWebElementCollectionHandle elementCollectionHandle, ref int count)
        {
            IntPtr functionPointer = NativeMethods.GetProcAddress(nativeLibraryHandle, GetElementCollectionLengthFunctionName);
            GetElementCollectionLengthFunction elementCollectionLengthFunction = Marshal.GetDelegateForFunctionPointer(functionPointer, typeof(GetElementCollectionLengthFunction)) as GetElementCollectionLengthFunction;
            WebDriverResult result = elementCollectionLengthFunction(elementCollectionHandle, ref count);
            return result;
        }

        /// <summary>
        /// Gets an item from an element collection.
        /// </summary>
        /// <param name="elementCollectionHandle">A handle to the web element collection.</param>
        /// <param name="index">The index of the item the collection.</param>
        /// <param name="elementHandle">A handle to the instance of the <see cref="InternetExplorerWebElement"/> class.</param>
        /// <returns>A <see cref="WebDriverResult"/> value indicating success or failure.</returns>
        internal WebDriverResult GetElementAtIndex(SafeWebElementCollectionHandle elementCollectionHandle, int index, ref SafeInternetExplorerWebElementHandle elementHandle)
        {
            IntPtr functionPointer = NativeMethods.GetProcAddress(nativeLibraryHandle, GetElementAtIndexFunctionName);
            GetElementAtIndexFunction elementCollectionItemFunction = Marshal.GetDelegateForFunctionPointer(functionPointer, typeof(GetElementAtIndexFunction)) as GetElementAtIndexFunction;
            WebDriverResult result = elementCollectionItemFunction(elementCollectionHandle, index, ref elementHandle);
            return result;
        }
        #endregion

        #region String collection functions
        /// <summary>
        /// Gets the length of a string collection.
        /// </summary>
        /// <param name="stringCollectionHandle">A handle to the string collection.</param>
        /// <param name="count">The number of items in the collection.</param>
        /// <returns>A <see cref="WebDriverResult"/> value indicating success or failure.</returns>
        internal WebDriverResult GetStringCollectionLength(SafeStringCollectionHandle stringCollectionHandle, ref int count)
        {
            IntPtr functionPointer = NativeMethods.GetProcAddress(nativeLibraryHandle, GetStringCollectionLengthFunctionName);
            GetStringCollectionLengthFunction stringCollectionLengthFunction = Marshal.GetDelegateForFunctionPointer(functionPointer, typeof(GetStringCollectionLengthFunction)) as GetStringCollectionLengthFunction;
            WebDriverResult result = stringCollectionLengthFunction(stringCollectionHandle, ref count);
            return result;
        }

        /// <summary>
        /// Gets an item from a string collection.
        /// </summary>
        /// <param name="stringCollectionHandle">A handle to the string collection.</param>
        /// <param name="index">The index of the item the collection.</param>
        /// <param name="textWrapperHandle">A handle to the retrieved string.</param>
        /// <returns>A <see cref="WebDriverResult"/> value indicating success or failure.</returns>
        internal WebDriverResult GetStringAtIndex(SafeStringCollectionHandle stringCollectionHandle, int index, ref SafeStringWrapperHandle textWrapperHandle)
        {
            IntPtr functionPointer = NativeMethods.GetProcAddress(nativeLibraryHandle, GetStringAtIndexFunctionName);
            GetStringAtIndexFunction stringCollectionItemFunction = Marshal.GetDelegateForFunctionPointer(functionPointer, typeof(GetStringAtIndexFunction)) as GetStringAtIndexFunction;
            WebDriverResult result = stringCollectionItemFunction(stringCollectionHandle, index, ref textWrapperHandle);
            return result;
        }
        #endregion

        #region String manipulation functions
        /// <summary>
        /// Gets the length of a string.
        /// </summary>
        /// <param name="stringWrapperHandle">A pointer to the string to get the length of.</param>
        /// <param name="length">The length of the string.</param>
        /// <returns>A <see cref="WebDriverResult"/> value indicating success or failure.</returns>
        internal WebDriverResult StringLength(SafeStringWrapperHandle stringWrapperHandle, ref int length)
        {
            IntPtr functionPointer = NativeMethods.GetProcAddress(nativeLibraryHandle, StringLengthFunctionName);
            StringLengthFunction getStringLengthFunction = Marshal.GetDelegateForFunctionPointer(functionPointer, typeof(StringLengthFunction)) as StringLengthFunction;
            WebDriverResult result = getStringLengthFunction(stringWrapperHandle, ref length);
            return result;
        }

        /// <summary>
        /// Copies a string.
        /// </summary>
        /// <param name="stringWrapperHandle">A pointer to the string to copy.</param>
        /// <param name="length">The length of the string to copy.</param>
        /// <param name="copiedString">The copied string.</param>
        /// <returns>A <see cref="WebDriverResult"/> value indicating success or failure.</returns>
        internal WebDriverResult CopyString(SafeStringWrapperHandle stringWrapperHandle, int length, StringBuilder copiedString)
        {
            IntPtr functionPointer = NativeMethods.GetProcAddress(nativeLibraryHandle, CopyStringFunctionName);
            CopyStringFunction copyFunction = Marshal.GetDelegateForFunctionPointer(functionPointer, typeof(CopyStringFunction)) as CopyStringFunction;
            WebDriverResult result = copyFunction(stringWrapperHandle, length, copiedString);
            return result;
        }
        #endregion

        #region Things that should be interactions
        /// <summary>
        /// Simulates a mouse down event.
        /// </summary>
        /// <param name="hwnd">The window on which to perform the operation.</param>
        /// <param name="windowX">The X coordinate at which to simulate the mouse operation.</param>
        /// <param name="windowY">The Y coordinate at which to simulate the mouse operation.</param>
        /// <returns>A <see cref="WebDriverResult"/> value indicating success or failure.</returns>
        internal WebDriverResult MouseDownAt(IntPtr hwnd, int windowX, int windowY)
        {
            IntPtr functionPointer = NativeMethods.GetProcAddress(nativeLibraryHandle, MouseDownAtFunctionName);
            WindowMouseFunction mouseFunction = Marshal.GetDelegateForFunctionPointer(functionPointer, typeof(WindowMouseFunction)) as WindowMouseFunction;
            WebDriverResult result = mouseFunction(hwnd, windowX, windowY);
            return result;
        }

        /// <summary>
        /// Simulates a mouse up event.
        /// </summary>
        /// <param name="hwnd">The window on which to perform the operation.</param>
        /// <param name="windowX">The X coordinate at which to simulate the mouse operation.</param>
        /// <param name="windowY">The Y coordinate at which to simulate the mouse operation.</param>
        /// <returns>A <see cref="WebDriverResult"/> value indicating success or failure.</returns>
        internal WebDriverResult MouseUpAt(IntPtr hwnd, int windowX, int windowY)
        {
            IntPtr functionPointer = NativeMethods.GetProcAddress(nativeLibraryHandle, MouseUpAtFunctionName);
            WindowMouseFunction mouseFunction = Marshal.GetDelegateForFunctionPointer(functionPointer, typeof(WindowMouseFunction)) as WindowMouseFunction;
            WebDriverResult result = mouseFunction(hwnd, windowX, windowY);
            return result;
        }

        /// <summary>
        /// Simulates a mouse move event.
        /// </summary>
        /// <param name="hwnd">The window on which to perform the operation.</param>
        /// <param name="duration">Length of time to perform the operation.</param>
        /// <param name="fromX">The X coordinate at which to start the mouse operation.</param>
        /// <param name="fromY">The Y coordinate at which to start the mouse operation.</param>
        /// <param name="toX">The X coordinate at which to end the mouse operation.</param>
        /// <param name="toY">The Y coordinate at which to end the mouse operation.</param>
        /// <returns>A <see cref="WebDriverResult"/> value indicating success or failure.</returns>
        internal WebDriverResult MouseMoveTo(IntPtr hwnd, int duration, int fromX, int fromY, int toX, int toY)
        {
            IntPtr functionPointer = NativeMethods.GetProcAddress(nativeLibraryHandle, MouseMoveToFunctionName);
            WindowMouseMoveFunction mouseFunction = Marshal.GetDelegateForFunctionPointer(functionPointer, typeof(WindowMouseMoveFunction)) as WindowMouseMoveFunction;
            WebDriverResult result = mouseFunction(hwnd, duration, fromX, fromY, toX, toY);
            return result;
        }
        #endregion

        #region Private methods
        private static string GetNativeLibraryResourceName()
        {
            // We're compiled as Any CPU, which will run as a 64-bit process
            // on 64-bit OS, and 32-bit process on 32-bit OS. Thus, checking
            // the size of IntPtr is good enough.
            string resourceName = "WebDriver.InternetExplorerDriver.{0}.dll";
            if (IntPtr.Size == 8)
            {
                resourceName = string.Format(CultureInfo.InvariantCulture, resourceName, "x64");
            }
            else
            {
                resourceName = string.Format(CultureInfo.InvariantCulture, resourceName, "x86");
            }

            return resourceName;
        }

        private static void ExtractNativeLibrary(string nativeLibraryPath, Stream libraryStream)
        {
            FileStream outputStream = File.Create(nativeLibraryPath);
            byte[] buffer = new byte[1000];
            int bytesRead = libraryStream.Read(buffer, 0, buffer.Length);
            while (bytesRead > 0)
            {
                outputStream.Write(buffer, 0, bytesRead);
                bytesRead = libraryStream.Read(buffer, 0, buffer.Length);
            }

            outputStream.Close();
            libraryStream.Close();
        }

        private static string GetNativeLibraryPath()
        {
            Assembly executingAssembly = Assembly.GetExecutingAssembly();
            string currentDirectory = executingAssembly.Location;

            // If we're shadow copying,. fiddle with 
            // the codebase instead 
            if (AppDomain.CurrentDomain.ShadowCopyFiles)
            {
                Uri uri = new Uri(executingAssembly.CodeBase);
                currentDirectory = uri.LocalPath;
            }

            string nativeLibraryPath = Path.Combine(Path.GetDirectoryName(currentDirectory), LibraryName);
            if (!File.Exists(nativeLibraryPath))
            {
                string resourceName = GetNativeLibraryResourceName();

                if (executingAssembly.GetManifestResourceInfo(resourceName) == null)
                {
                    throw new WebDriverException("The native code library (InternetExplorerDriver.dll) could not be found in the current directory nor as an embedded resource.");
                }

                string nativeLibraryFolderName = string.Format(CultureInfo.InvariantCulture, "webdriver{0}libs", tempFileGenerator.Next());
                string nativeLibraryDirectory = Path.Combine(Path.GetTempPath(), nativeLibraryFolderName);
                if (!Directory.Exists(nativeLibraryDirectory))
                {
                    Directory.CreateDirectory(nativeLibraryDirectory);
                }

                nativeLibraryPath = Path.Combine(nativeLibraryDirectory, LibraryName);
                Stream libraryStream = executingAssembly.GetManifestResourceStream(resourceName);
                ExtractNativeLibrary(nativeLibraryPath, libraryStream);
            }

            return nativeLibraryPath;
        }

        private static void DeleteLibraryDirectory(string nativeLibraryDirectory)
        {
            int numberOfRetries = 0;
            while (Directory.Exists(nativeLibraryDirectory) && numberOfRetries < 10)
            {
                try
                {
                    Directory.Delete(nativeLibraryDirectory, true);
                }
                catch (IOException)
                {
                    // If we hit an exception (like file still in use), wait a half second
                    // and try again. If we still hit an exception, go ahead and let it through.
                    System.Threading.Thread.Sleep(500);
                }
                catch (UnauthorizedAccessException)
                {
                    // If we hit an exception (like file still in use), wait a half second
                    // and try again. If we still hit an exception, go ahead and let it through.
                    System.Threading.Thread.Sleep(500);
                }
                finally
                {
                    numberOfRetries++;
                }

                if (Directory.Exists(nativeLibraryDirectory))
                {
                    Console.WriteLine("Unable to delete native library directory '{0}'", nativeLibraryDirectory);
                }
            }
        }
        #endregion
    }
}
