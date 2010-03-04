using System.Security.Permissions;
using Microsoft.Win32.SafeHandles;

namespace OpenQA.Selenium.IE
{
    /// <summary>
    /// Handler for script arguments
    /// </summary>
    [SecurityPermission(SecurityAction.LinkDemand, Flags = SecurityPermissionFlag.UnmanagedCode)]
    internal class SafeScriptArgsHandle : SafeHandleZeroOrMinusOneIsInvalid
    {
        /// <summary>
        /// Initializes a new instance of the SafeScriptArgsHandle class
        /// </summary>
        internal SafeScriptArgsHandle()
            : base(true)
        {
        }

        /// <summary>
        /// Releases the instance of the handle
        /// </summary>
        /// <returns>True if released</returns>
        protected override bool ReleaseHandle()
        {
            NativeDriverLibrary.Instance.FreeScriptArgs(handle);
            return true;
        }
    }
}
