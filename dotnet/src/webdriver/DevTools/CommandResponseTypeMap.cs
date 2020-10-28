namespace OpenQA.Selenium.DevTools
{
    using System;
    using System.Collections.Generic;

    public class CommandResponseTypeMap
    {
        private readonly IDictionary<Type, Type> commandResponseTypeDictionary = new Dictionary<Type, Type>();

        public void AddCommandResponseType(Type commandSettingsType, Type commandResponseType)
        {
            if (!commandResponseTypeDictionary.ContainsKey(commandSettingsType))
            {
                commandResponseTypeDictionary.Add(commandSettingsType, commandResponseType);
            }
        }

        /// <summary>
        /// Gets the command response type corresponding to the specified command type
        /// </summary>
        public bool TryGetCommandResponseType<T>(out Type commandResponseType)
            where T : ICommand
        {
            return commandResponseTypeDictionary.TryGetValue(typeof(T), out commandResponseType);
        }
    }
}