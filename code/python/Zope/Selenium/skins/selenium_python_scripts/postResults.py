## Script (Python) "postResults"
##bind container=container
##bind context=context
##bind namespace=
##bind script=script
##bind subpath=traverse_subpath
##parameters=obj=None
##title=Post results to the Selenium tool.
##

# Internet Explorer needs "Expires" to be set or it won't refresh this page.
container.REQUEST.RESPONSE.setHeader('Expires', 'Sat, 1 Jan 2000 00:00:00 GMT')


ft_tool = container.selenium_ft_tool
return ft_tool.postResults(container.REQUEST.form, container.REQUEST.get('HTTP_USER_AGENT',''))
