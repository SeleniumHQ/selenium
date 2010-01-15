using System;
using System.Collections.Generic;
using System.Text;

namespace OpenQA.Selenium
{
    /// <summary>
    /// Defines the interface used to take screen shot images of the screen.
    /// </summary>
    public interface ITakesScreenshot
    {
        /// <summary>
        /// Gets a <see cref="Screenshot"/> object representing the image of the page on the screen.
        /// </summary>
        /// <returns>A <see cref="Screenshot"/> object containing the image.</returns>
        Screenshot GetScreenshot();
    }
}
