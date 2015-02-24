#guideline for extrator

##Existence

* single file endswith `.js` in extractors folder
* subfolder contains `index.js` in extractors folder

###Why subfolder

* sometimes node_modules of a extractor is not required by vast extractors,so what you required may put in yourextractor/node_modules.
* make extractor decouple with the main structure, like plugins. so that you can work in your own repo.
