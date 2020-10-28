using System;
using System.Collections.Generic;
using System.Text;

namespace OpenQA.Selenium.DevTools
{
    public abstract class DevToolsSessionDomains
    {
        private CommandResponseTypeMap responseTypeMap = new CommandResponseTypeMap();

        protected DevToolsSessionDomains()
        {
            this.PopulateCommandResponseTypeMap();
        }

        public CommandResponseTypeMap ResponseTypeMap => this.responseTypeMap;

        protected abstract void PopulateCommandResponseTypeMap();
    }
}
