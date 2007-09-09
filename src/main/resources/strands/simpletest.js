open("../tests/html/test_click_page1.html");
for (var i = 0; i < 3; i++) {
    click("link");
    waitForPageToLoad();
    click("previousPage");
    waitForPageToLoad();
}