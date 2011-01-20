using System;
using System.Collections.Generic;
using System.Text;
using OpenQA.Selenium.Interactions.Internal;

namespace OpenQA.Selenium.Interactions
{
    public class ClickAction : MouseAction, IAction
    {
        public ClickAction(IMouse mouse, ILocatable actionTarget)
            : base(mouse, actionTarget)
        {
        }

        #region IAction Members

        public void Perform()
        {
            this.MoveToLocation();
            this.Mouse.Click(this.ActionLocation);
        }

        #endregion
    }
}
