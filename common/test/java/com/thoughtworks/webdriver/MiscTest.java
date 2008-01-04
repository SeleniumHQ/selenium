package com.thoughtworks.webdriver;

import static org.hamcrest.MatcherAssert.assertThat;
import static org.hamcrest.Matchers.equalTo;
import static org.hamcrest.Matchers.is;

public class MiscTest extends AbstractDriverTestCase {
    public void testShouldReportTheCurrentUrlCorrectly() {
        driver.get(simpleTestPage);
        assertThat(driver.getCurrentUrl(), equalTo(simpleTestPage));

        driver.get(javascriptPage);
        assertThat(driver.getCurrentUrl(), equalTo(javascriptPage));
    }

    @Ignore("ie, safari")
    public void testShouldReturnTheSourceOfAPage() {
        driver.get(simpleTestPage);

        String source = driver.getPageSource().toLowerCase();

        assertThat(source.contains("<html"), is(true));
        assertThat(source.contains("</html"), is(true));
        assertThat(source.contains("an inline element"), is(true));
        assertThat(source.contains("<p id=\"lotsofspaces\""), is(true));
    }
}
