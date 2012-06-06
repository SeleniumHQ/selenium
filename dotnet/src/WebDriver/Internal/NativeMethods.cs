// <copyright file="NativeMethods.cs" company="WebDriver Committers">
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
using System.Runtime.ConstrainedExecution;
using System.Runtime.InteropServices;
using System.Text;

namespace OpenQA.Selenium
{
    /// <summary>
    /// Provides entry points into needed unmanaged APIs.
    /// </summary>
    internal static class NativeMethods
    {
        /// <summary>
        /// Values for flags for setting information about a native operating system handle.
        /// </summary>
        [Flags]
        internal enum HandleInformation
        {
            /// <summary>
            /// No flags are to be set for the handle.
            /// </summary>
            None = 0,

            /// <summary>
            /// If this flag is set, a child process created with the bInheritHandles 
            /// parameter of CreateProcess set to TRUE will inherit the object handle.
            /// </summary>
            Inherit = 1,

            /// <summary>
            /// If this flag is set, calling the CloseHandle function will not close the 
            /// object handle.
            /// </summary>
            ProtectFromClose = 2
        }

        [DllImport("kernel32")]
        [return: MarshalAs(UnmanagedType.Bool)]
        internal static extern bool SetHandleInformation(IntPtr hObject, HandleInformation dwMask, HandleInformation dwFlags);
    }
}
