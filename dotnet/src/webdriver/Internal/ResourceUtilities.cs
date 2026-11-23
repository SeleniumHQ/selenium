// <copyright file="ResourceUtilities.cs" company="Selenium Committers">
// Licensed to the Software Freedom Conservancy (SFC) under one
// or more contributor license agreements.  See the NOTICE file
// distributed with this work for additional information
// regarding copyright ownership.  The SFC licenses this file
// to you under the Apache License, Version 2.0 (the
// "License"); you may not use this file except in compliance
// with the License.  You may obtain a copy of the License at
//
//   http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing,
// software distributed under the License is distributed on an
// "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
// KIND, either express or implied.  See the License for the
// specific language governing permissions and limitations
// under the License.
// </copyright>

#if NET462
using System.Diagnostics;
#endif
using System.Reflection;
using System.Runtime.InteropServices;

namespace OpenQA.Selenium.Internal;

/// <summary>
/// Encapsulates methods for finding and extracting WebDriver resources.
/// </summary>
internal static partial class ResourceUtilities
{
    private static readonly Lazy<string> _productVersion = new(() =>
    {
        Assembly executingAssembly = Assembly.GetExecutingAssembly();
        var assemblyInformationalVersionAttribute = executingAssembly.GetCustomAttribute<AssemblyInformationalVersionAttribute>();
        return assemblyInformationalVersionAttribute?.InformationalVersion ?? "Unknown";
    });

    private static readonly Lazy<string> _platformFamily = new(GetPlatformString);

    /// <summary>
    /// Gets a string representing the informational version of the Selenium product.
    /// </summary>
    public static string ProductVersion => _productVersion.Value;

    /// <summary>
    /// Gets a string representing the platform family on which the Selenium assembly is executing.
    /// </summary>
    public static string PlatformFamily => _platformFamily.Value;

    private static string GetPlatformString()
    {
#if NET462
        // Unfortunately, detecting the currently running platform isn't as
        // straightforward as you might hope.
        // See: http://mono.wikia.com/wiki/Detecting_the_execution_platform
        // and https://msdn.microsoft.com/en-us/library/3a8hyw88(v=vs.110).aspx
        string platformName = "unknown";
        const int PlatformMonoUnixValue = 128;
        PlatformID platformId = Environment.OSVersion.Platform;
        if (platformId == PlatformID.Unix || platformId == PlatformID.MacOSX || (int)platformId == PlatformMonoUnixValue)
        {
            using (Process unameProcess = new Process())
            {
                unameProcess.StartInfo.FileName = "uname";
                unameProcess.StartInfo.UseShellExecute = false;
                unameProcess.StartInfo.RedirectStandardOutput = true;
                unameProcess.Start();
                unameProcess.WaitForExit(1000);
                string output = unameProcess.StandardOutput.ReadToEnd();
                if (output.ToLowerInvariant().StartsWith("darwin"))
                {
                    platformName = "mac";
                }
                else
                {
                    platformName = "linux";
                }
            }
        }
        else if (platformId == PlatformID.Win32NT || platformId == PlatformID.Win32S || platformId == PlatformID.Win32Windows || platformId == PlatformID.WinCE)
        {
            platformName = "windows";
        }
        return platformName;
#else
        if (RuntimeInformation.IsOSPlatform(OSPlatform.Windows))
        {
            return "windows";
        }
        else if (RuntimeInformation.IsOSPlatform(OSPlatform.Linux))
        {
            return "linux";
        }
        else if (RuntimeInformation.IsOSPlatform(OSPlatform.OSX))
        {
            return "mac";
        }
        else
        {
            return "unknown";
        }
#endif
    }
}
