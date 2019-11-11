VERSION_HASH := $(shell find src/ -type f -exec cat {} \; | md5sum - | cut -d ' ' -f 1)
CSS_ASSET := "app.$(shell md5sum src/statics/app.css | cut -d ' ' -f 1).css"
JS_ASSET := "app.$(shell md5sum src/statics/app.js | cut -d ' ' -f 1).js"

build:
	echo ${VERSION_HASH}
	echo ${CSS_ASSET}
	echo ${JS_ASSET}
	mkdir -p public
	rm -rf public/*
	cp -r src/* public/
	sed -i "s|%VERSION%|${VERSION_HASH}|g" public/index.html
	sed -i "s|%JS_ASSET%|${JS_ASSET}|g" public/index.html
	sed -i "s|%CSS_ASSET%|${CSS_ASSET}|g" public/index.html
	mv public/statics/app.js public/statics/${JS_ASSET}
	mv public/statics/app.css public/statics/${CSS_ASSET}

publish:
	now
	now alias
