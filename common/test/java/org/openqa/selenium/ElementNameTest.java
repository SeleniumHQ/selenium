package org.openqa.selenium;

import static org.hamcrest.MatcherAssert.assertThat;
import static org.hamcrest.Matchers.*;

public class ElementNameTest extends AbstractDriverTestCase {

    @Ignore("safari, remote")
    public void testShouldReturnInput() {
        driver.get(formPage);
        WebElement selectBox = driver.findElement(By.id("cheese"));
        assertThat(selectBox.getElementName(), is("input"));
    }

}
