scriptsHolder = "<!--{scripts}-->"
stylesHolder = "<!--{styles}-->"

args = process.argv.slice(2)
targetPath = args[0]
templateFile = args[1] or "#{__dirname}/template.html"
importsFile = args[2] or "#{__dirname}/tmp/imports"

Fs = require 'fs'

class HtmlGenerator
  constructor:->
    tpl = Fs.readFileSync(templateFile).toString()
    imports = Fs.readFileSync(importsFile).toString()
    holderIndents = @findHeadIndents(tpl)
    # console.log holderIndents
    scripts = []
    styles = []
    for source in imports.split("\n") when source.length > 0
      scripts.push source if source.indexOf(".js") isnt -1
      styles.push source if source.indexOf(".css") isnt -1
    tpl = tpl
      .replace scriptsHolder,@geneareteScriptsReferrence scripts,holderIndents.script
      .replace stylesHolder,@generateStylesReferrence styles,holderIndents.style
    console.log "Write:"
    console.log tpl
    console.log "To:#{targetPath}"
    Fs.writeFileSync targetPath,tpl

  findHeadIndents:(tpl)->
    scriptsHolderIndents = ""
    stylesHolderIndents = ""
    tpl.split('\n').forEach (line)->
      if line.indexOf(scriptsHolder) > 0 #设置 >0 是应为不能让 indexOf(scriptsHolder)-1 为负数
        scriptsHolderIndents = line[0..line.indexOf(scriptsHolder)-1]
      if line.indexOf(stylesHolder) > 0
        stylesHolderIndents = line[0..line.indexOf(stylesHolder)-1]
    script:scriptsHolderIndents
    style:stylesHolderIndents

  geneareteScriptsReferrence:(scripts,indent)->
    scripts.reduce( (str,item,idx)->
      if idx isnt 0 then str += "\n#{indent}"
      str += "<script type=\"text/javascript\" src=\"#{item}\"></script>"
    ,'') or "<!--{no js libs}-->"
      
  generateStylesReferrence:(styles,indent)->
    styles.reduce( (str,item,idx)->
      if idx isnt 0 then str += "\n#{indent}"
      str += "<link rel=\"text/javascript\" href=\"#{item}\" type=\"text/css\"></link>"
    ,'') or "<!--{no css libs}-->"


new HtmlGenerator()
process.exit 0

