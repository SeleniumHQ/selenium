using System;
using System.Collections.Generic;
using System.Text;
using System.Threading;
using OpenQA.Selenium;
using Selenium.Internal.SeleniumEmulation;

namespace Selenium.Internal
{
    /// <summary>
    /// Provides a timer for running SeleneseCommands
    /// </summary>
    internal class CommandTimer
    {
        private int timeout;
        private object commandResult;
        private SeleneseCommand command;
        private IWebDriver driver;
        private string[] args;
        private SeleniumException thrownException;

        /// <summary>
        /// Initializes a new instance of the <see cref="CommandTimer"/> class.
        /// </summary>
        /// <param name="timeout">The timeout, in milliseconds, of the command.</param>
        public CommandTimer(int timeout)
        {
            this.timeout = timeout;
        }

        /// <summary>
        /// Gets or sets the timeout for running the command, in milliseconds.
        /// </summary>
        public int Timeout
        {
            get { return this.timeout; }
            set { this.timeout = value; }
        }

        /// <summary>
        /// Executes a command.
        /// </summary>
        /// <param name="commandToExecute">The <see cref="SeleneseCommand"/> to execute.</param>
        /// <param name="commandDriver">The <see cref="IWebDriver"/> to use in executing the command.</param>
        /// <param name="commandArguments">An array of strings containng the command arguments.</param>
        /// <returns>The result of the command.</returns>
        /// <remarks>This method executes the command on a separate thread.</remarks>
        public object Execute(SeleneseCommand commandToExecute, IWebDriver commandDriver, string[] commandArguments)
        {
            this.thrownException = null;
            this.command = commandToExecute;
            this.driver = commandDriver;
            this.args = commandArguments;
            Thread executionThread = new Thread(this.RunCommand);
            executionThread.Start();
            executionThread.Join(this.timeout);
            if (executionThread.IsAlive)
            {
                throw new SeleniumException("Timed out running command");
            }

            if (this.thrownException != null)
            {
                throw this.thrownException;
            }

            return this.commandResult;
        }

        private void RunCommand()
        {
            try
            {
                this.commandResult = this.command.Apply(this.driver, this.args);
            }
            catch (SeleniumException e)
            {
                this.thrownException = e;
            }
        }
    }
}
