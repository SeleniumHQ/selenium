using System.Security.Permissions;
using Microsoft.Win32.SafeHandles;

namespace OpenQA.Selenium.IE
{
    /// <summary>
    /// Wrapper for Native strings from the driver
    /// </summary>
    [SecurityPermission(SecurityAction.LinkDemand, Flags = SecurityPermissionFlag.UnmanagedCode)]
    internal class SafeStringWrapperHandle : SafeHandleZeroOrMinusOneIsInvalid
    {
        /// <summary>
        /// Initializes a new instance of the SafeStringWrapperHandle class
        /// </summary>
        internal SafeStringWrapperHandle()
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
            if (!IsInvalid)
            {
                NativeDriverLibrary.Instance.FreeString(handle);
            }

            return true;
        }
    }
}
