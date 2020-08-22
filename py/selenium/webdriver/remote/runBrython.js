var scriptTag = document.createElement('script')
scriptTag.type = 'text/python'
var script = document.createTextNode('{}')
script_tag.appendChild(script)
document.body.appendChild(script_tag)
brython()
script_tag.remove()
