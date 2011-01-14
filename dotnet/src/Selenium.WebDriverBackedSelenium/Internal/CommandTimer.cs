using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using Selenium.Internal.SeleniumEmulation;
using OpenQA.Selenium;
using System.Threading;

namespace Selenium.Internal
{
    internal class CommandTimer
    {
        private int timeout;
        private object commandResult = null;
        private SeleneseCommand command;
        private IWebDriver driver;
        private string[] args;

        public CommandTimer(int timeout)
        {
            this.timeout = timeout;
        }

        public int Timeout
        {
            get { return timeout; }
            set { timeout = value; }
        }

        public object Execute(SeleneseCommand command, IWebDriver driver, string[] args)
        {
            this.command = command;
            this.driver = driver;
            this.args = args;
            Thread executionThread = new Thread(RunCommand);
            executionThread.Start();
            executionThread.Join(timeout);
            if (executionThread.IsAlive)
            {
                throw new SeleniumException("Timed out running command");
            }

            return commandResult;
        }

        private void RunCommand()
        {
            commandResult = command.Apply(driver, args);
        }
    }
}
