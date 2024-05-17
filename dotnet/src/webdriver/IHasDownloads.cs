// <copyright file="IHasDownloads.cs" company="WebDriver Committers">
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

using System.Collections.Generic;

namespace OpenQA.Selenium
{
    /// <summary>
    /// Interface indicating the driver can handle downloading remote files.
    /// </summary>
    public interface IHasDownloads
    {
        /// <summary>
        /// Retrieves the downloadable files.
        /// </summary>
        /// <returns>A read-only list of file names available for download.</returns>
        IReadOnlyList<string> GetDownloadableFiles();

        /// <summary>
        /// Downloads a file with the specified file name and returns a dictionary containing the downloaded file's data.
        /// </summary>
        /// <param name="fileName">The name of the file to be downloaded.</param>
        /// <param name="targetDirectory">The location to save the downloaded file.</param>
        void DownloadFile(string fileName, string targetDirectory);

        /// <summary>
        /// Deletes the downloadable files.
        /// </summary>
        void DeleteDownloadableFiles();
    }
}
