using System;
using System.Security.Permissions;
using Microsoft.Win32.SafeHandles;

namespace OpenQA.Selenium.IE
{
    [SecurityPermission(SecurityAction.LinkDemand, Flags = SecurityPermissionFlag.UnmanagedCode)]
    internal class SafeScriptArgsHandle : SafeHandleZeroOrMinusOneIsInvalid
    {
        internal SafeScriptArgsHandle()
            : base(true)
        {
        }

        protected override bool ReleaseHandle()
        {
            NativeMethods.wdFreeScriptArgs(handle);
            return true;
        }
    }
}
