// <copyright file="ResourceUtilities.cs" company="WebDriver Committers">
// Copyright 2007-2011 WebDriver committers
// Copyright 2007-2011 Google Inc.
// Portions copyright 2011 Software Freedom Conservancy
//
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
// </copyright>

using System;
using System.Collections.Generic;
using System.Globalization;
using System.IO;
using System.Reflection;
using System.Text;

namespace OpenQA.Selenium.Internal
{
    /// <summary>
    /// Encapsulates methods for finding and extracting WebDriver resources.
    /// </summary>
    public static class ResourceUtilities
    {
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
            Assembly executingAssembly = Assembly.GetCallingAssembly();
            string currentDirectory = executingAssembly.Location;

            // If we're shadow copying, fiddle with 
            // the codebase instead 
            if (AppDomain.CurrentDomain.ShadowCopyFiles)
            {
                Uri uri = new Uri(executingAssembly.CodeBase);
                currentDirectory = uri.LocalPath;
            }

            string resourceFilePath = Path.Combine(Path.GetDirectoryName(currentDirectory), Path.GetFileName(fileName));
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

                resourceStream = executingAssembly.GetManifestResourceStream(resourceId);
            }

            if (resourceStream == null)
            {
                throw new WebDriverException(string.Format(CultureInfo.InvariantCulture, "Cannot find a file named '{0}' or an embedded resource with the id '{1}'.", resourceFilePath, resourceId));
            }

            return resourceStream;
        }
    }
}
