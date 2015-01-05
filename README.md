#Kageboushi 

Kageboushi (かげぼうし 影法師) is a super simple tool to create your front-end web project super fast!

##Generate a project

To generate a new project:
```shell
$ ./build ~/yourNewProjectName
```

and when you'll be ask to select libraries to use like:
```
Select libraries you'd like to use(input the number split by space e.g. '0 1 2')：
[0]:bootstrap3 [1]:font-awesome [2]:jquery [3]:suzaku
```
just input something like
```
0 1 2
```
for useing bootstrap3, font-awesome and jquery

then your new project will be ready to use.

##Run your new project

cd to your project and run
```shell
$ ./startServer
```
and a simple static server will run at localhost:8002

if you want to change the port, run
```shell
$ ./startServer --port=xxxx
```
Server script is in ./server/server.coffee and written in coffee-script

All request gose to ./static

##How it work
WebBuilder will:
>1. copy binary file in bin/ and node_modules to your new project ensure server script can be run in an environment without nodejs.
2. copy all files and dirs under webTemplate/ to your new project
3. copy libs you choose from staticLibs/ to your newProject/static/libs
4. generate index.html file and try to reference every js/css file from libs you choose into it
5. put index.html file input newProject/static

(super simple isnt it ? lol)

##Modify template files
just edit files in webTemplate/ for dir structure and template.html for index.html.

It'll work as your wish

##Add your own libs
just add them into staticLibs/

you'll know how it work ( because it's super simple! )

##Wha Next?
>1. add more libs
2. add '$./build lslib [keyword to search]' to list all libs
3. add '$./build add {lib number} projectPath_or_htmlFile' to add a lib into an exist project(update all html to refference them automaticly)
4. add package.json and publish to npm

