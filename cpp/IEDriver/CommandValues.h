#ifndef WEBDRIVER_IE_COMMANDVALUES_H_
#define WEBDRIVER_IE_COMMANDVALUES_H_

namespace webdriver {

enum CommandValue
{
	NoCommand,
	NewSession,
	GetSessionCapabilities,
	Close,
	Quit,
	Get,
	GoBack,
	GoForward,
	Refresh,
	AddCookie,
	GetAllCookies,
	DeleteCookie,
	DeleteAllCookies,
	FindElement,
	FindElements,
	FindChildElement,
	FindChildElements,
	DescribeElement,
	ClearElement,
	ClickElement,
	HoverOverElement,
	SendKeysToElement,
	SubmitElement,
	ToggleElement,
	GetCurrentWindowHandle,
	GetWindowHandles,
	SwitchToWindow,
	SwitchToFrame,
	GetActiveElement,
	GetCurrentUrl,
	GetPageSource,
	GetTitle,
	ExecuteScript,
	ExecuteAsyncScript,
	GetSpeed,
	SetSpeed,
	SetBrowserVisible,
	IsBrowserVisible,
	GetElementText,
	GetElementValue,
	GetElementTagName,
	SetElementSelected,
	DragElement,
	IsElementSelected,
	IsElementEnabled,
	IsElementDisplayed,
	GetElementLocation,
	GetElementLocationOnceScrolledIntoView,
	GetElementSize,
	GetElementAttribute,
	GetElementValueOfCssProperty,
	ElementEquals,
	Screenshot, 
	ImplicitlyWait,
	SetAsyncScriptTimeout,

	AcceptAlert,
	DismissAlert,
	GetAlertText,
	SendKeysToAlert,

	SendModifierKey,
	MouseMoveTo,
	MouseClick,
	MouseDoubleClick,
	MouseButtonDown,
	MouseButtonUp
};

} // namespace webdriver

#endif // WEBDRIVER_IE_COMMANDVALUES_H_
