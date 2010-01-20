using System;
using System.Collections.Generic;
using System.Text;

namespace OpenQA.Selenium.Firefox
{
    /// <summary>
    /// Provides the context of a <see cref="Command"/> or <see cref="Response"/>.
    /// </summary>
    internal class Context
    {
        #region Private members
        private string contextValue = string.Empty; 
        #endregion

        #region Constructors
        /// <summary>
        /// Initializes a new instance of the <see cref="Context"/> class.
        /// </summary>
        public Context()
        {
        } 

        /// <summary>
        /// Initializes a new instance of the <see cref="Context"/> class given a response from the WebDriver extension.
        /// </summary>
        /// <param name="fromExtension">The value returned from the WebDriver Firefox extension.</param>
        public Context(string fromExtension)
        {
            if (fromExtension.Length > 0)
            {
                this.contextValue = fromExtension;
            }
            else
            {
                this.contextValue = "0 ?";
            }
        }
        #endregion

        #region Properties
        /// <summary>
        /// Gets the ID of the driver issuing the command or receiving the response.
        /// </summary>
        public string DriverId
        {
            get
            {
                string contextDriverId = null;
                if (contextValue != null)
                {
                    contextDriverId = contextValue.Split(new string[] { " " }, StringSplitOptions.None)[0];
                }

                return contextDriverId;
            }
        } 
        #endregion

        #region Methods
        /// <summary>
        /// Returns a <see cref="System.String">String</see> that represents the current <see cref="System.Object">Object</see>.
        /// </summary>
        /// <returns>A <see cref="System.String">String</see> that represents the current <see cref="System.Object">Object</see>.</returns>
        public override string ToString()
        {
            return contextValue;
        } 
        #endregion
    }
}
