using System;
using System.Collections.Generic;
using System.Text;

namespace OpenQA.Selenium.Firefox
{
    internal interface IExtensionConnection
    {
        bool IsConnected { get; }
        Response SendMessageAndWaitForResponse(Type throwOnFailure, Command command);
        void Quit();
    }
}
