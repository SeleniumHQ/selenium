namespace OpenQA.Selenium.Remote
{
    /// <summary>
    /// Provides a way to send commands to the remote server
    /// </summary>
    public interface ICommandExecutor
    {
        /// <summary>
        /// Executes a command
        /// </summary>
        /// <param name="commandToExecute">The command you wish to execute</param>
        /// <returns>A response from the browser</returns>
        Response Execute(Command commandToExecute);
    }
}
