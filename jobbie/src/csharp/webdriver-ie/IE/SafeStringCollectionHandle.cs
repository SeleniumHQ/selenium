using System;
using System.Security.Permissions;
using Microsoft.Win32.SafeHandles;

namespace OpenQA.Selenium.IE
{
    [SecurityPermission(SecurityAction.LinkDemand, Flags = SecurityPermissionFlag.UnmanagedCode)]
    internal class SafeStringCollectionHandle : SafeHandleZeroOrMinusOneIsInvalid
    {
        internal SafeStringCollectionHandle()
            : base(true)
        {
        }

        protected override bool ReleaseHandle()
        {
            // The reference implementation (Java) ignores return codes
            // from this function call, so we will too.
            NativeMethods.wdFreeStringCollection(handle);
            return true;
        }
    }
}
