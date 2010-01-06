using System;
using System.Collections.Generic;
using System.Text;

namespace OpenQA.Selenium.Remote
{
    public interface ICommandExecutor
    {
        Response Execute(Command commandToExecute);
    }
}
