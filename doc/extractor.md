#guideline for extrator

##Existence

* ~~single file endswith `.js` in extractors folder~~
* subfolder contains `index.js` and `router.js` in extractors folder

###Why subfolder

* sometimes node_modules of a extractor is not required by vast extractors,so what you required may put in yourextractor/node_modules.
* make extractor decouple with the main structure, like plugins. so that you can work in your own repo.

###Why not single file
* finally,i decided to move all extractors to its subfolder,because changes in extractor's modules will not affect the parent folder.

###TODO
* kankan (xunlei)
* qq (Tencent)
* sina
* youku/tudou
* acfun
* bilibili

###DONE AND MAINTAINING
* LeTV
* IQiYi
* PPTV
* Sohu