using System.Security.Permissions;
using Microsoft.Win32.SafeHandles;

namespace OpenQA.Selenium.IE
{
    /// <summary>
    /// Handler for the driver
    /// </summary>
    [SecurityPermission(SecurityAction.LinkDemand, Flags = SecurityPermissionFlag.UnmanagedCode)]
    internal class SafeInternetExplorerDriverHandle : SafeHandleZeroOrMinusOneIsInvalid
    {
        /// <summary>
        /// Initializes a new instance of the SafeInternetExplorerDriverHandle class
        /// </summary>
        internal SafeInternetExplorerDriverHandle()
            : base(true)
        {
        }

        /// <summary>
        /// Releases the instance of the Wrapper
        /// </summary>
        /// <returns>True if released</returns>
        protected override bool ReleaseHandle()
        {
            // The reference implementation (Java) ignores return codes
            // from this function call, so we will too.
            NativeDriverLibrary.Instance.FreeDriver(handle);
            return true;
        }
    }
}
