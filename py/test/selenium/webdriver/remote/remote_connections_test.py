from selenium.webdriver.remote.remote_connection import RemoteConnection


def test_parse_remote_server():
    url = "http://127.0.0.1:4444/wd/hub"
    remote_address = RemoteConnection.parse_remote_server(url, False)
    assert remote_address == url


def test_parse_remote_server_resolve():
    url = "http://127.0.0.1:4444/wd/hub"
    remote_address = RemoteConnection.parse_remote_server(url, True)
    assert remote_address == url


def test_https_remotes():
    url = "https://127.0.0.4:4444/wd/hub"
    remote_address = RemoteConnection.parse_remote_server(url, True)
    assert remote_address == url
