import pytest
from selenium.webdriver.common.options import ArgOptions


def test_invalid_page_load_strategy():
    options = ArgOptions()

    with pytest.raises(ValueError) as exc:
        options.page_load_strategy = "fast"

    assert "Invalid page load strategy" in str(exc.value)
    