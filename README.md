# bookshelf-model-relations

Provides a way to see what relations/associations a bookshelf model has.

[![NPM](https://nodei.co/npm/bookshelf-model-relations.png?downloads=true&stars=true)](https://nodei.co/npm/bookshelf-model-relations/)

[![Media Suite](http://mediasuite.co.nz/ms-badge.png)](http://mediasuite.co.nz)

[![Build Status](https://travis-ci.org/digitalsadhu/bookshelf-model-relations.svg?branch=master)](https://travis-ci.org/digitalsadhu/bookshelf-model-relations)

## Installation

```
npm install bookshelf-model-relations --save
```

## Relation definition

The relation definition object that is returned by this module when you pass it
a bookshelf model takes the following form:

```js
{
  user: {
    name: 'user', // the name of the relation
    type: 'belongsTo', // belongsTo, hasMany, etc
    modelFrom: 'Post', // always the name of the model passed into bookshelf-model-relations
    keyFrom: 'user_id', // the key on the model desribed in modelFrom
    modelTo: 'User', // the model that is related to via type
    keyTo: 'id', // the key on the model described in modelTo
    modelThrough: null, // if a through model is used (eg. many to many) that model is listed here
    keyThrough: null, // the key on the through model (if present) that points to modelTo
    multiple: false // whether the relation returns a single model or multiple
  },
  comments: {
    name: 'comments',
    type: 'hasMany',
    modelFrom: 'Post',
    keyFrom: 'id',
    modelTo: 'Comment',
    keyTo: 'post_id',
    modelThrough: null,
    keyThrough: null,
    multiple: true
  }
}
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
