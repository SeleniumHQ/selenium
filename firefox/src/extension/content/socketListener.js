function SocketListener(inputStream)
{
    this.inputStream = inputStream;
    this.data = "";
}

SocketListener.prototype.onStartRequest = function(request, context) 
{
}

SocketListener.prototype.onStopRequest = function(request, context, status)
{
}

SocketListener.prototype.onDataAvailable = function(request, context, inputStream, offset, count)
{
    this.data += this.inputStream.read(count);
    if (this.data.indexOf("\n") != -1)
    {
        this.data = "";
    }
}