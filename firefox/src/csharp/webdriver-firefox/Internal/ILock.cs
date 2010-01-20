using System;
using System.Collections.Generic;
using System.Text;

namespace OpenQA.Selenium.Firefox.Internal
{
    /// <summary>
    /// Defines the interface through which the mutex port for establishing communication 
    /// with the WebDriver extension can be locked.
    /// </summary>
    internal interface ILock : IDisposable
    {
        /// <summary>
        /// Locks the mutex port.
        /// </summary>
        /// <param name="timeoutInMilliseconds">The amount of time (in milliseconds) to wait for 
        /// the mutex port to become available.</param>
        void LockObject(long timeoutInMilliseconds);

        /// <summary>
        /// Unlocks the mutex port.
        /// </summary>
        void UnlockObject();
    }
}
