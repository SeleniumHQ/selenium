// This file is used by Code Analysis to maintain SuppressMessage 
// attributes that are applied to this project. 
// Project-level suppressions either have no target or are given 
// a specific target and scoped to a namespace, type, member, etc. 
//
// To add a suppression to this file, right-click the message in the 
// Error List, point to "Suppress Message(s)", and click 
// "In Project Suppression File". 
// You do not need to add suppressions to this file manually. 

[assembly: System.Diagnostics.CodeAnalysis.SuppressMessage("Microsoft.Maintainability", "CA1506:AvoidExcessiveClassCoupling", Scope = "type", Target = "Selenium.WebDriverCommandProcessor", Justification = "WebDriverCommandProcessor is a factory, and requires high class coupling")]
[assembly: System.Diagnostics.CodeAnalysis.SuppressMessage("Microsoft.Maintainability", "CA1506:AvoidExcessiveClassCoupling", Scope = "member", Target = "Selenium.WebDriverCommandProcessor.#PopulateSeleneseMethods()", Justification = "WebDriverCommandProcessor is a factory, and requires high class coupling")]
[assembly: System.Diagnostics.CodeAnalysis.SuppressMessage("Microsoft.Naming", "CA1704:IdentifiersShouldBeSpelledCorrectly", MessageId = "Selenese", Scope = "type", Target = "Selenium.Internal.SeleniumEmulation.SeleneseCommand", Justification = "Selenese is spelled correctly")]
[assembly: System.Diagnostics.CodeAnalysis.SuppressMessage("Microsoft.Naming", "CA1704:IdentifiersShouldBeSpelledCorrectly", MessageId = "Selenese", Scope = "member", Target = "Selenium.Internal.SeleniumEmulation.SeleneseCommand.#HandleSeleneseCommand(OpenQA.Selenium.IWebDriver,System.String,System.String)", Justification = "Selenese is spelled correctly")]
[assembly: System.Diagnostics.CodeAnalysis.SuppressMessage("Microsoft.Design", "CA1031:DoNotCatchGeneralExceptionTypes", Scope = "member", Target = "Selenium.Internal.SeleniumEmulation.WaitForPageToLoad+PageLoadWaiter.#Until()", Justification = "We really do want to catch all exceptions in waiting.")]
[assembly: System.Diagnostics.CodeAnalysis.SuppressMessage("Microsoft.Design", "CA1031:DoNotCatchGeneralExceptionTypes", Scope = "member", Target = "Selenium.Internal.SeleniumEmulation.IndexOptionSelectStrategy.#SelectOption(System.Collections.ObjectModel.ReadOnlyCollection`1<OpenQA.Selenium.IWebElement>,System.String,System.Boolean,System.Boolean)", Justification = "We really do want to catch all exceptions when selecting an option so that we can return false.")]
