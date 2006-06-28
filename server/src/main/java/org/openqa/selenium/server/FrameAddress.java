package org.openqa.selenium.server;

public class FrameAddress {

    /**
     * the name of the window according to selenium.  The main window's name is blank.
     */
    private String windowName;
    private String localFrameAddress;

    public FrameAddress(String windowName, String localFrameAddress) {
        this.windowName = windowName;
        this.localFrameAddress = localFrameAddress;
    }

    @Override
    public String toString() {
        return windowName + ":" + localFrameAddress;
    }

    public String getLocalFrameAddress() {
        return localFrameAddress;
    }

    public String getWindowName() {
        return windowName;
    }

    public boolean isDefault() {
        return getWindowName().equals(FrameGroupSeleneseQueueSet.DEFAULT_SELENIUM_WINDOW_NAME)
        && getLocalFrameAddress().equals(FrameGroupSeleneseQueueSet.DEFAULT_LOCAL_FRAME_ADDRESS);
    }
    
    @Override
    public boolean equals(Object obj) {
        if (obj instanceof FrameAddress) {
            FrameAddress other = (FrameAddress) obj;
            return getWindowName().equals(other.getWindowName()) && getLocalFrameAddress().equals(other.getLocalFrameAddress());
        }
        return false;
    }

    @Override
    public int hashCode() {
        return getLocalFrameAddress().hashCode();
    }

    public void setLocalFrameAddress(String localFrameAddress) {
        this.localFrameAddress = localFrameAddress;
    }

    public void setWindowName(String windowName) {
        this.windowName = windowName;
    }
}
