var scriptTag = document.createElement('script')
scriptTag.type = 'text/python'
var script = document.createTextNode({})
scriptTag.appendChild(script)
document.body.appendChild(scriptTag)

try {{ brython() }}
finally {{ scriptTag.remove() }}
