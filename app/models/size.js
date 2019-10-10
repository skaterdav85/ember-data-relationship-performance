import DS from 'ember-data';

const { Model, attr, hasMany } = DS;

export default Model.extend({
  name: attr('string'),
  sortOrder: attr('number'),

  // this makes the opposite side of the relationship faster
  cars: hasMany('car', { async: false })
});