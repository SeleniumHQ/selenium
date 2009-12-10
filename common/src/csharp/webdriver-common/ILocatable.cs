using System;
using System.Collections.Generic;
using System.Text;
using System.Drawing;

namespace OpenQA.Selenium
{
    public interface ILocatable
    {
        [System.Diagnostics.CodeAnalysis.SuppressMessage("Microsoft.Naming", "CA1702:CompoundWordsShouldBeCasedCorrectly", MessageId = "OnScreen")]
        Point LocationOnScreenOnceScrolledIntoView { get; }
    }
}
