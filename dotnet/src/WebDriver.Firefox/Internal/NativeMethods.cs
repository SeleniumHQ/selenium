using System;
using System.Collections.Generic;
using System.Runtime.InteropServices;
using System.Text;

namespace OpenQA.Selenium.Firefox.Internal
{
    /// <summary>
    /// Provides access to platform-specific operations.
    /// </summary>
    /// <remarks>TODO (JimEvans): Need to handle non-Windows platforms for socket inheritance.</remarks>
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
