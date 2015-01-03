using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace OpenQA.Selenium.Support.PageObjects.Interfaces
{
    /// <summary>
    /// This interface is for entities which require 
    /// to change their behavior by the given <see cref="TimeSpan"/> value.
    /// It is expected that they can wait for something.
    ///</summary>
    public interface IAdjustableByTimeSpan
    {
        /// <summary>
        /// This property should get or set a timeout for the waiting.
        /// </summary>
        TimeSpan WaitingTimeSpan
        {
            set;
            get;
        }

        /// <summary>
        /// This property should get or set a timeout for the sleeping.
        /// </summary>
        TimeSpan TimeForSleeping
        {
            set;
            get;
        }
    }
}
