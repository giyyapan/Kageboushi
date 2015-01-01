args = process.argv.slice(2)
for a in args
  name = a.split('=')[0].replace(/-/g,'')
  value = a.split('=')[1] or true
  switch name
    when "port",'p'
      port = parseInt(value)
    else
      console.error "Invailid argument #{name} #{value}"

config =
  port:port or 8002
  defaultPathname:"/index.html"
  staticPath:"../static"
  Expires:
    fileMatch: /|png|jpg|gif|css|js|html|ogg|mp3|/ig
    maxAge: 60 * 60 * 24 * 365
  MIMETypes:
    "css": "text/css"
    "gif": "image/gif"
    "html": "text/html"
    "ico": "image/x-icon"
    "jpeg": "image/jpeg"
    "jpg": "image/jpeg"
    "js": "text/javascript"
    "json": "application/json"
    "pdf": "application/pdf"
    "png": "image/png"
    "svg": "image/svg+xml"
    "swf": "application/x-shockwave-flash"
    "tiff": "image/tiff"
    "txt": "text/plain"
    "ogg": "audio/ogg"
    "mp3": "audio/mp3"
    "wav": "audio/x-wav"
    "wma": "audio/x-ms-wma"
    "wmv": "video/x-ms-wmv"
    "xml": "text/xml"
    'unknow':"text/plain"
    
Http = require "http"
Path = require "path"
Url = require "url"
Fs = require "fs"

currentPath = __dirname;
console.log currentPath

WriteErr = (err,res)->
  res.writeHead 500,{'Content-Type': 'text/plain'}
  res.end(err)

ParseRange = (str, size) ->
    if str.indexOf(",") isnt -1
      return
    range = str.replace(/bytes=/, "").split "-"
    start = parseInt(range[0], 10)
    end = parseInt(range[1], 10)
    if isNaN end
      end = parseInt(size - 1)
    if isNaN(start) or isNaN(end) or start > end or end > size
      return false
    return start: start,end: end

WriteFile = (req,realPath,type,stats,res)->
  res.setHeader 'Content-Type',config.MIMETypes[type]
  if req.headers.range
    range = ParseRange(req.headers["range"], stats.size)
    if range
      header = 
        "Content-Range":"bytes #{range.start}-#{range.end}/#{stats.size}"
        "Accept-Ranges":"bytes"
        "Content-Length":(range.end-range.start+1)
        "Transfer-Encoding":'chunked'
        #"Connection":"close"
      res.writeHead 206,header
      raw = Fs.createReadStream realPath,{start:range.start,end:range.end}
      raw.pipe res
    else 
      res.removeHeader("Content-Length")
      res.writeHead 416,"req Range Not Satisfiable"
      res.end()   
  else 
    raw = Fs.createReadStream(realPath)
    res.writeHead 200,"Ok"
    raw.pipe res

MainHandler = (req,res)->
  req.setEncoding("utf8");
  urldata = Url.parse req.url
  pathname = urldata.pathname
  if pathname is "/" then pathname = config.defaultPathname
  realPath = "#{currentPath}/#{config.staticPath}#{pathname}"
  ext = Path.extname(realPath);
  type = if ext then ext.slice(1) else 'unknown'
  Fs.exists realPath,(ans)->
    if ans is no
      res.setHeader 'Content-Type','text/plain'
      res.writeHead 404,"Not Found"
      res.end "404"
      return true
    if true #ext.match(config.Expires.fileMatch)
      expires = new Date()
      expires.setTime(expires.getTime() + config.Expires.maxAge * 1000)
      res.setHeader "Expires", expires.toUTCString()
      res.setHeader "Cache-Control", "max-age=#{config.Expires.maxAge}"
      Fs.stat realPath, (err, stats)->
        if err then return WriteErr err,res
        lastModified = stats.mtime.toUTCString()
        res.setHeader("Last-Modified", lastModified)
        if lastModified is req.headers['if-modified-since']
            res.writeHead 304, "Not Modified"
            res.end()
        else
          WriteFile req,realPath,type,stats,res
    else
      WriteFile req,realPath,type,res
              
server = Http.createServer MainHandler
server.listen config.port

console.log "server running at port:#{config.port}"
