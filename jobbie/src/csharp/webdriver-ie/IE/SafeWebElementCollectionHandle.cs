using System;
using System.Security.Permissions;
using Microsoft.Win32.SafeHandles;

namespace OpenQA.Selenium.IE
{
    [SecurityPermission(SecurityAction.LinkDemand, Flags = SecurityPermissionFlag.UnmanagedCode)]
    internal class SafeWebElementCollectionHandle : SafeHandleZeroOrMinusOneIsInvalid
    {
        private bool freeElementsOnDispose;

        public SafeWebElementCollectionHandle()
            : base(true)
        {
        }

        public bool FreeElementsOnDispose
        {
            get { return freeElementsOnDispose; }
            set { freeElementsOnDispose = value; }
        }

        protected override bool ReleaseHandle()
        {
            int freeElementsArgument = 0;
            if (FreeElementsOnDispose)
            {
                freeElementsArgument = 1;
            }

            NativeMethods.wdFreeElementCollection(handle, freeElementsArgument);
            return true;
        }
    }
}
