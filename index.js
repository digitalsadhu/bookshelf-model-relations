'use strict'

const _ = require('lodash')
const inflection = require('inflection')

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
  MODEL_TO_NAME: new RegExp(`(?:${_.values(RELATIONSHIP_TYPES).join('|')})\\s*\\(['"]?([^'",\\)]*)`),
  THROUGH_MODEL_NAME: new RegExp(`\\s*through\\s*\\(['"]?([^,'"\\)]*)`),
  RELATION_FUNCTION_PARAMS: new RegExp(`(?:${_.values(RELATIONSHIP_TYPES).join('|')})\\s*\\(.*,*\\s*\\[['"]([^\\'"]*)`),
  RELATION_COMMENT: /\/\*+\s*relationship\s*([^\*]*)/
})

const capture = (str, matcher) => {
  if (matcher.test(str)) {
    const value = str.match(matcher)[1]
    if (value === 'null') return null
    if (value === 'false') return false
    if (value === 'true') return true
    return value
  }
  return null
}

module.exports = (Model, options) => {
  const instance = new Model()
  const proto = Reflect.getPrototypeOf(instance)

  options = _.defaults(options, {
    modelName: inflection.classify(_.toLower(instance.tableName))
  })

  const relationships = {}
  for (let prop of Reflect.ownKeys(proto)) {
    if (_.includes(['constructor', 'tableName', 'idAttribute'], prop)) continue

    const functionString = proto[prop].toString()
    const innerBlock = functionString.match(MATCHERS.INNER_FUNCTION_BLOCK)

    // Handle defining relations via relationships comment
    const relationComment = capture(functionString, MATCHERS.RELATION_COMMENT)
    if (relationComment) {
      relationships[prop] = {
        name: prop,
        type: capture(relationComment, /type:([^\s]*)/),
        // through: Boolean(capture(relationComment, /through:([^\s]*)/)),
        keyFrom: capture(relationComment, /keyFrom:([^\s]*)/),
        keyTo: capture(relationComment, /keyTo:([^\s]*)/),
        modelFrom: capture(relationComment, /modelFrom:([^\s]*)/) || options.modelName,
        modelTo: capture(relationComment, /modelTo:([^\s]*)/),
        modelThrough: capture(relationComment, /modelThrough:([^\s]*)/),
        keyThrough: capture(relationComment, /keyThrough:([^\s]*)/),
        multiple: capture(relationComment, /multiple:([^\s]*)/)
      }
      if (!relationships[prop].multiple) {
        switch (relationships[prop].type) {
          case RELATIONSHIP_TYPES.BELONGS_TO:
            relationships[prop].multiple = false
            break
          case RELATIONSHIP_TYPES.HAS_ONE:
            relationships[prop].multiple = false
            break
          default:
            relationships[prop].multiple = true
        }
      }

      continue
    }

    if (proto.relations && proto.relations[prop]) {
      relationships[prop] = {
        name: prop,
        type: proto.relations[prop].type || null,
        keyFrom: proto.relations[prop].keyFrom || null,
        keyTo: proto.relations[prop].keyTo || null,
        modelFrom: proto.relations[prop].modelFrom || null,
        modelTo: proto.relations[prop].modelTo || null,
        modelThrough: proto.relations[prop].modelThrough || null,
        keyThrough: proto.relations[prop].keyThrough,
        multiple: capture(relationComment, /multiple:([^\s]*)/)
      }
      if (!relationships[prop].multiple) {
        switch (relationships[prop].type) {
          case RELATIONSHIP_TYPES.BELONGS_TO:
            relationships[prop].multiple = false
            break
          case RELATIONSHIP_TYPES.HAS_ONE:
            relationships[prop].multiple = false
            break
          default:
            relationships[prop].multiple = true
        }
      }
      continue
    }

    if (!innerBlock || !MATCHERS.RELATIONSHIP_TYPE.test(innerBlock)) continue

    relationships[prop] = {
      name: prop,
      type: capture(functionString, MATCHERS.RELATIONSHIP_TYPE),
      // through: MATCHERS.THROUGH.test(functionString),
      keyFrom: null,
      keyTo: null,
      modelFrom: options.modelName,
      modelTo: capture(functionString, MATCHERS.MODEL_TO_NAME),
      modelThrough: capture(functionString, MATCHERS.THROUGH_MODEL_NAME),
      keyThrough: null,
      multiple: false
    }

    const fk = capture(functionString, MATCHERS.RELATION_FUNCTION_PARAMS)

    if (RELATIONSHIP_TYPES.BELONGS_TO === relationships[prop].type) {
      relationships[prop].keyFrom = fk || _.snakeCase(`${relationships[prop].modelTo}_id`)
      relationships[prop].keyTo = proto.idAttribute || 'id'
      relationships[prop].multiple = false
    } else if (RELATIONSHIP_TYPES.HAS_ONE === relationships[prop].type) {
      relationships[prop].multiple = false
    } else {
      relationships[prop].keyTo = fk || _.snakeCase(`${relationships[prop].modelFrom}_id`)
      relationships[prop].keyFrom = proto.idAttribute || 'id'
      relationships[prop].multiple = true
    }

    if (relationships[prop].modelThrough) {
      relationships[prop].keyThrough = _.snakeCase(`${relationships[prop].modelTo}_id`)
    }
  }
  return relationships
}
