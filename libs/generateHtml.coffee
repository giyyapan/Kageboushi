scriptsHolder = "<!--{scripts}-->"
stylesHolder = "<!--{styles}-->"

args = process.argv.slice(2)
targetFile = args[0]
templateFile = args[1] or "#{__dirname}/../template.html"
importsFile = args[2] or "#{__dirname}/../tmp/imports"
# console.log args

Fs = require 'fs'
Cheerio = require 'cheerio'

class HtmlGenerator
  constructor:->
    if Fs.existsSync targetFile
      @type = "update"
    else
      @type = "create"
    tpl = Fs.readFileSync(templateFile).toString()
    imports = Fs.readFileSync(importsFile).toString()
    @scripts = []
    @styles = []
    for source in imports.split("\n") when source.length > 0
      @scripts.push source if source.indexOf(".js") isnt -1
      @styles.push source if source.indexOf(".css") isnt -1
    if @type is "create"
      newData = @generateHtmlFile tpl
    else
      newData = @updateHtmlFile targetFile
    console.log "Write:"
    console.log newData
    console.log "To:\n#{targetFile}\n"
    Fs.writeFileSync targetFile,newData,"utf-8"

  updateHtmlFile:(targetFile)->
    old = Fs.readFileSync targetFile,"utf-8"
    #console.log old.toString()
    temp$ = 
    $ = Cheerio.load(old)
    scriptInserTarget = Cheerio.load("").root().append($($('script')[0]).clone()).html()
    styleInsertTarget = Cheerio.load("").root().append($($('link')[0]).clone()).html()
    #console.log scriptInserTarget,styleInsertTarget
    @holderIndents = @findHeadIndents old, scriptInserTarget, styleInsertTarget
    styles = @generateStylesReferrence ""
    scripts = @generateScriptsReferrence ""
    # console.log @holderIndents
    for s in scripts.split("\n") when s
      $($('script')[0]).before(s+"\n#{@holderIndents.script}")
    for s in styles.split("\n") when s
      $($('link')[0]).before(s+"\n#{@holderIndents.style}")
    $.html()

  generateHtmlFile:(tpl)->
    @holderIndents = @findHeadIndents(tpl,scriptsHolder,stylesHolder)
    str = tpl
    scriptsStr = @generateScriptsReferrence(@holderIndents.script)
    str = str.replace(scriptsHolder,scriptsStr) if scriptsStr
    stylesStr = @generateStylesReferrence(@holderIndents.style)
    str = str.replace stylesHolder,stylesStr if stylesStr
    str

  findHeadIndents:(tpl,scriptsHolder,stylesHolder)->
    scriptsHolderIndents = ""
    stylesHolderIndents = ""
    tpl.split('\n').forEach (line)->
      if line.indexOf(scriptsHolder) > 0 #设置 >0 是应为不能让 indexOf(scriptsHolder)-1 为负数
        scriptsHolderIndents = line[0..line.indexOf(scriptsHolder)-1]
      if line.indexOf(stylesHolder) > 0
        stylesHolderIndents = line[0..line.indexOf(stylesHolder)-1]
    script:scriptsHolderIndents
    style:stylesHolderIndents

  generateScriptsReferrence:(indent="")->
    @scripts.reduce( (str,item,idx)->
      if idx isnt 0 then str += "\n#{indent}"
      str += "<script type=\"text/javascript\" src=\"#{item}\"></script>"
    ,'') or ""
      
  generateStylesReferrence:(indent="")->
    @styles.reduce( (str,item,idx)->
      if idx isnt 0 then str += "\n#{indent}"
      str += "<link rel=\"stylesheet\" href=\"#{item}\" type=\"text/css\" />"
    ,'') or ""


new HtmlGenerator()
process.exit 0

