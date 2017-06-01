function Catalogue() {
  this.catalogue = {};
  this.lastResponses = {};
}

Catalogue.prototype = {
  add: function(key, item) {
    this.catalogue[key] = this.catalogue[key] || [];
    this.catalogue[key].push(item);
    return this.catalogue;
  },
  retrieve: function(key) {
    this.lastResponses[key] = (this.catalogue[key] || []).shift() || this.lastResponses[key];
    return this.lastResponses[key] || null;
  },
  delete: function(key) {
	this.catalogue[key] = [];
	this.lastResponses[key] = null;
  },
  empty: function() {
	this.catalogue = {};
	this.lastResponses = {};
  }
}

module.exports = Catalogue;
