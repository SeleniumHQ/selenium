using System;
using System.Collections.Generic;
using System.Text;

namespace OpenQA.Selenium.Remote
{
    /// <summary>
    /// Holds the information about all commands specified by the JSON wire protocol.
    /// </summary>
    public class CommandInfoRepository
    {
        #region Private members
        private static object lockObject = new object();
        private static CommandInfoRepository collectionInstance;

        private Dictionary<DriverCommand, CommandInfo> commandDictionary;
        #endregion

        #region Constructor
        /// <summary>
        /// Prevents a default instance of the <see cref="CommandInfoRepository"/> class from being created.
        /// </summary>
        private CommandInfoRepository()
        {
            commandDictionary = new Dictionary<DriverCommand, CommandInfo>();
            InitializeCommandDictionary();
        }
        #endregion

        #region Public properties
        /// <summary>
        /// Gets the singleton instance of the <see cref="CommandInfoRepository"/>.
        /// </summary>
        public static CommandInfoRepository Instance
        {
            get
            {
                lock (lockObject)
                {
                    if (collectionInstance == null)
                    {
                        collectionInstance = new CommandInfoRepository();
                    }
                }

                return collectionInstance;
            }
        }
        #endregion

        #region Public methods
        /// <summary>
        /// Gets the <see cref="CommandInfo"/> for a <see cref="DriverCommand"/>.
        /// </summary>
        /// <param name="commandName">The <see cref="DriverCommand"/> for which to get the information.</param>
        /// <returns>The <see cref="CommandInfo"/> for the specified command.</returns>
        public CommandInfo GetCommandInfo(DriverCommand commandName)
        {
            CommandInfo toReturn = null;
            if (commandDictionary.ContainsKey(commandName))
            {
                toReturn = commandDictionary[commandName];
            }

            return toReturn;
        }
        #endregion

