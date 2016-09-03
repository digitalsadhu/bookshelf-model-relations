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
        modelFrom: 'Post',
        keyTo: '_id',
        modelTo: 'User',
        keyThrough: null,
        modelThrough: null,
        multiple: false
      },
      comments: {
        name: 'comments',
        type: 'hasMany',
        keyFrom: '_id',
        modelFrom: 'Post',
        keyTo: 'post_id',
        modelTo: 'Comment',
        keyThrough: null,
        modelThrough: null,
        multiple: true
      }
    })
  })

  it('through', () => {
    const Appointment = bookshelf.Model.extend({
      tableName: 'appointment',

      patient: function () {
        return this.belongsTo(Patient)
      },

      physician: function () {
        return this.belongsTo(Physician)
      }
    })

    const Physician = bookshelf.Model.extend({
      tableName: 'physician',

      patients: function () {
        return this.hasMany(Patient).through(Appointment)
      }
    })

    const Patient = bookshelf.Model.extend({
      tableName: 'patient',

      physicians: function () {
        return this.hasMany(Physician).through(Appointment)
      }
    })

    assert.deepEqual(relations(Appointment), {
      patient:
        { name: 'patient',
          type: 'belongsTo',
          modelFrom: 'Appointment',
          keyFrom: 'patient_id',
          modelTo: 'Patient',
          keyTo: 'id',
          multiple: false,
          keyThrough: null,
          modelThrough: null },
      physician:
        { name: 'physician',
          type: 'belongsTo',
          modelFrom: 'Appointment',
          keyFrom: 'physician_id',
          modelTo: 'Physician',
          keyTo: 'id',
          multiple: false,
          keyThrough: null,
          modelThrough: null }
    })

    assert.deepEqual(relations(Physician), {
      patients:
        { name: 'patients',
          type: 'hasMany',
          modelFrom: 'Physician',
          keyFrom: 'id',
          modelTo: 'Patient',
          keyTo: 'physician_id',
          multiple: true,
          modelThrough: 'Appointment',
          keyThrough: 'patient_id' }
    })

    assert.deepEqual(relations(Patient), {
      physicians:
        { name: 'physicians',
          type: 'hasMany',
          modelFrom: 'Patient',
          keyFrom: 'id',
          modelTo: 'Physician',
          keyTo: 'patient_id',
          multiple: true,
          modelThrough: 'Appointment',
          keyThrough: 'physician_id' }
    })
  })

  it('modelName option', () => {
    const relationDefn = relations(Paragraph, {modelName: 'other'})
    assert.deepEqual(relationDefn.book.modelFrom, 'other')
  })

  it('support registry syntax', () => {
    const relationDefn = relations(User)
    assert.equal(relationDefn.comments.modelTo, 'Comment')
  })

  it('support override of relationship defn via comment in method defn', () => {
    const Model = bookshelf.Model.extend({
      bookity: function () {
        /** relationship
          type:belongsTo
          keyFrom:bookity_id
          modelFrom:thing
          keyTo:null
          modelTo:Bookity
          keyThrough:null
          modelThrough:Other */
      }
    })
    const relationDefn = relations(Model)
    assert.deepEqual(relationDefn, {
      bookity: {
        name: 'bookity',
        type: 'belongsTo',
        keyFrom: 'bookity_id',
        modelFrom: 'thing',
        keyTo: null,
        modelTo: 'Bookity',
        multiple: false,
        keyThrough: null,
        modelThrough: 'Other'
      }
    })
  })

  it('support override of relationship defn via relationships object on model', () => {
    const Model = bookshelf.Model.extend({
      relations: {
        silly: {
          type: 'belongsTo',
          keyFrom: 'bookid',
          modelFrom: 'Model',
          keyTo: 'nothing',
          modelTo: 'BookModel',
          keyThrough: null,
          modelThrough: 'Wuther',
          multiple: false
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
        modelFrom: 'Model',
        keyTo: 'nothing',
        modelTo: 'BookModel',
        keyThrough: null,
        modelThrough: 'Wuther',
        multiple: false
      }
    })
  })
})
