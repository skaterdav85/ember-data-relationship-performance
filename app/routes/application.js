import Route from '@ember/routing/route';

export default Route.extend({
  beforeModel() {
    this.store.pushPayload(createColorsPayload());
    this.store.pushPayload(createSizePayload());
    this.store.pushPayload(createTypePayload());
  },

  model() {
    this.pushCarsPayload(this.createCarsPayload());
  },

  @captureTime('Loop over all cars and access all related data')
  afterModel() {
    const data = this.store.peekAll('car').map((car) => {
      return {
        size: car.size.name,
        type: car.type.name,
        colors: car.colors.mapBy('name').join(', ')
      };
    });

    console.log(data);
  },

  createCarsPayload() {
    const typeIterator = generateNextElement(this.store.peekAll('type').toArray());
    const sizeIterator = generateNextElement(this.store.peekAll('size').toArray());
    const colorIterator = generateNextElement(this.store.peekAll('color').toArray());
    
    return {
      data: Object.keys([...new Array(10000)]).map((id) => {
        return {
          id,
          type: 'car',
          attributes: {},
          relationships: {
            type: {
              data: {
                id: typeIterator.next().value.id,
                type: 'type'
              }
            },
            size: {
              data: {
                id: sizeIterator.next().value.id,
                type: 'size'
              }
            },
            colors: {
              data: [{
                id: colorIterator.next().value.id,
                type: 'color'
              }, {
                id: colorIterator.next().value.id,
                type: 'color'
              }, {
                id: colorIterator.next().value.id,
                type: 'color'
              }]
            }
          }
        }
      })
    };
  },

  @captureTime('push cars payload into store')
  pushCarsPayload(payload) {
    return this.store.pushPayload(payload);
  }
});

function *generateNextElement(array) {
  for (let i = 0; i < array.length; i++) {
    yield array[i];
    
    if (i === (array.length - 1)) {
      i = -1;
    }
  }
}

function createColorsPayload() {
  const colors = ['red', 'white', 'black', 'pink', 'green', 'blue', 'yellow', 'orange', 'green', 'teal'];

  return {
    data: colors.map((name, i) => createJsonApiResource(i, 'color', { name }))
  };
}

function createSizePayload() {
  const sizes = ['square', 'rectangle', 'circle', 'oval', 'cube', 'small', 'medium', 'large', 'extra large'];

  return {
    data: sizes.map((name, i) => createJsonApiResource(i, 'size', { name }))
  };
}

function createTypePayload() {
  const types = ['suv', 'sedan', 'minivan', 'electric', 'hybrid', 'truck', 'sport'];

  return {
    data: types.map((name, i) => createJsonApiResource(i, 'type', { name }))
  };
}

function createJsonApiResource(id, type, attributes) {
  return {
    id, type, attributes
  };
}

function captureTime(label) {
  return function(target, name, descriptor) {
    const original = descriptor.value;

    descriptor.value = function(...args) {
      console.time(label);
      let result = original.apply(this, args);
      console.timeEnd(label);
      return result;
    };
  }
}