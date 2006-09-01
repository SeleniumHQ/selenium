function FindProxyForURL(url, host) {
    if(shExpMatch(url, '*/selenium-server/*')) {
        return 'PROXY localhost:4444; DIRECT';
    }
}
