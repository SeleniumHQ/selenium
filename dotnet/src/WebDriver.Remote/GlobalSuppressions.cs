// This file is used by Code Analysis to maintain SuppressMessage 
// attributes that are applied to this project. 
// Project-level suppressions either have no target or are given 
// a specific target and scoped to a namespace, type, member, etc. 
//
// To add a suppression to this file, right-click the message in the 
// Error List, point to "Suppress Message(s)", and click 
// "In Project Suppression File". 
// You do not need to add suppressions to this file manually. 

[assembly: System.Diagnostics.CodeAnalysis.SuppressMessage("Microsoft.Usage", "CA2214:DoNotCallOverridableMethodsInConstructors", Scope = "member", Target = "OpenQA.Selenium.Remote.RemoteWebDriver.#.ctor(OpenQA.Selenium.Remote.ICommandExecutor,OpenQA.Selenium.ICapabilities)", Justification = "StartServer() is a hook for subclasses, and is appropriate to call from the constructor")]
[assembly: System.Diagnostics.CodeAnalysis.SuppressMessage("Microsoft.Usage", "CA2234:PassSystemUriObjectsInsteadOfStrings", Scope = "member", Target = "OpenQA.Selenium.Remote.CommandInfo.#CreateWebRequest(System.Uri,OpenQA.Selenium.Remote.Command)")]
[assembly: System.Diagnostics.CodeAnalysis.SuppressMessage("Microsoft.Globalization", "CA1308:NormalizeStringsToUppercase", Scope = "member", Target = "OpenQA.Selenium.Remote.RemoteWebElement.#GetAttribute(System.String)", Justification = "Strings are properly normalized to lower case.")]
[assembly: System.Diagnostics.CodeAnalysis.SuppressMessage("Microsoft.Globalization", "CA1308:NormalizeStringsToUppercase", Scope = "member", Target = "OpenQA.Selenium.Remote.RemoteWebDriver.#UnpackAndThrowOnError(OpenQA.Selenium.Remote.Response)", Justification = "Strings are properly normalized to lower case.")]
[assembly: System.Diagnostics.CodeAnalysis.SuppressMessage("Microsoft.Maintainability", "CA1502:AvoidExcessiveComplexity", Scope = "member", Target = "OpenQA.Selenium.Remote.RemoteWebDriver.#UnpackAndThrowOnError(OpenQA.Selenium.Remote.Response)")]
