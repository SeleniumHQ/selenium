// -----------------
// This script implements a RMI-like functionality from a process
// external to the browser. This makes it possible to call Javascript
// functions and access Javascript objects remotely in a synchronous
// fashion.
//
// Original code by Aslak Hellesoy and and Darren Hobbs, inspired by Joe Walnes
// -----------------

function Marshaller() {
    this.ids_to_objects = new Array(0);
    
    // The "top level object"
    this.ids_to_objects[0] = self;
}

Marshaller.prototype.invoke = function(jsRmiInvocation) {
    var jsEpression
    var tokens
    if(tokens = new RegExp("([^.]*)\.([A-Za-z]*=?)[\(](.*)[\)]").exec(jsRmiInvocation)) {
        ob = tokens[1]
        function_name = tokens[2]
        arguments = tokens[3]

        jsEpression = this.unmarshalObject(ob) + "." + function_name
        var n = 0
        while((tokens = new RegExp("([^,]*),?(.*)").exec(arguments)) && (arguments != "")) {
            if(n == 0) {
                jsEpression += "("
            } else {
                jsEpression += ","
            }
            arg = tokens[1]
            jsEpression += this.unmarshalObject(arg)
            arguments = tokens[2]
            n++
        }
        if(n > 0) {
            jsEpression += ")"
        }
        // receiver of the function is an object (this was a call by ref)
    } else {
        alert("bad JsRmi invocation format:" + jsRmiInvocation)
        // TODO: throw an exception
    }
    var result = eval(jsEpression)
    return result;
}

// unmarshals a JsRmiObject String to a Javascript expression
// that can be eval()'ed to a real Javascript object.
Marshaller.prototype.unmarshalObject = function(jsRmiObject) {
    var jsEpression
    var tokens
    if(tokens = new RegExp("__JsObject__[A-Za-z]*__([0-9]*)").exec(jsRmiObject)) {
        var object_id = tokens[1]
        jsEpression = "this.ids_to_objects[" + object_id + "]"
        // TODO: some verification mechanism to verify that the type
        // is consistent?
    } else {
        // It was a primitive (by-value) object
        jsEpression = jsRmiObject
    }
    return jsEpression;
}

Marshaller.prototype.marshalObject = function(object) {
    var jsRmiObject
    if(object) {
        var resultClass = this.getObjectClass(object)
        if(resultClass == "String") {
            // TODO: prefix with type and do conversion on client side?
            // Ex: String:blablabal or Integer:123
            jsRmiObject = object
        } else {
            // the result of eval was an object
            if(object != undefined && object.object_id == undefined) {
                // create a new proxy ref and remember it
                object.object_id = this.ids_to_objects.length
                this.ids_to_objects[object.object_id] = object
            }
            jsRmiObject = "__JsObject__" + resultClass + "__" + object.object_id
        }
    } else {
        jsRmiObject = "__JsUndefined"
    }
    return jsRmiObject
}

// modified version of
// http://www.magnetiq.com/code_snippets/getobjectclass.php
// that always returns a nice class name
Marshaller.prototype.getObjectClass = function(obj) {
    if (obj && obj.constructor && obj.constructor.toString) {
        var func = obj.constructor.toString().match(/function\s*(\w+)/);
        if(func) {
            return func[1];
        } else {
            var arr = obj.toString().match(/\[object (\w+)\]/);
            if(arr) {
                return arr[1];
            } else {
                return undefined
            }
        }
    } else {
        return "UNKNOWN"
    }
}

function RmiConnection(url) {
    this.url = url;
    this.marshaller = new Marshaller()
}

RmiConnection.prototype.requestNextMessage = function() {
    var http = this.createHttpControl();
    var url = this.url;
    var connection = this;
    var marshaller = this.marshaller;
    http.onreadystatechange = function() {     
        if (http.readyState == 4) {
            var ok;
            try {
                ok = http.status && http.status == 200;
            } catch (e) {
                ok = false; // sometimes accessing the http.status fields causes errors in firefox. dunno why. -joe
            }

            if (!ok) {
                connection.requestNextMessage();
            } else {
                var message = http.responseText
                var result = marshaller.invoke(message)
                reply = marshaller.marshalObject(result)
                connection.sendMessage(reply);
            }
        }
    }

    http.open("GET", url, true);
    http.send("");
}

RmiConnection.prototype.sendMessage = function(message) {
    var http = this.createHttpControl();
    var connection = this;

    http.open("POST", this.url, true);
    http.onreadystatechange = function() {     
        if (http.readyState == 4) {
            var ok;
            try {
                ok = http.status && http.status == 200;
            } 
            catch (e) {
                ok = false; // sometimes accessing the http.status fields causes errors in firefox. dunno why. -joe
            }
            if (ok) {
                connection.requestNextMessage();
            } else {
                alert(http.status)
            }
        }
    }
    http.send(message);
}

RmiConnection.prototype.createHttpControl = function() {
    // for details on using XMLHttpRequest see
    // http://developer.apple.com/internet/webcontent/xmlhttpreq.html
    // http://webfx.eae.net/dhtml/xmlextras/xmlextras.html
    var req;
    try {
        if (window.XMLHttpRequest) {
            req = new XMLHttpRequest();

            // some older versions of Moz did not support the readyState property
            // and the onreadystate event so we patch it!
            if (req.readyState == null) {
                req.readyState = 1;
                req.addEventListener("load", function () {
                    req.readyState = 4;
                    if (typeof req.onreadystatechange == "function") {
                        req.onreadystatechange();
                    }
                }, false);
            }
        }

        if (window.ActiveXObject) {
            req = new ActiveXObject(this.getControlPrefix() + ".XmlHttp");
        }
        return req;
    } catch (ex) {
        throw new Error("Your browser does not support XmlHttp objects")
    }
}

RmiConnection.prototype.getControlPrefix = function() {
    if (this.prefix) {
        return this.prefix;
    }

    var prefixes = ["MSXML2", "Microsoft", "MSXML", "MSXML3"];
    var o, o2;
    for (var i = 0; i < prefixes.length; i++) {
        try {
            // try to create the objects
            o = new ActiveXObject(prefixes[i] + ".XmlHttp");
            o2 = new ActiveXObject(prefixes[i] + ".XmlDom");
            return this.prefix = prefixes[i];
        } catch (ex) {
        }
   }
   throw new Error("Could not find an installed XML parser")
}
