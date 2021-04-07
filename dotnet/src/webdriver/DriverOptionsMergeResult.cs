using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace OpenQA.Selenium.Remote
{
    /// <summary>
    /// Represents the result of merging multiple <see cref="DriverOptions"/>.
    /// </summary>
    public class DriverOptionsMergeResult
    {
        /// <summary>
        /// Gets or sets a value indicating whether the DriverOptions would conflict when merged with another option
        /// </summary>
        public bool IsMergeConflict { get; set; }

        /// <summary>
        /// Gets or sets the name of the name of the option that is in conflict.
        /// </summary>
        public string MergeConflictOptionName { get; set; }
    }
}
