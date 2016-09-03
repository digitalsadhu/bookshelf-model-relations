# bookshelf-model-relations

Provides a way to see what relations/associations a bookshelf model has

[![NPM](https://nodei.co/npm/bookshelf-model-relations.png?downloads=true&stars=true)](https://nodei.co/npm/bookshelf-model-relations/)

[![Media Suite](http://mediasuite.co.nz/ms-badge.png)](http://mediasuite.co.nz)

[![Build Status](https://travis-ci.org/mediasuitenz/bookshelf-model-relations.svg)](https://travis-ci.org/digitalsadhu/bookshelf-model-relations)

## Installation

```
npm install bookshelf-model-relations --save
```

## Usage

Require the module
```js
const relations = require('bookshelf-model-relations')
```

Pass it a bookshelf model
```js
const relationships = relations(Post)

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
