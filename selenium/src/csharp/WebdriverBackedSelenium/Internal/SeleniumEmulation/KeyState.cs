using System;
using System.Collections.Generic;
using System.Text;

namespace Selenium.Internal.SeleniumEmulation
{
    internal class KeyState
    {
        private bool altKeyDown;
        private bool controlKeyDown;
        private bool shiftKeyDown;
        private bool metaKeyDown;

        public bool AltKeyDown
        {
            get { return altKeyDown; }
            set { altKeyDown = value; }
        }

        public bool ControlKeyDown
        {
            get { return controlKeyDown; }
            set { controlKeyDown = value; }
        }

        public bool ShiftKeyDown
        {
            get { return shiftKeyDown; }
            set { shiftKeyDown = value; }
        }

        public bool MetaKeyDown
        {
            get { return metaKeyDown; }
            set { metaKeyDown = value; }
        }
    }
}
