using System;
using System.Collections.Generic;
using System.Text;

namespace OpenQA.Selenium.Firefox.Internal
{
    internal interface ILock : IDisposable
    {
        void LockObject(long timeoutInMilliseconds);
        void UnlockObject();
    }
}
