using System;
using System.Collections.Generic;
using System.Text;
using OpenQA.Selenium.Interactions.Internal;

namespace OpenQA.Selenium.Interactions
{
    public class MoveMouseAction : MouseAction, IAction
    {
        public MoveMouseAction(IMouse mouse, ILocatable actionTarget)
            : base(mouse, actionTarget)
        {
            if (actionTarget == null)
            {
                throw new ArgumentException("Must provide a location for a move action.", "actionTarget");
            }
        }

        #region IAction Members

        public void Perform()
        {
            this.Mouse.MouseMove(this.ActionLocation);
        }

        #endregion
    }
}
