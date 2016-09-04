# bookshelf-model-relations

Provides a way to see what relations/associations a bookshelf model has

[![NPM](https://nodei.co/npm/bookshelf-model-relations.png?downloads=true&stars=true)](https://nodei.co/npm/bookshelf-model-relations/)

[![Media Suite](http://mediasuite.co.nz/ms-badge.png)](http://mediasuite.co.nz)

[![Build Status](https://travis-ci.org/digitalsadhu/bookshelf-model-relations.svg?branch=master)](https://travis-ci.org/digitalsadhu/bookshelf-model-relations)

## Installation

```
npm install bookshelf-model-relations --save
```

## Usage

### Require the module
```js
const relations = require('bookshelf-model-relations')
```

### Pass it a bookshelf model
```js
const relationships = relations(Post, options)

/*
{
  user: {
    name: 'user',
    type: 'belongsTo',
    keyFrom: 'user_id',
    modelFrom: 'Post',
    keyTo: 'id',
    modelTo: 'User',
    keyThrough: null,
    modelThrough: null,
    multiple: false
  },
  comments: {
    name: 'comments',
    type: 'hasMany',
    keyFrom: 'id',
    modelFrom: 'Post',
    keyTo: 'post_id',
    modelTo: 'Comment',
    keyThrough: null,
    modelThrough: null,
    multiple: true
  }
}
*/
```

### options

#### options.modelName

`bookshelf-model-relations` attempts to work out the name of the model by taking the value of
`tableName` singularizing it and then `UpperCamelCasing` it. If this is incorrect, you will
need to manually set this via `options.modelName` like so:

```js
const relationships = relations(Post, {modelName: 'MyCustomClassName'})
```

### Overriding a models relations

`bookshelf-model-relations` attempts to work out relationships via parsing the model function strings
based on bookshelf model definition conventions.

If for some reason your relations are different you can tell `bookshelf-model-relations` about your models
relations in 1 of 2 ways:

#### relationship comment string

Inside the body of a relationship function you can define a comment string of the format:
```js
/* relationship key1:value1 key2:value2 */
```

For example:
```js
const Post = bookshelf.Model.extend({
  author: function () {
    /* relationship
      type:belongsTo
      keyFrom:author_id
      modelFrom:Post
      modelTo:Author
      keyTo:id
      modelThrough:null
      keyThrough:null
      multiple:false */
  }
})
```

#### relations model property

The other way you can let `bookshelf-model-relations` know about a model's relations is to
define an object on the model under the key `relations`

For example:
```js
const Post = bookshelf.Model.extend({
  relations: {
    author: {
      type: 'belongsTo',
      keyFrom: 'author_id',
      modelFrom: 'Post',
      modelTo: 'Author',
      keyTo: 'id',
      modelThrough: null,
      keyThrough: null,
      multiple: false
    }
  }
  author: function () { return /*...*/ }
})
```
