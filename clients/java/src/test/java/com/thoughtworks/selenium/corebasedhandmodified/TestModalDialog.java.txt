package com.thoughtworks.selenium.corebased;
import com.thoughtworks.selenium.*;
/**
 * Hand coded test for modal dialogs.
 * 
 * @author Matthew Purland
 */
public class TestModalDialog extends SeleneseTestCase
{
    public void testModalDialog() throws Throwable {
        try {

/* Test Modal Dialog */
            // open|../tests/html/test_modal_dialog.html|
            selenium.open("/selenium-server/tests/html/test_modal_dialog.html");
            // verifyLocation|*/tests/html/test_modal_dialog.html|
            verifyEquals("*/tests/html/test_modal_dialog.html", selenium.getLocation());
            // verifyTitle|test modal dialog|
            verifyEquals("Modal Dialog Host Window", selenium.getTitle());
            
            // Verify text of changing field before modal dialog
            verifyEquals("before modal dialog", selenium.getText("changeText"));
            
            // Click the modal link
            selenium.click("modal");
           
            // Wait for the popup to load
            selenium.waitForPopUp("Modal Dialog Popup", "5000");
            
            // Select the popup window
            selenium.selectWindow("Modal Dialog Popup");
            
            // Verify title of the popup dialog
            verifyEquals("Modal Dialog Popup", selenium.getTitle());
            
            // Verify that the returnVal at start is set
            //verifyEquals("ted", selenium.getEval("window.returnVal"));            
            
            // Click the change link
            selenium.click("change");
            
            // Verify after clicking the change link that the returnVal is set
            //verifyEquals("bill", selenium.getEval("window.returnVal"));
            
            // Click the close link to close the window
            selenium.click("close");
            
            // Select top window
            selenium.selectWindow("Modal Dialog Host Window");
            
            // Verify text of changing field after modal dialog
            verifyEquals("after modal dialog", selenium.getText("changeText"));
            
            // Verify the title is no longer the popup window
            // Since it is now closed
            verifyEquals("Modal Dialog Host Window", selenium.getTitle());

            // Verify alert
            //verifyEquals("no ways", selenium.getAlert() );

            checkForVerificationErrors();
        }
        finally {
            clearVerificationErrors();
        }
    }
}
