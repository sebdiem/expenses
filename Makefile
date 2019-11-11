build:
	rm -rf dist/*
	cp src/* dist/
	gsed -i "s|%VERSION%|$(shell cat src/* | xargs -0 md5 -qs)|g" dist/index.html
	gsed -i "s|%APP_JS%|app.$(shell md5 -q src/app.js).js|g" dist/index.html
	gsed -i "s|%APP_CSS%|app.$(shell md5 -q src/app.css).css|g" dist/index.html
	mv dist/app.js dist/app.$(shell md5 -q src/app.js).js
	mv dist/app.css dist/app.$(shell md5 -q src/app.css).css

publish:
	now
	now alias
