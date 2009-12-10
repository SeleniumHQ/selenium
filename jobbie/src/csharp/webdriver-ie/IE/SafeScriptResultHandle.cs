using System;
using System.Security.Permissions;
using Microsoft.Win32.SafeHandles;

namespace OpenQA.Selenium.IE
{
    [SecurityPermission(SecurityAction.LinkDemand, Flags = SecurityPermissionFlag.UnmanagedCode)]
    internal class SafeScriptResultHandle : SafeHandleZeroOrMinusOneIsInvalid
    {
        internal SafeScriptResultHandle()
            : base(true)
        {
        }

        protected override bool ReleaseHandle()
        {
            NativeMethods.wdFreeScriptResult(handle);
            return true;
        }
    }
}
