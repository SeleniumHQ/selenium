using System;
using System.Collections.Generic;
using System.Text;

namespace OpenQA.Selenium.Firefox.Internal
{
    internal interface ILock
    {
        void LockObject(long timeoutInMilliseconds);
        void UnlockObject();
    }
}
