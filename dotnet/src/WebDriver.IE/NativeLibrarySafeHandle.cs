using System;
using System.Collections.Generic;
using System.Runtime.InteropServices;
using System.Security.Permissions;
using System.Text;
using Microsoft.Win32.SafeHandles;

namespace OpenQA.Selenium.IE
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
