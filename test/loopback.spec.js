/* global describe, it */
'use strict'

const assert = require('assert')
const loopback = require('loopback')

const app = loopback()
app.set('legacyExplorer', false)
const ds = loopback.createDataSource('memory')
const Post = ds.createModel('Post', {
  id: {type: Number, id: true}
})
app.model(Post)

const User = ds.createModel('User', {})
app.model(User)

const Comment = ds.createModel('Comment', {})
app.model(Comment)

const Book = ds.createModel('Book', {})
app.model(Book)

const Paragraph = ds.createModel('Paragraph', {})
app.model(Paragraph)

const Chapter = ds.createModel('Chapter', {})
app.model(Chapter)

Post.belongsTo(User)
Post.hasMany(Comment)

Comment.belongsTo(Post)

User.hasMany(Post)
User.hasMany(Comment)

Book.hasMany(Paragraph)
Book.hasMany(Chapter)

Chapter.hasMany(Paragraph)

Paragraph.belongsTo(Book)

describe('loopback relation definitions', () => {
  it('relation defn for Post model', () => {
    const relations = JSON.parse(JSON.stringify(Post.relations))

    assert.equal(relations.user.name, 'user')
    assert.equal(relations.user.type, 'belongsTo')
    assert.equal(relations.user.keyFrom, 'userId')
    assert.equal(relations.user.keyTo, 'id')
    assert.equal(relations.user.multiple, false)

    assert.equal(relations.comments.name, 'comments')
    assert.equal(relations.comments.type, 'hasMany')
    assert.equal(relations.comments.keyFrom, 'id')
    assert.equal(relations.comments.keyTo, 'postId')
    assert.equal(relations.comments.multiple, true)
  })

  it('through', () => {
    const Appointment = ds.createModel('Appointment')
    app.model(Appointment)

    const Physician = ds.createModel('Physician')
    app.model(Physician)

    const Patient = ds.createModel('Patient')
    app.model(Patient)

    Appointment.belongsTo(Patient)
    Appointment.belongsTo(Physician)

    Physician.hasMany(Patient, {through: Appointment})
    Patient.hasMany(Physician, {through: Appointment})

    const appointmentRelations = JSON.parse(JSON.stringify(Appointment.relations))
    const physicianRelations = JSON.parse(JSON.stringify(Physician.relations))
    const patientRelations = JSON.parse(JSON.stringify(Patient.relations))

    assert.deepEqual(appointmentRelations, {
      patient:
        { name: 'patient',
          type: 'belongsTo',
          modelFrom: 'Appointment',
          keyFrom: 'patientId',
          modelTo: 'Patient',
          keyTo: 'id',
          multiple: false },
      physician:
        { name: 'physician',
          type: 'belongsTo',
          modelFrom: 'Appointment',
          keyFrom: 'physicianId',
          modelTo: 'Physician',
          keyTo: 'id',
          multiple: false }
    })

    assert.deepEqual(physicianRelations, {
      patients:
        { name: 'patients',
          type: 'hasMany',
          modelFrom: 'Physician',
          keyFrom: 'id',
          modelTo: 'Patient',
          keyTo: 'physicianId',
          multiple: true,
          modelThrough: 'Appointment',
          keyThrough: 'patientId' }
    })

    assert.deepEqual(patientRelations, {
      physicians:
        { name: 'physicians',
          type: 'hasMany',
          modelFrom: 'Patient',
          keyFrom: 'id',
          modelTo: 'Physician',
          keyTo: 'patientId',
          multiple: true,
          modelThrough: 'Appointment',
          keyThrough: 'physicianId' }
    })
  })
})
