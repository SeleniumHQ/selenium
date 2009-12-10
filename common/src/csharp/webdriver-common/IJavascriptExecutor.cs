using System;
using System.Collections.Generic;
using System.Text;

namespace OpenQA.Selenium
{
    public interface IJavaScriptExecutor
    {
        object ExecuteScript(string script, params object[] args);
    }
}
