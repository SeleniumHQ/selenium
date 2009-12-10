using System;
using System.Security.Permissions;
using Microsoft.Win32.SafeHandles;

namespace OpenQA.Selenium.IE
{
    [SecurityPermission(SecurityAction.LinkDemand, Flags = SecurityPermissionFlag.UnmanagedCode)]
    internal class SafeStringWrapperHandle : SafeHandleZeroOrMinusOneIsInvalid
    {
        internal SafeStringWrapperHandle()
            : base(true)
        {
        }

        protected override bool ReleaseHandle()
        {
            // The reference implementation (Java) ignores return codes
            // from this function call, so we will too.
            NativeMethods.wdFreeString(handle);
            return true;
        }
    }
}
