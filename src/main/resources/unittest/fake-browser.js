windowMaker = function() {
    var window = {};
    
    window.location = {
        href: ""
    };
    
    window.closed = false;
    
    window.document = {};
    return window;
}

window = windowMaker();
document = window.document;

navigator = {
    userAgent: "JSUnit Rhino Fake Browser"
    ,appVersion: "1.0"
}

browserVersion = {
    name: "JSUnit Rhino Fake Browser"
}

if (!this["print"]) {
    print = function(msg) {
        java.lang.System.out.println(msg);
    }
}

selenium = {}