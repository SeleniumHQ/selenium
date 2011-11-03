// <copyright file="NativeLibrarySafeHandle.cs" company="WebDriver Committers">
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
using System.Runtime.InteropServices;
using System.Security.Permissions;
using System.Text;
using Microsoft.Win32.SafeHandles;

namespace OpenQA.Selenium
{
    /// <summary>
    /// Represents a wrapper class for the handle to a native library.
    /// </summary>
    [SecurityPermission(SecurityAction.LinkDemand, UnmanagedCode = true)]
    internal class NativeLibrarySafeHandle : SafeHandleZeroOrMinusOneIsInvalid
    {
        /// <summary>
        /// Initializes a new instance of the <see cref="NativeLibrarySafeHandle"/> class.
        /// </summary>
        public NativeLibrarySafeHandle()
            : base(true)
        {
        }

        /// <summary>
        /// Releases the native library handle.
        /// </summary>
        /// <returns><see langword="true"/> if the library was released, otherwise <see langword="false"/>.</returns>
        /// <remarks>The handle is released by calling the FreeLibrary API.</remarks>
        protected override bool ReleaseHandle()
        {
            bool free = NativeMethods.FreeLibrary(this.handle);
            return free;
        }
    }
}
