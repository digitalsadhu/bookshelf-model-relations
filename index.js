'use strict'

const _ = require('lodash')
const inflection = require('inflection')

// TODO: allow comment syntax to allow the user to override the relationship definition for a model

const RELATIONSHIP_TYPES = Object.freeze({
  BELONGS_TO: 'belongsTo',
  BELONGS_TO_MANY: 'belongsToMany',
  HAS_ONE: 'hasOne',
  HAS_MANY: 'hasMany',
  MORPH_ONE: 'morphOne',
  MORPH_TO: 'morphTo',
  MORPH_MANY: 'morphMany'
})

const MATCHERS = Object.freeze({
  INNER_FUNCTION_BLOCK: /\)\s*{([\s\S]*)}/,
  RELATIONSHIP_TYPE: /return\s*this\s*\.\s*([^\(]*)\s*\(/,
  THROUGH: /\.*through\s*\(/,
  MODEL_TO_NAME: new RegExp(`(?:${_.values(RELATIONSHIP_TYPES).join('|')})\\s*\\(([^,\\)]*)`),
  THROUGH_MODEL_NAME: new RegExp(`\\s*through\\s*\\(([^,\\)]*)`)
})

module.exports = (Model, options) => {
  const instance = new Model()
  const proto = Reflect.getPrototypeOf(instance)

  options = _.defaults(options, {
    modelName: _.upperFirst(inflection.singularize(_.toLower(instance.tableName)))
  })

  const relationships = {}
  Reflect.ownKeys(proto).forEach(prop => {
    if (['constructor', 'tableName', 'idAttribute'].indexOf(prop) !== -1) return

    const relationName = prop
    const functionString = proto[relationName].toString()
    const innerBlock = functionString.match(MATCHERS.INNER_FUNCTION_BLOCK)

    if (!innerBlock) return

    const capture = (str, matcher) => matcher.test(str) ? str.match(matcher)[1] : null

    relationships[prop] = {
      name: prop,
      type: capture(functionString, MATCHERS.RELATIONSHIP_TYPE),
      through: MATCHERS.THROUGH.test(functionString),
      keyFrom: null,
      keyTo: null,
      modelFromName: options.modelName,
      modelToName: capture(functionString, MATCHERS.MODEL_TO_NAME),
      throughModelName: capture(functionString, MATCHERS.THROUGH_MODEL_NAME)
    }

    if (RELATIONSHIP_TYPES.BELONGS_TO === relationships[prop].type) {
      relationships[prop].keyFrom = _.snakeCase(`${relationships[prop].modelToName}_id`)
    } else {
      relationships[prop].keyTo = _.snakeCase(`${relationships[prop].modelFromName}_id`)
    }
  })
  return relationships
}
