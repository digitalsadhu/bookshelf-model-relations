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

  it('hasMany through', () => {
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

  it('hasOne', () => {
    const Supplier = ds.createModel('Supplier')
    app.model(Supplier)
    const Account = ds.createModel('Account')
    app.model(Account)
    Supplier.hasOne(Account)

    const supplierRelations = JSON.parse(JSON.stringify(Supplier.relations))

    assert.deepEqual(supplierRelations, {
      account:
        { name: 'account',
          type: 'hasOne',
          modelFrom: 'Supplier',
          keyFrom: 'id',
          modelTo: 'Account',
          keyTo: 'supplierId',
          multiple: false }
    })
  })

  it('belongsTo', () => {
    const Order = ds.createModel('Order')
    app.model(Order)
    const Customer = ds.createModel('Customer')
    app.model(Customer)
    Order.belongsTo(Customer)

    const orderRelations = JSON.parse(JSON.stringify(Order.relations))

    assert.deepEqual(orderRelations, {
      customer:
        { name: 'customer',
          type: 'belongsTo',
          modelFrom: 'Order',
          keyFrom: 'customerId',
          modelTo: 'Customer',
          keyTo: 'id',
          multiple: false }
    })
  })

  it('hasMany', () => {
    const Order = ds.createModel('Order')
    app.model(Order)
    const Customer = ds.createModel('Customer')
    app.model(Customer)
    Customer.hasMany(Order)

    const customerRelations = JSON.parse(JSON.stringify(Customer.relations))

    assert.deepEqual(customerRelations, {
      orders:
        { name: 'orders',
          type: 'hasMany',
          modelFrom: 'Customer',
          keyFrom: 'id',
          modelTo: 'Order',
          keyTo: 'customerId',
          multiple: true }
    })
  })

  it('hasAndBelongsToMany', () => {
    const Part = ds.createModel('Part')
    app.model(Part)
    const Assembly = ds.createModel('Assembly')
    app.model(Assembly)
    Part.hasAndBelongsToMany(Assembly)
    Assembly.hasAndBelongsToMany(Part)

    const partRelations = JSON.parse(JSON.stringify(Part.relations))
    const assemblyRelations = JSON.parse(JSON.stringify(Assembly.relations))

    assert.deepEqual(partRelations, {
      assemblies:
        { name: 'assemblies',
          type: 'hasMany',
          modelFrom: 'Part',
          keyFrom: 'id',
          modelTo: 'Assembly',
          keyTo: 'partId',
          modelThrough: 'PartAssembly',
          keyThrough: 'assemblyId',
          multiple: true }
    })

    assert.deepEqual(assemblyRelations, {
      parts:
        { name: 'parts',
          type: 'hasMany',
          modelFrom: 'Assembly',
          keyFrom: 'id',
          modelTo: 'Part',
          keyTo: 'assemblyId',
          modelThrough: 'PartAssembly',
          keyThrough: 'partId',
          multiple: true }
    })
  })
})
