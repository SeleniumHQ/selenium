using System;
using System.Collections.Generic;
using System.Text;

namespace OpenQA.Selenium.Interactions
{
    internal class CompositeAction : IAction
    {
        private List<IAction> actionsList = new List<IAction>();

        public int NumberOfActions
        {
            get { return actionsList.Count; }
        }

        public CompositeAction AddAction(IAction action)
        {
            actionsList.Add(action);
            return this;
        }

        #region IAction Members

        public void Perform()
        {
            foreach (IAction action in actionsList)
            {
                action.Perform();
            }
        }

        #endregion
    }
}
