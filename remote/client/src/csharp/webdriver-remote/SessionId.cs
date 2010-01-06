using System;
using System.Collections.Generic;
using System.Text;

namespace OpenQA.Selenium.Remote
{
    public class SessionId
    {
        private string sessionOpaqueKey;

        public SessionId(string opaqueKey)
        {
            sessionOpaqueKey = opaqueKey;
        }

        public override string ToString()
        {
            return sessionOpaqueKey;
        }

        public override int GetHashCode()
        {
            return sessionOpaqueKey.GetHashCode();
        }

        public override bool Equals(object obj)
        {
            bool objectsAreEqual = false;
            SessionId other = obj as SessionId;
            if (other != null)
            {
                objectsAreEqual = sessionOpaqueKey.Equals(other.sessionOpaqueKey);
            }
            return objectsAreEqual;
        }
    }
}
