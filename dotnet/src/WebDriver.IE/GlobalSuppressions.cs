// This file is used by Code Analysis to maintain SuppressMessage 
// attributes that are applied to this project. 
// Project-level suppressions either have no target or are given 
// a specific target and scoped to a namespace, type, member, etc. 
//
// To add a suppression to this file, right-click the message in the 
// Error List, point to "Suppress Message(s)", and click 
// "In Project Suppression File". 
// You do not need to add suppressions to this file manually. 
[assembly: System.Diagnostics.CodeAnalysis.SuppressMessage("Microsoft.Design", "CA1020:AvoidNamespacesWithFewTypes", Scope = "namespace", Target = "OpenQA.Selenium.IE", Justification = "Namespace is correctly restricted to IE-specific classes.")]
[assembly: System.Diagnostics.CodeAnalysis.SuppressMessage("Microsoft.Security", "CA2122:DoNotIndirectlyExposeMethodsWithLinkDemands", Scope = "member", Target = "OpenQA.Selenium.IE.NativeDriverLibrary.#Dispose(System.Boolean)", Justification = "Avoid the performance hit of a full demand.")]
[assembly: System.Diagnostics.CodeAnalysis.SuppressMessage("Microsoft.Security", "CA2122:DoNotIndirectlyExposeMethodsWithLinkDemands", Scope = "member", Target = "OpenQA.Selenium.IE.NativeDriverLibrary.#LoadNativeLibrary()", Justification = "Avoid the performance hit of a full demand.")]
[assembly: System.Diagnostics.CodeAnalysis.SuppressMessage("Microsoft.Security", "CA2122:DoNotIndirectlyExposeMethodsWithLinkDemands", Scope = "member", Target = "OpenQA.Selenium.IE.NativeDriverLibrary.#StartServer(System.Int32)", Justification = "Avoid the performance hit of a full demand.")]
[assembly: System.Diagnostics.CodeAnalysis.SuppressMessage("Microsoft.Security", "CA2122:DoNotIndirectlyExposeMethodsWithLinkDemands", Scope = "member", Target = "OpenQA.Selenium.IE.NativeDriverLibrary.#UnloadNativeLibrary()", Justification = "Avoid the performance hit of a full demand.")]