        #region Private support methods
        private void InitializeCommandDictionary()
        {
            commandDictionary.Add(DriverCommand.DefineDriverMapping, new CommandInfo(CommandInfo.PostCommand, "/config/drivers"));
            commandDictionary.Add(DriverCommand.NewSession, new CommandInfo(CommandInfo.PostCommand, "/session"));
            commandDictionary.Add(DriverCommand.GetSessionCapabilities, new CommandInfo(CommandInfo.GetCommand, "/session/{sessionId}"));
            commandDictionary.Add(DriverCommand.Quit, new CommandInfo(CommandInfo.DeleteCommand, "/session/{sessionId}"));
            commandDictionary.Add(DriverCommand.GetCurrentWindowHandle, new CommandInfo(CommandInfo.GetCommand, "/session/{sessionId}/window_handle"));
            commandDictionary.Add(DriverCommand.GetWindowHandles, new CommandInfo(CommandInfo.GetCommand, "/session/{sessionId}/window_handles"));
            commandDictionary.Add(DriverCommand.GetCurrentUrl, new CommandInfo(CommandInfo.GetCommand, "/session/{sessionId}/url"));
            commandDictionary.Add(DriverCommand.Get, new CommandInfo(CommandInfo.PostCommand, "/session/{sessionId}/url"));
            commandDictionary.Add(DriverCommand.GoForward, new CommandInfo(CommandInfo.PostCommand, "/session/{sessionId}/forward"));
            commandDictionary.Add(DriverCommand.GoBack, new CommandInfo(CommandInfo.PostCommand, "/session/{sessionId}/back"));
            commandDictionary.Add(DriverCommand.Refresh, new CommandInfo(CommandInfo.PostCommand, "/session/{sessionId}/refresh"));
            commandDictionary.Add(DriverCommand.GetSpeed, new CommandInfo(CommandInfo.GetCommand, "/session/{sessionId}/speed"));
            commandDictionary.Add(DriverCommand.SetSpeed, new CommandInfo(CommandInfo.PostCommand, "/session/{sessionId}/speed"));
            commandDictionary.Add(DriverCommand.ExecuteScript, new CommandInfo(CommandInfo.PostCommand, "/session/{sessionId}/execute"));
            commandDictionary.Add(DriverCommand.Screenshot, new CommandInfo(CommandInfo.GetCommand, "/session/{sessionId}/screenshot"));
            commandDictionary.Add(DriverCommand.SwitchToFrame, new CommandInfo(CommandInfo.PostCommand, "/session/{sessionId}/frame"));
            commandDictionary.Add(DriverCommand.SwitchToWindow, new CommandInfo(CommandInfo.PostCommand, "/session/{sessionId}/window"));
            commandDictionary.Add(DriverCommand.GetAllCookies, new CommandInfo(CommandInfo.GetCommand, "/session/{sessionId}/cookie"));
            commandDictionary.Add(DriverCommand.AddCookie, new CommandInfo(CommandInfo.PostCommand, "/session/{sessionId}/cookie"));
            commandDictionary.Add(DriverCommand.DeleteAllCookies, new CommandInfo(CommandInfo.DeleteCommand, "/session/{sessionId}/cookie"));
            commandDictionary.Add(DriverCommand.DeleteCookie, new CommandInfo(CommandInfo.DeleteCommand, "/session/{sessionId}/cookie/{name}"));
            commandDictionary.Add(DriverCommand.GetPageSource, new CommandInfo(CommandInfo.GetCommand, "/session/{sessionId}/source"));
            commandDictionary.Add(DriverCommand.GetTitle, new CommandInfo(CommandInfo.GetCommand, "/session/{sessionId}/title"));
            commandDictionary.Add(DriverCommand.FindElement, new CommandInfo(CommandInfo.PostCommand, "/session/{sessionId}/element"));
            commandDictionary.Add(DriverCommand.FindElements, new CommandInfo(CommandInfo.PostCommand, "/session/{sessionId}/elements"));
            commandDictionary.Add(DriverCommand.GetActiveElement, new CommandInfo(CommandInfo.PostCommand, "/session/{sessionId}/element/active"));
            commandDictionary.Add(DriverCommand.FindChildElement, new CommandInfo(CommandInfo.PostCommand, "/session/{sessionId}/element/{id}/element"));
            commandDictionary.Add(DriverCommand.FindChildElements, new CommandInfo(CommandInfo.PostCommand, "/session/{sessionId}/element/{id}/elements"));
            commandDictionary.Add(DriverCommand.DescribeElement, new CommandInfo(CommandInfo.GetCommand, "/session/{sessionId}/element/{id}"));
            commandDictionary.Add(DriverCommand.ClickElement, new CommandInfo(CommandInfo.PostCommand, "/session/{sessionId}/element/{id}/click"));
            commandDictionary.Add(DriverCommand.GetElementText, new CommandInfo(CommandInfo.GetCommand, "/session/{sessionId}/element/{id}/text"));
            commandDictionary.Add(DriverCommand.SubmitElement, new CommandInfo(CommandInfo.PostCommand, "/session/{sessionId}/element/{id}/submit"));
            commandDictionary.Add(DriverCommand.GetElementValue, new CommandInfo(CommandInfo.GetCommand, "/session/{sessionId}/element/{id}/value"));
            commandDictionary.Add(DriverCommand.SendKeysToElement, new CommandInfo(CommandInfo.PostCommand, "/session/{sessionId}/element/{id}/value"));
            commandDictionary.Add(DriverCommand.GetElementTagName, new CommandInfo(CommandInfo.GetCommand, "/session/{sessionId}/element/{id}/name"));
            commandDictionary.Add(DriverCommand.ClearElement, new CommandInfo(CommandInfo.PostCommand, "/session/{sessionId}/element/{id}/clear"));
            commandDictionary.Add(DriverCommand.IsElementSelected, new CommandInfo(CommandInfo.GetCommand, "/session/{sessionId}/element/{id}/selected"));
            commandDictionary.Add(DriverCommand.SetElementSelected, new CommandInfo(CommandInfo.PostCommand, "/session/{sessionId}/element/{id}/selected"));
            commandDictionary.Add(DriverCommand.ToggleElement, new CommandInfo(CommandInfo.PostCommand, "/session/{sessionId}/element/{id}/toggle"));
            commandDictionary.Add(DriverCommand.IsElementEnabled, new CommandInfo(CommandInfo.GetCommand, "/session/{sessionId}/element/{id}/enabled"));
            commandDictionary.Add(DriverCommand.IsElementDisplayed, new CommandInfo(CommandInfo.GetCommand, "/session/{sessionId}/element/{id}/displayed"));
            commandDictionary.Add(DriverCommand.GetElementLocation, new CommandInfo(CommandInfo.GetCommand, "/session/{sessionId}/element/{id}/location"));
            commandDictionary.Add(DriverCommand.GetElementLocationOnceScrolledIntoView, new CommandInfo(CommandInfo.GetCommand, "/session/{sessionId}/element/{id}/location_in_view"));
            commandDictionary.Add(DriverCommand.GetElementSize, new CommandInfo(CommandInfo.GetCommand, "/session/{sessionId}/element/{id}/size"));
            commandDictionary.Add(DriverCommand.GetElementValueOfCssProperty, new CommandInfo(CommandInfo.GetCommand, "/session/{sessionId}/element/{id}/css/{propertyName}"));
            commandDictionary.Add(DriverCommand.GetElementAttribute, new CommandInfo(CommandInfo.GetCommand, "/session/{sessionId}/element/{id}/attribute/{name}"));
            commandDictionary.Add(DriverCommand.ElementEquals, new CommandInfo(CommandInfo.GetCommand, "/session/{sessionId}/element/{id}/equals/{other}"));
            commandDictionary.Add(DriverCommand.HoverOverElement, new CommandInfo(CommandInfo.PostCommand, "/session/{sessionId}/element/{id}/hover"));
            commandDictionary.Add(DriverCommand.DragElement, new CommandInfo(CommandInfo.PostCommand, "/session/{sessionId}/element/{id}/drag"));
            commandDictionary.Add(DriverCommand.Close, new CommandInfo(CommandInfo.DeleteCommand, "/session/{sessionId}/window"));
            commandDictionary.Add(DriverCommand.SetBrowserVisible, new CommandInfo(CommandInfo.PostCommand, "/session/{sessionId}/visible"));
            commandDictionary.Add(DriverCommand.IsBrowserVisible, new CommandInfo(CommandInfo.GetCommand, "/session/{sessionId}/visible"));
            commandDictionary.Add(DriverCommand.ImplicitlyWait, new CommandInfo(CommandInfo.PostCommand, "/session/{sessionId}/timeouts/implicit_wait"));
        }
        #endregion
    }
}
