# template
A template for ssc projects, using a preferred dev environment -- [standardx](https://www.npmjs.com/package/standardx), [git-hook-plus](https://www.npmjs.com/package/git-hooks-plus), and typescript via a [jsconfig.json](jsconfig.json) file

## use
Use github's 'template' button, or clone this then `rm -rf .git && git init`. Then `npm i && npm init` and edit the source code in `src/main` and `src/render`.

## featuring

* lint via [standardx](https://www.npmjs.com/package/standardx) -- `npm run lint`
* git hooks via [git-hooks-plus](https://www.npmjs.com/package/git-hooks-plus) -- lint the code prior to `push`
* tests via [ssc-test](https://github.com/socketsupply/ssc-test),  [tapzero](https://www.npmjs.com/package/tapzero) & [test-dom](https://www.npmjs.com/package/@socketsupply/test-dom)
* `import` syntax / ES6 modules 

### run
```
npm start
```

### test
```
npm test
```

### build
```
npm run build
```
