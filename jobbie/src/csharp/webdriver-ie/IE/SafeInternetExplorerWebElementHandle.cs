using System.Security.Permissions;
using Microsoft.Win32.SafeHandles;

namespace OpenQA.Selenium.IE
{
    /// <summary>
    /// Handler for script for Internet Explorer Elements
    /// </summary>
    [SecurityPermission(SecurityAction.LinkDemand, Flags = SecurityPermissionFlag.UnmanagedCode)]
    internal class SafeInternetExplorerWebElementHandle : SafeHandleZeroOrMinusOneIsInvalid
    {
        /// <summary>
        /// Initializes a new instance of the SafeInternetExplorerWebElementHandle class
        /// </summary>
        internal SafeInternetExplorerWebElementHandle()
            : base(true)
        {
        }

        /// <summary>
        /// Releases the instance of the handle
        /// </summary>
        /// <returns>True if released</returns>
        protected override bool ReleaseHandle()
        {
            // The reference implementation (Java) ignores return codes
            // from this function call, so we will too.
            NativeDriverLibrary.Instance.FreeElement(handle);
            return true;
        }
    }
}
