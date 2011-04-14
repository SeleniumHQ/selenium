// This file is used by Code Analysis to maintain SuppressMessage 
// attributes that are applied to this project. 
// Project-level suppressions either have no target or are given 
// a specific target and scoped to a namespace, type, member, etc. 
//
// To add a suppression to this file, right-click the message in the 
// Error List, point to "Suppress Message(s)", and click 
// "In Project Suppression File". 
// You do not need to add suppressions to this file manually. 

[assembly: System.Diagnostics.CodeAnalysis.SuppressMessage("Microsoft.Naming", "CA1704:IdentifiersShouldBeSpelledCorrectly", MessageId = "Firefox", Scope = "member", Target = "OpenQA.Selenium.Remote.DesiredCapabilities.#Firefox()", Justification = "Firefox is correctly spelled")]
[assembly: System.Diagnostics.CodeAnalysis.SuppressMessage("Microsoft.Naming", "CA1704:IdentifiersShouldBeSpelledCorrectly", MessageId = "Json", Scope = "member", Target = "OpenQA.Selenium.Remote.Command.#ParametersAsJsonString", Justification = "JSON is correctly spelled")]
[assembly: System.Diagnostics.CodeAnalysis.SuppressMessage("Microsoft.Naming", "CA1704:IdentifiersShouldBeSpelledCorrectly", MessageId = "json", Scope = "member", Target = "OpenQA.Selenium.Remote.Command.#.ctor(OpenQA.Selenium.Remote.DriverCommand,System.String)", Justification = "JSON is correctly spelled")]
[assembly: System.Diagnostics.CodeAnalysis.SuppressMessage("Microsoft.Naming", "CA1704:IdentifiersShouldBeSpelledCorrectly", MessageId = "Json", Scope = "member", Target = "OpenQA.Selenium.Remote.Response.#ToJson()", Justification = "JSON is correctly spelled")]
[assembly: System.Diagnostics.CodeAnalysis.SuppressMessage("Microsoft.Naming", "CA1704:IdentifiersShouldBeSpelledCorrectly", MessageId = "Json", Scope = "member", Target = "OpenQA.Selenium.Remote.Response.#FromJson(System.String)", Justification = "JSON is correctly spelled")]
[assembly: System.Diagnostics.CodeAnalysis.SuppressMessage("Microsoft.Naming", "CA1704:IdentifiersShouldBeSpelledCorrectly", MessageId = "Rotatable", Scope = "member", Target = "OpenQA.Selenium.Remote.CapabilityType.#Rotatable", Justification = "Rotatable is correctly spelled")]
[assembly: System.Diagnostics.CodeAnalysis.SuppressMessage("Microsoft.Usage", "CA2234:PassSystemUriObjectsInsteadOfStrings", Scope = "member", Target = "OpenQA.Selenium.Remote.CommandInfo.#CreateWebRequest(System.Uri,OpenQA.Selenium.Remote.Command)", Justification = "String parameter is a relative URI built from components. This should be OK here.")]
[assembly: System.Diagnostics.CodeAnalysis.SuppressMessage("Microsoft.Performance", "CA1819:PropertiesShouldNotReturnArrays", Scope = "member", Target = "OpenQA.Selenium.Remote.ErrorResponse.#StackTrace", Justification = "Property returns an array by design")]
