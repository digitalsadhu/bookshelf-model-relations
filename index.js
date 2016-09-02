'use strict'

const _ = require('lodash')
const inflection = require('inflection')

// TODO: allow comment syntax to allow the user to override the relationship definition for a model
// TODO: handle polymorphic
// TODO: check belongstoMany is correct (matches loopbacks approach)
// TODO: handle passed in table names in relationship defns. eg. this.belongsTo(Comment, ['commentid'])
// also this.belongsToMany(Post, ['comment_posts'], ['comment_id'], ['post_id']

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
    return value
  }
  return null
}

module.exports = (Model, options) => {
  const instance = new Model()
  const proto = Reflect.getPrototypeOf(instance)

  options = _.defaults(options, {
    modelName: _.upperFirst(inflection.singularize(_.toLower(instance.tableName)))
  })

  const relationships = {}
  for (let prop of Reflect.ownKeys(proto)) {
    if (_.includes(['constructor', 'tableName', 'idAttribute'], prop)) continue

    const functionString = proto[prop].toString()
    const innerBlock = functionString.match(MATCHERS.INNER_FUNCTION_BLOCK)

    const relationComment = capture(functionString, MATCHERS.RELATION_COMMENT)
    if (relationComment) {
      relationships[prop] = {
        name: prop,
        type: capture(relationComment, /type:([^\s]*)/),
        through: Boolean(capture(relationComment, /through:([^\s]*)/)),
        keyFrom: capture(relationComment, /keyFrom:([^\s]*)/),
        keyTo: capture(relationComment, /keyTo:([^\s]*)/),
        modelFromName: capture(relationComment, /modelFromName:([^\s]*)/) || options.modelName,
        modelToName: capture(relationComment, /modelToName:([^\s]*)/),
        throughModelName: capture(relationComment, /throughModelName:([^\s]*)/)
      }
      continue
    }

    if (!innerBlock || !MATCHERS.RELATIONSHIP_TYPE.test(innerBlock)) continue

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

    const fk = capture(functionString, MATCHERS.RELATION_FUNCTION_PARAMS)

    if (RELATIONSHIP_TYPES.BELONGS_TO === relationships[prop].type) {
      relationships[prop].keyFrom = fk || _.snakeCase(`${relationships[prop].modelToName}_id`)
    } else {
      relationships[prop].keyTo = fk || _.snakeCase(`${relationships[prop].modelFromName}_id`)
    }
  }
  return relationships
}
