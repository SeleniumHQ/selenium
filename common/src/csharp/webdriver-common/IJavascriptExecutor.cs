using System;
using System.Collections.Generic;
using System.Text;

namespace OpenQa.Selenium
{
    public interface IJavascriptExecutor
    {
        Object ExecuteScript(String script, params Object[] args);
    }
}
