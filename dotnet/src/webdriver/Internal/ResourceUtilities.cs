// <copyright file="ResourceUtilities.cs" company="WebDriver Committers">
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

using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Globalization;
using System.IO;
using System.Reflection;
using System.Runtime.InteropServices;

namespace OpenQA.Selenium.Internal
{
    /// <summary>
    /// Encapsulates methods for finding and extracting WebDriver resources.
    /// </summary>
    public static class ResourceUtilities
    {
        private static string assemblyVersion;
        private static string platformFamily;

        /// <summary>
        /// Gets a string representing the version of the Selenium assembly.
        /// </summary>
        public static string AssemblyVersion
        {
            get
            {
                if (string.IsNullOrEmpty(assemblyVersion))
                {
                    Assembly executingAssembly = Assembly.GetCallingAssembly();
                    Version versionResource = executingAssembly.GetName().Version;
                    assemblyVersion = string.Format(CultureInfo.InvariantCulture, "{0}.{1}.{2}", versionResource.Major, versionResource.Minor, versionResource.Revision);
                }

                return assemblyVersion;
            }
        }

        /// <summary>
        /// Gets a string representing the platform family on which the Selenium assembly is executing.
        /// </summary>
        public static string PlatformFamily
        {
            get
            {
                if (string.IsNullOrEmpty(platformFamily))
                {
                    platformFamily = GetPlatformString();
                }

                return platformFamily;
            }
        }

        /// <summary>
        /// Gets a <see cref="Stream"/> that contains the resource to use.
        /// </summary>
        /// <param name="fileName">A file name in the file system containing the resource to use.</param>
        /// <param name="resourceId">A string representing the resource name embedded in the
        /// executing assembly, if it is not found in the file system.</param>
        /// <returns>A Stream from which the resource can be read.</returns>
        /// <exception cref="WebDriverException">Thrown if neither the file nor the embedded resource can be found.</exception>
        /// <remarks>
        /// The GetResourceStream method searches for the specified resource using the following
        /// algorithm:
        /// <para>
        /// <list type="numbered">
        /// <item>In the same directory as the calling assembly.</item>
        /// <item>In the full path specified by the <paramref name="fileName"/> argument.</item>
        /// <item>Inside the calling assembly as an embedded resource.</item>
        /// </list>
        /// </para>
        /// </remarks>
        public static Stream GetResourceStream(string fileName, string resourceId)
        {
            Stream resourceStream = null;
            string resourceFilePath = Path.Combine(FileUtilities.GetCurrentDirectory(), Path.GetFileName(fileName));
            if (File.Exists(resourceFilePath))
            {
                resourceStream = new FileStream(resourceFilePath, FileMode.Open, FileAccess.Read);
            }
            else if (File.Exists(fileName))
            {
                resourceStream = new FileStream(fileName, FileMode.Open, FileAccess.Read);
            }
            else
            {
                if (string.IsNullOrEmpty(resourceId))
                {
                    throw new WebDriverException("The file specified does not exist, and you have specified no internal resource ID");
                }

                Assembly executingAssembly = Assembly.GetCallingAssembly();
                resourceStream = executingAssembly.GetManifestResourceStream(resourceId);
            }

            if (resourceStream == null)
            {
                throw new WebDriverException(string.Format(CultureInfo.InvariantCulture, "Cannot find a file named '{0}' or an embedded resource with the id '{1}'.", resourceFilePath, resourceId));
            }

            return resourceStream;
        }

        /// <summary>
        /// Returns a value indicating whether a resource exists with the specified ID.
        /// </summary>
        /// <param name="resourceId">ID of the embedded resource to check for.</param>
        /// <returns><see langword="true"/> if the resource exists in the calling assembly; otherwise <see langword="false"/>.</returns>
        public static bool IsValidResourceName(string resourceId)
        {
            Assembly executingAssembly = Assembly.GetCallingAssembly();
            List<string> resourceNames = new List<string>(executingAssembly.GetManifestResourceNames());
            return resourceNames.Contains(resourceId);
        }

        private static string GetPlatformString()
        {
            string platformName = "unknown";
#if NETSTANDARD2_0 || NETCOREAPP2_0
            if (RuntimeInformation.IsOSPlatform(OSPlatform.Windows))
            {
                platformName = "windows";
            }
            else if (RuntimeInformation.IsOSPlatform(OSPlatform.Linux))
            {
                platformName = "linux";
            }
            else if (RuntimeInformation.IsOSPlatform(OSPlatform.OSX))
            {
                platformName = "mac";
            }
#else
            // Unfortunately, detecting the currently running platform isn't as
            // straightforward as you might hope.
            // See: http://mono.wikia.com/wiki/Detecting_the_execution_platform
            // and https://msdn.microsoft.com/en-us/library/3a8hyw88(v=vs.110).aspx
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
#endif
            return platformName;
        }
    }
}
