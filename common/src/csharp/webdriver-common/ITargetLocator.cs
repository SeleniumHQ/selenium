using System;
using System.Collections.Generic;
using System.Text;

namespace OpenQa.Selenium
{
    public interface ITargetLocator
    {
        /**
         * Select a frame by its (zero-based) index. That is, if a page has
         * three frames, the first frame would be at index "0", the second at
         * index "1" and the third at index "2". Once the frame has been
         * selected, all subsequent calls on the WebDriver interface are made to
         * that frame.
         *
         * @param frameIndex
         * @return A driver focused on the given frame
         * @throws NoSuchFrameException If the frame cannot be found
         */
        IWebDriver Frame(int frameIndex);

        /**
         * Select a frame by its name or ID. To select sub-frames, simply separate the frame names/IDs by dots. As an example
         * "main.child" will select the frame with the name "main" and then it's child "child". If a frame name is a
         * number, then it will be treated as selecting a frame as if using.
         *
         * @param frameName
         * @return A driver focused on the given frame
         * @throws NoSuchFrameException If the frame cannot be found
         */
        IWebDriver Frame(String frameName);

        /**
         * Switch the focus of future commands for this driver to the window with the given name
         *
         * @param windowName
         * @return A driver focused on the given window
         * @throws NoSuchWindowException If the window cannot be found
         */
        IWebDriver Window(String windowName);

        /**
           * Selects either the first frame on the page, or the main document when a page contains iframes.
           */
        IWebDriver DefaultContent();

        /**
         * Switches to the element that currently has focus, or the body element if this cannot be detected.
         *
         * @return The WebElement with focus, or the body element if no element with focus can be detected.
         */
        IWebElement ActiveElement();
    }
}
