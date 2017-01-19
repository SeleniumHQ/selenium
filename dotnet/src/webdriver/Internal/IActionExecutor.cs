using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using OpenQA.Selenium.Interactions;

namespace OpenQA.Selenium.Internal
{
    internal interface IActionExecutor
    {
        bool IsActionExecutor { get; }

        /// <summary>
        /// Performs the specified list of actions with this action executor.
        /// </summary>
        /// <param name="actionSequenceList">The list of action sequences to perform.</param>
        void PerformActions(List<ActionSequence> actionSequenceList);

        void ResetInputState();
    }
}
