import pytest


def test_edge_service_verbose_flag_is_deprecated(edge_service) -> None:
    with pytest.warns(match="verbose=True is deprecated", expected_warning=DeprecationWarning):
        edge_service(verbose=True)
