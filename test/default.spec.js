/* global describe, it */
'use strict'

const assert = require('assert')
const knex = require('knex')
const bookshelf = require('bookshelf')(knex({}))
const relations = require('..')

const Post = bookshelf.Model.extend({
  tableName: 'posts',

  user () {
    return this.belongsTo(User, ['userid'])
  },

  comments () {
    return this.hasMany(Comment)
  }
})

const Comment = bookshelf.Model.extend({
  tableName: 'comments',

  post () {
    return this.belongsTo(Post)
  }
})

const User = bookshelf.Model.extend({
  tableName: 'users',

  posts () {
    return this.hasMany(Post)
  },

  comments () {
    return this.hasMany(Comment)
  }
})

const Book = bookshelf.Model.extend({
  tableName: 'books',

  paragraphs: function () {
    return this.hasMany(Paragraph).through(Chapter)
  },

  chapters: function () {
    return this.hasMany(Chapter)
  }
})

let Chapter = bookshelf.Model.extend({
  tableName: 'chapters',

  paragraphs: function () {
    return this.hasMany(Paragraph)
  }
})

let Paragraph = bookshelf.Model.extend({
  tableName: 'paragraphs',

  book: function () {
    return this.belongsTo(Book).through(Chapter)
  }
})

describe('bookshelf-model-relations', () => {
  it('relation defn for Post model', () => {
    const relationDefn = relations(Post)
    assert.deepEqual(relationDefn, {
      user: {
        name: 'user',
        type: 'belongsTo',
        keyFrom: 'user_id',
        modelFromName: 'Post',
        keyTo: null,
        modelToName: 'User',
        through: false,
        throughModelName: null
      },
      comments: {
        name: 'comments',
        type: 'hasMany',
        keyFrom: null,
        modelFromName: 'Post',
        keyTo: 'post_id',
        modelToName: 'Comment',
        through: false,
        throughModelName: null
      }
    })
  })

  it('through', () => {
    const relationDefn = relations(Paragraph)
    assert.deepEqual(relationDefn, {
      book: {
        name: 'book',
        type: 'belongsTo',
        keyFrom: 'book_id',
        modelFromName: 'Paragraph',
        keyTo: null,
        modelToName: 'Book',
        through: true,
        throughModelName: 'Chapter'
      }
    })
  })

  it('modelName option', () => {
    const relationDefn = relations(Paragraph, {modelName: 'other'})
    assert.deepEqual(relationDefn.book.modelFromName, 'other')
  })
})
