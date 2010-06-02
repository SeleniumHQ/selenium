namespace OpenQA.Selenium.Remote
{
    /// <summary>
    /// Values describing the list of commands understood by a remote server using the JSON wire protocol.
    /// </summary>
    public enum DriverCommand
    {
        /// <summary>
        /// Represents the Define Driver Mapping command
        /// </summary>
        DefineDriverMapping,

        /// <summary>
        /// Represents a New Session command
        /// </summary>
        NewSession,

        /// <summary>
        /// Represents the Get Session Capabilities command
        /// </summary>
        GetSessionCapabilities,

        /// <summary>
        /// Represents a Browser close command
        /// </summary>
        Close,

        /// <summary>
        /// Represents a browser quit command
        /// </summary>
        Quit,

        /// <summary>
        /// Represents a GET command
        /// </summary>
        Get,

        /// <summary>
        /// Represents a Browser going back command
        /// </summary>
        GoBack,

        /// <summary>
        /// Represents a Browser going forward command
        /// </summary>
        GoForward,

        /// <summary>
        /// Represents a Browser refreshing command
        /// </summary>
        Refresh,

        /// <summary>
        /// Represents adding a cookie command
        /// </summary>
        AddCookie,

        /// <summary>
        /// Represents getting all cookies command
        /// </summary>
        GetAllCookies,

        /// <summary>
        /// Represents deleting a cookie command
        /// </summary>        
        DeleteCookie,

        /// <summary>
        /// Represents Deleting all cookies command
        /// </summary>
        DeleteAllCookies,

        /// <summary>
        /// Represents findelement command
        /// </summary>
        FindElement,

        /// <summary>
        /// Represents findelements command
        /// </summary>
        FindElements,

        /// <summary>
        /// Represents findchildelements command
        /// </summary>
        FindChildElement,

        /// <summary>
        /// Represents findchildelements command
        /// </summary>
        FindChildElements,

        /// <summary>
        /// Describes an element
        /// </summary>
        DescribeElement,

        /// <summary>
        /// Represents clearelements command
        /// </summary>
        ClearElement,

        /// <summary>
        /// Represents clickelements command
        /// </summary>
        ClickElement,

        /// <summary>
        /// Represents hoverelements command
        /// </summary>
        HoverOverElement,

        /// <summary>
        /// Represents SendKeysToElements command
        /// </summary>
        SendKeysToElement,

        /// <summary>
        /// Represents SubmitElement command
        /// </summary>
        SubmitElement,

        /// <summary>
        /// Represents TogleElements command
        /// </summary>
        ToggleElement,

        /// <summary>
        /// Represents findchildelements command
        /// </summary>
        GetCurrentWindowHandle,

        /// <summary>
        /// Represents GetWindowHandles command
        /// </summary>
        GetWindowHandles,

        /// <summary>
        /// Represents SwitchToWindow command
        /// </summary>
        SwitchToWindow,

        /// <summary>
        /// Represents SwitchToFrame command
        /// </summary>
        SwitchToFrame,

        /// <summary>
        /// Represents GetActiveElement command
        /// </summary>
        GetActiveElement,

        /// <summary>
        /// Represents GetCurrentUrl command
        /// </summary>
        GetCurrentUrl,

        /// <summary>
        /// Represents GetPageSource command
        /// </summary>
        GetPageSource,

        /// <summary>
        /// Represents GetTitle command
        /// </summary>
        GetTitle,

        /// <summary>
        /// Represents ExecuteScript command
        /// </summary>
        ExecuteScript,

        /// <summary>
        /// Represents GetSpeed command
        /// </summary>
        GetSpeed,

        /// <summary>
        /// Represents SetSpeed command
        /// </summary>
        SetSpeed,

        /// <summary>
        /// Represents SetBrowserVisible command
        /// </summary>
        SetBrowserVisible,

        /// <summary>
        /// Represents IsBrowserVisible command
        /// </summary>
        IsBrowserVisible,

        /// <summary>
        /// Represents GetElementText command
        /// </summary>
        GetElementText,

        /// <summary>
        /// Represents GetElementValue command
        /// </summary>
        GetElementValue,

        /// <summary>
        /// Represents GetElementTagName command
        /// </summary>
        GetElementTagName,

        /// <summary>
        /// Represents SetElementSelected command
        /// </summary>
        SetElementSelected,

        /// <summary>
        /// Represents DragElement command
        /// </summary>
        DragElement,

        /// <summary>
        /// Represents IsElementSelected command
        /// </summary>
        IsElementSelected,

        /// <summary>
        /// Represents IsElementEnabled command
        /// </summary>
        IsElementEnabled,

        /// <summary>
        /// Represents IsElementDisplayed command
        /// </summary>
        IsElementDisplayed,

        /// <summary>
        /// Represents GetElementLocation command
        /// </summary>
        GetElementLocation,

        /// <summary>
        /// Represents GetElementLocationOnceScrolledIntoView command
        /// </summary>
        GetElementLocationOnceScrolledIntoView,

        /// <summary>
        /// Represents GetElementSize command
        /// </summary>
        GetElementSize,

        /// <summary>
        /// Represents GetElementAttribute command
        /// </summary>
        GetElementAttribute,

        /// <summary>
        /// Represents GetElementValueOfCssProperty command
        /// </summary>
        GetElementValueOfCssProperty,

        /// <summary>
        /// Represents ElementEquals command
        /// </summary>
        ElementEquals,

        /// <summary>
        /// Represents Screenshot command
        /// </summary>
        Screenshot, 

        /// <summary>
        /// Represents the ImplicitlyWait command
        /// </summary>
        ImplicitlyWait
    }
}
