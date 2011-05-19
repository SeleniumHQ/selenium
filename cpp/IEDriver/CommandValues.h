// Copyright 2011 WebDriver committers
// Licensed under the Apache License, Version 2.0 (the "License");
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

#ifndef WEBDRIVER_IE_COMMANDVALUES_H_
#define WEBDRIVER_IE_COMMANDVALUES_H_

namespace webdriver {

enum CommandValue {
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
