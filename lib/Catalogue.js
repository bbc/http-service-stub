'use strict';

function Catalogue() {
  this.classifications = generateClassifications();
  this.lastRequestedItem = generateClassifications();
}

Catalogue.prototype = {
  add: function(classification, key, content) {
    this.classifications[classification][key].unshift(content);
    return this.classifications;
  },
  retrieve: function(classification, key) {
    this.lastRequestedItem[classification][key] = this.classifications[classification][key].shift() || this.lastRequestedItem[classification][key];
    return this.lastRequestedItem[classification][key] || null;
  },
  delete: function(classification, key) {
    this.classifications[classification][key] = [];
    this.lastRequestedItem[classification][key] = null;
  },
  empty: function(classification) {
    this.classifications[classification] = generateEntries();
    this.lastRequestedItem[classification] = {};
  }
}

function generateClassifications() {
  return new Proxy({}, { 
    get: function(target, property) { 
      return target[property] = target.hasOwnProperty(property) ? target[property] : generateEntries(); 
    }
  });
}

function generateEntries() {
  return new Proxy({}, { 
    get: function(target, property) { 
      return target[property] = target.hasOwnProperty(property) ? target[property] : []; 
    }
  });
}

module.exports = Catalogue;
