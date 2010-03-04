using System.Security.Permissions;
using Microsoft.Win32.SafeHandles;

namespace OpenQA.Selenium.IE
{
    /// <summary>
    /// Wrapper for Native strings in a collection from the driver
    /// </summary>
    [SecurityPermission(SecurityAction.LinkDemand, Flags = SecurityPermissionFlag.UnmanagedCode)]
    internal class SafeStringCollectionHandle : SafeHandleZeroOrMinusOneIsInvalid
    {
        /// <summary>
        /// Initializes a new instance of the SafeStringCollectionHandle class
        /// </summary>
        internal SafeStringCollectionHandle()
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
            NativeDriverLibrary.Instance.FreeStringCollection(handle);
            return true;
        }
    }
}
