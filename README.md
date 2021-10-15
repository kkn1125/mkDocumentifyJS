# mkDocumentifyJS

[mkDocumentifyJS](#mkdocumentifyjs) | [purpose](#purpose) | [Notice](#notice) | [Usage](#usage)

## Purpose

make document for js comment only

## Notice

Parsing and documenting js comments. Currently, only the functions are implemented, and the design pattern is being studied, so it is not a neat code.

The goal is to be able to preview the contents after documenting because node.js cannot be used, and to be able to save the documented contents as a file.

I don't know about the license yet. Any advice would be appreciated.

## Usage

First, create an html file to preview the documentation.

And put the script in html.

```html
<!-- preview.html -->
<!DOCTYPE html>
<html lang="en">
  <head>
        <meta charset="UTF-8">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <script src="mkZip.js" type="module"></script>
        <link rel="stylesheet" href="main.css">
        <title>Documentify</title>
    </head>

    <body>
        <script src="regexReader.js"></script>
        <script src="documentify.js"></script>
        <script src="index.js"></script>
    </body>
  </body>
</html>
```

Then, in the `index.js` file, write the path to the js file to be documented in the userUrl variable.

```javascript
// index.js

// The first is to manually select a file.
const documentify = Documentify.init();

// The second method is to directly enter the file path.
const documentify = Documentify.init({ url: "example.js" });
```

`example.js` is documented as an example. And there will be a save button on the left.

When you open a saved file, js and css are built-in, so you can use the document itself as a single file.

---

[devkimson Blog](https://kkn1125.github.io/ "Blog") | [mkDocumentify :: Sample page](https://kkn1125.github.io/mkDocumentifyJS/ "documentify sample") | [mkDocumentify :: Update List](https://github.com/kkn1125/mkDocumentifyJS/blob/main/UPDATE.md)
