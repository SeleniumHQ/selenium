using System;
using System.Collections.Generic;
using System.Text;
using OpenQA.Selenium.Interactions.Internal;

namespace OpenQA.Selenium.Interactions
{
    internal class ContextClickAction : MouseAction, IAction
    {
        public ContextClickAction(IMouse mouse, ILocatable actionTarget)
            : base(mouse, actionTarget)
        {
        }

        #region IAction Members

        public void Perform()
        {
            this.MoveToLocation();
            this.Mouse.ContextClick(this.ActionLocation);
        }

        #endregion
    }
}
