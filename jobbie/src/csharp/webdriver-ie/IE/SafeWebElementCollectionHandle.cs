using System.Security.Permissions;
using Microsoft.Win32.SafeHandles;

namespace OpenQA.Selenium.IE
{
    /// <summary>
    /// Handler for Web Elements in a collection
    /// </summary>
    [SecurityPermission(SecurityAction.LinkDemand, Flags = SecurityPermissionFlag.UnmanagedCode)]
    internal class SafeWebElementCollectionHandle : SafeHandleZeroOrMinusOneIsInvalid
    {
        private bool freeElementsOnDispose;

        /// <summary>
        /// Initializes a new instance of the SafeWebElementCollectionHandle class
        /// </summary>
        public SafeWebElementCollectionHandle()
            : base(true)
        {
        }

        /// <summary>
        /// Gets or sets a value indicating whether it should dispose free elements
        /// </summary>
        public bool FreeElementsOnDispose
        {
            get { return freeElementsOnDispose; }
            set { freeElementsOnDispose = value; }
        }

        /// <summary>
        /// Releases the handle and frees up elements
        /// </summary>
        /// <returns>True if the handle was released</returns>
        protected override bool ReleaseHandle()
        {
            int freeElementsArgument = 0;
            if (FreeElementsOnDispose)
            {
                freeElementsArgument = 1;
            }

            NativeDriverLibrary.Instance.FreeElementCollection(handle, freeElementsArgument);
            return true;
        }
    }
}
