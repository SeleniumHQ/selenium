from pages.example_page import ExamplePage


def test_example_title(browser):
    page = ExamplePage(browser)
    page.open()
    assert "Example Domain" in page.title
