using System;
using System.Collections.Generic;
using System.Text;

namespace OpenQA.Selenium.Interactions.Internal
{
    public class MouseAction : WebDriverAction
    {
        private IMouse mouse;

        public MouseAction(IMouse mouse, ILocatable target)
            : base(target)
        {
            this.mouse = mouse;
        }

        protected ICoordinates ActionLocation
        {
            get
            {
                if (this.ActionTarget == null)
                {
                    return null;
                }

                return this.ActionTarget.Coordinates;
            }
        }

        protected IMouse Mouse
        {
            get { return this.mouse; }
        }

        protected void MoveToLocation()
        {
            // Only call MouseMove if an actual location was provided. If not,
            // the action will happen in the last known location of the mouse
            // cursor.
            if (this.ActionLocation != null)
            {
                mouse.MouseMove(ActionLocation);
            }
        }
    }
}
