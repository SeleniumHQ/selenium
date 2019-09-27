// <copyright file="GlobalSuppressions.cs" company="WebDriver Committers">
// Licensed to the Software Freedom Conservancy (SFC) under one
// or more contributor license agreements. See the NOTICE file
// distributed with this work for additional information
// regarding copyright ownership. The SFC licenses this file
// to you under the Apache License, Version 2.0 (the "License");
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
// </copyright>

// This file is used by Code Analysis to maintain SuppressMessage 
// attributes that are applied to this project. 
// Project-level suppressions either have no target or are given 
// a specific target and scoped to a namespace, type, member, etc. 
//
// To add a suppression to this file, right-click the message in the 
// Error List, point to "Suppress Message(s)", and click 
// "In Project Suppression File". 
// You do not need to add suppressions to this file manually. 
[assembly: System.CLSCompliant(true)]
[assembly: System.Diagnostics.CodeAnalysis.SuppressMessage("Microsoft.Maintainability", "CA1506:AvoidExcessiveClassCoupling", Scope = "type", Target = "Selenium.WebDriverCommandProcessor", Justification = "WebDriverCommandProcessor is a factory, and requires high class coupling")]
[assembly: System.Diagnostics.CodeAnalysis.SuppressMessage("Microsoft.Maintainability", "CA1506:AvoidExcessiveClassCoupling", Scope = "member", Target = "Selenium.WebDriverCommandProcessor.#PopulateSeleneseMethods()", Justification = "WebDriverCommandProcessor is a factory, and requires high class coupling")]
[assembly: System.Diagnostics.CodeAnalysis.SuppressMessage("Microsoft.Naming", "CA1704:IdentifiersShouldBeSpelledCorrectly", MessageId = "Selenese", Scope = "type", Target = "Selenium.Internal.SeleniumEmulation.SeleneseCommand", Justification = "Selenese is spelled correctly")]
[assembly: System.Diagnostics.CodeAnalysis.SuppressMessage("Microsoft.Naming", "CA1704:IdentifiersShouldBeSpelledCorrectly", MessageId = "Selenese", Scope = "member", Target = "Selenium.Internal.SeleniumEmulation.SeleneseCommand.#HandleSeleneseCommand(OpenQA.Selenium.IWebDriver,System.String,System.String)", Justification = "Selenese is spelled correctly")]
[assembly: System.Diagnostics.CodeAnalysis.SuppressMessage("Microsoft.Design", "CA1031:DoNotCatchGeneralExceptionTypes", Scope = "member", Target = "Selenium.Internal.SeleniumEmulation.WaitForPageToLoad+PageLoadWaiter.#Until()", Justification = "We really do want to catch all exceptions in waiting.")]
[assembly: System.Diagnostics.CodeAnalysis.SuppressMessage("Microsoft.Design", "CA1031:DoNotCatchGeneralExceptionTypes", Scope = "member", Target = "Selenium.Internal.SeleniumEmulation.WaitForPageToLoad+ReadyStateWaiter.#Until()", Justification = "We really do want to catch all exceptions in waiting.")]
[assembly: System.Diagnostics.CodeAnalysis.SuppressMessage("Microsoft.Design", "CA1020:AvoidNamespacesWithFewTypes", Scope = "namespace", Target = "Selenium", Justification = "The namespace is appropriately scoped.")]
[assembly: System.Diagnostics.CodeAnalysis.SuppressMessage("Microsoft.Design", "CA1020:AvoidNamespacesWithFewTypes", Scope = "namespace", Target = "Selenium.Internal.SeleniumEmulation", Justification = "The namespace is appropriately scoped.")]
[assembly: System.Diagnostics.CodeAnalysis.SuppressMessage("Microsoft.Globalization", "CA1308:NormalizeStringsToUppercase", Scope = "member", Target = "Selenium.Internal.SeleniumEmulation.SeleniumSelect.#.ctor(Selenium.Internal.SeleniumEmulation.ElementFinder,OpenQA.Selenium.IWebDriver,System.String)", Justification = "Strings are properly normalized to lowercase.")]
[assembly: System.Diagnostics.CodeAnalysis.SuppressMessage("Microsoft.Globalization", "CA1308:NormalizeStringsToUppercase", Scope = "member", Target = "Selenium.Internal.SeleniumEmulation.Type.#HandleSeleneseCommand(OpenQA.Selenium.IWebDriver,System.String,System.String)", Justification = "Strings are properly normalized to lowercase.")]
[assembly: System.Diagnostics.CodeAnalysis.SuppressMessage("Microsoft.Globalization", "CA1303:Do not pass literals as localized parameters", MessageId = "Selenium.Internal.SeleniumEmulation.Waiter.Wait(System.String,System.Int64)", Scope = "member", Target = "Selenium.Internal.SeleniumEmulation.WaitForPopup.#HandleSeleneseCommand(OpenQA.Selenium.IWebDriver,System.String,System.String)", Justification = "Project does not use resource assemblies.")]
[assembly: System.Diagnostics.CodeAnalysis.SuppressMessage("Microsoft.Globalization", "CA1303:Do not pass literals as localized parameters", MessageId = "Selenium.Internal.SeleniumEmulation.Waiter.Wait(System.String)", Scope = "member", Target = "Selenium.Internal.SeleniumEmulation.WaitForPopup.#HandleSeleneseCommand(OpenQA.Selenium.IWebDriver,System.String,System.String)", Justification = "Project does not use resource assemblies.")]
[assembly: System.Diagnostics.CodeAnalysis.SuppressMessage("Microsoft.Globalization", "CA1303:Do not pass literals as localized parameters", MessageId = "Selenium.Internal.SeleniumEmulation.Waiter.Wait(System.String,System.Int64)", Scope = "member", Target = "Selenium.Internal.SeleniumEmulation.WaitForPageToLoad.#HandleSeleneseCommand(OpenQA.Selenium.IWebDriver,System.String,System.String)", Justification = "Project does not use resource assemblies.")]
[assembly: System.Diagnostics.CodeAnalysis.SuppressMessage("Microsoft.Globalization", "CA1303:Do not pass literals as localized parameters", MessageId = "Selenium.Internal.SeleniumEmulation.Waiter.Wait(System.String,System.Int64)", Scope = "member", Target = "Selenium.Internal.SeleniumEmulation.WaitForCondition.#HandleSeleneseCommand(OpenQA.Selenium.IWebDriver,System.String,System.String)", Justification = "Project does not use resource assemblies.")]
[assembly: System.Diagnostics.CodeAnalysis.SuppressMessage("Microsoft.Globalization", "CA1303:Do not pass literals as localized parameters", MessageId = "Selenium.Internal.SeleniumEmulation.Waiter.Wait(System.String)", Scope = "member", Target = "Selenium.Internal.SeleniumEmulation.WaitForCondition.#HandleSeleneseCommand(OpenQA.Selenium.IWebDriver,System.String,System.String)", Justification = "Project does not use resource assemblies.")]
[assembly: System.Diagnostics.CodeAnalysis.SuppressMessage("Microsoft.Performance", "CA1811:AvoidUncalledPrivateCode", Scope = "member", Target = "Selenium.Internal.CommandTimer.#Timeout")]
[assembly: System.Diagnostics.CodeAnalysis.SuppressMessage("Microsoft.Performance", "CA1812:AvoidUninstantiatedInternalClasses", Scope = "type", Target = "Selenium.Internal.SeleniumEmulation.GetExpression")]
[assembly: System.Diagnostics.CodeAnalysis.SuppressMessage("Microsoft.Naming", "CA2204:Literals should be spelled correctly", MessageId = "altKeyDown", Scope = "member", Target = "Selenium.Internal.SeleniumEmulation.Type.#HandleSeleneseCommand(OpenQA.Selenium.IWebDriver,System.String,System.String)", Justification = "Method names are properly spelled")]
[assembly: System.Diagnostics.CodeAnalysis.SuppressMessage("Microsoft.Naming", "CA2204:Literals should be spelled correctly", MessageId = "controlKeyDown", Scope = "member", Target = "Selenium.Internal.SeleniumEmulation.Type.#HandleSeleneseCommand(OpenQA.Selenium.IWebDriver,System.String,System.String)", Justification = "Method names are properly spelled")]
[assembly: System.Diagnostics.CodeAnalysis.SuppressMessage("Microsoft.Naming", "CA2204:Literals should be spelled correctly", MessageId = "metaKeyDown", Scope = "member", Target = "Selenium.Internal.SeleniumEmulation.Type.#HandleSeleneseCommand(OpenQA.Selenium.IWebDriver,System.String,System.String)", Justification = "Method names are properly spelled")]
[assembly: System.Diagnostics.CodeAnalysis.SuppressMessage("Microsoft.Naming", "CA2204:Literals should be spelled correctly", MessageId = "WebDriverBackedSelenium", Scope = "member", Target = "Selenium.WebDriverCommandProcessor.#Start(System.Object)", Justification = "WebDriverBackedSelenium is properly spelled")]
[assembly: System.Diagnostics.CodeAnalysis.SuppressMessage("Microsoft.Naming", "CA2204:Literals should be spelled correctly", MessageId = "WebDriverBackedSelenium", Scope = "member", Target = "Selenium.WebDriverCommandProcessor.#Start(System.String)", Justification = "WebDriverBackedSelenium is properly spelled")]
[assembly: System.Diagnostics.CodeAnalysis.SuppressMessage("Microsoft.Naming", "CA2204:Literals should be spelled correctly", MessageId = "columnNum", Scope = "member", Target = "Selenium.Internal.SeleniumEmulation.GetTable.#HandleSeleneseCommand(OpenQA.Selenium.IWebDriver,System.String,System.String)", Justification = "colNum is correctly spelled")]
[assembly: System.Diagnostics.CodeAnalysis.SuppressMessage("Microsoft.Naming", "CA2204:Literals should be spelled correctly", MessageId = "rowNum", Scope = "member", Target = "Selenium.Internal.SeleniumEmulation.GetTable.#HandleSeleneseCommand(OpenQA.Selenium.IWebDriver,System.String,System.String)", Justification = "rowNum is correctly spelled")]
[assembly: System.Diagnostics.CodeAnalysis.SuppressMessage("Microsoft.Naming", "CA2204:Literals should be spelled correctly", MessageId = "tableName", Scope = "member", Target = "Selenium.Internal.SeleniumEmulation.GetTable.#HandleSeleneseCommand(OpenQA.Selenium.IWebDriver,System.String,System.String)", Justification = "tableName is correctly spelled")]
[assembly: System.Diagnostics.CodeAnalysis.SuppressMessage("Microsoft.Naming", "CA2204:Literals should be spelled correctly", MessageId = "WebDriver", Scope = "member", Target = "Selenium.Internal.SeleniumEmulation.JavaScriptLibrary.#ExecuteScript(OpenQA.Selenium.IWebDriver,System.String,System.Object[])", Justification = "WebDriver is correctly spelled")]
