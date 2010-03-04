using System.Security.Permissions;
using Microsoft.Win32.SafeHandles;

namespace OpenQA.Selenium.IE
{
    /// <summary>
    /// Handler for script results
    /// </summary>
    [SecurityPermission(SecurityAction.LinkDemand, Flags = SecurityPermissionFlag.UnmanagedCode)]
    internal class SafeScriptResultHandle : SafeHandleZeroOrMinusOneIsInvalid
    {
        /// <summary>
        /// Initializes a new instance of the SafeScriptResultHandle class
        /// </summary>
        internal SafeScriptResultHandle()
            : base(true)
        {
        }

        /// <summary>
        /// Releases the instance of the handle
        /// </summary>
        /// <returns>True if released</returns>
        protected override bool ReleaseHandle()
        {
            NativeDriverLibrary.Instance.FreeScriptResult(handle);
            return true;
        }
    }
}
