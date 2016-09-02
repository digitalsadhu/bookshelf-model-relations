/* global describe, it */
'use strict'

const assert = require('assert')
const knex = require('knex')
const bookshelf = require('bookshelf')(knex({}))
const relations = require('..')

const Post = bookshelf.Model.extend({
  tableName: 'posts',
  idAttribute: '_id',

  user () {
    return this
      .belongsTo(User, ['userid'])
  },

  comments () {
    return this.hasMany(Comment)
  },

  other () {
    console.log('is not a relationship function')
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
    return this.hasMany('Comment')
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
    return this
      .belongsTo(Book)
      .through('Chapter')
  }
})

describe('bookshelf-model-relations', () => {
  it('relation defn for Post model', () => {
    const relationDefn = relations(Post)
    assert.deepEqual(relationDefn, {
      user: {
        name: 'user',
        type: 'belongsTo',
        keyFrom: 'userid',
        modelFromName: 'Post',
        keyTo: '_id',
        modelToName: 'User',
        through: false,
        throughModelName: null
      },
      comments: {
        name: 'comments',
        type: 'hasMany',
        keyFrom: '_id',
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
        keyTo: 'id',
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

  it('support registry syntax', () => {
    const relationDefn = relations(User)
    assert.equal(relationDefn.comments.modelToName, 'Comment')
  })

  it('support override of relationship defn via comment in method defn', () => {
    const Model = bookshelf.Model.extend({
      bookity: function () {
        /** relationship
          type:belongsTo
          keyFrom:bookity_id
          modelFromName:thing
          keyTo:null
          modelToName:Bookity
          through:false
          throughModelName:Other */
      }
    })
    const relationDefn = relations(Model)
    assert.deepEqual(relationDefn, {
      bookity: {
        name: 'bookity',
        type: 'belongsTo',
        keyFrom: 'bookity_id',
        modelFromName: 'thing',
        keyTo: null,
        modelToName: 'Bookity',
        through: true,
        throughModelName: 'Other'
      }
    })
  })

  it('support override of relationship defn via relationships object on model', () => {
    const Model = bookshelf.Model.extend({
      relations: {
        silly: {
          type: 'belongsTo',
          keyFrom: 'bookid',
          modelFromName: 'Model',
          keyTo: 'nothing',
          modelToName: 'BookModel',
          through: true,
          throughModelName: 'Wuther'
        }
      },

      silly: function () {
        return this.hasMany('Comment')
      }
    })
    const relationDefn = relations(Model)
    assert.deepEqual(relationDefn, {
      silly: {
        name: 'silly',
        type: 'belongsTo',
        keyFrom: 'bookid',
        modelFromName: 'Model',
        keyTo: 'nothing',
        modelToName: 'BookModel',
        through: true,
        throughModelName: 'Wuther'
      }
    })
  })
})
