import Immutable from 'immutable';

const isImmutableIterable = Immutable.Iterable.isIterable;

const utils = {

  /** Contains exactly one item. */
  UNITARY_LIST: Immutable.List(['empty_list']),

  isImmutableIterable,

  /**
   * Return the keys from a set of data.
   *
   * @example
   * - getKeys({ foo: 'bar', baz: 'qux' }) will return [foo, baz].
   * - getKeys([2, 3, 5]) will return [0, 1, 2].
   *
   * @param {Immutable.Iterable} immutableData
   * @returns {Array} An array of keys for the data.
   */
  getKeys(immutableData) {
    if (__DEV__ && !isImmutableIterable(immutableData)) {
      console.warn(`Can't get keys: Data is not Immutable: ${JSON.stringify(immutableData)}`);
    }

    return immutableData.keySeq().toArray();
  },

  /**
   * Return a 2D array of row keys.
   *
   * @example
   * - getRowIdentities({ section1: ['row1', 'row2'], section2: ['row1'] })
   *   will return [[0, 1], [0]].
   *
   * @param {Immutable.Iterable} immutableSectionData
   * @returns {Array}
   */
  getRowIdentities(immutableSectionData) {
    if (__DEV__ && !isImmutableIterable(immutableSectionData)) {
      console.warn(`Can't get row identities: Data is not Immutable: ${JSON.stringify(immutableSectionData)}`);
    }

    const sectionRowKeys = immutableSectionData.map(this.getKeys);
    return sectionRowKeys.valueSeq().toArray();
  },

  /**
   * @param {String|Number} key
   * @param {Immutable.Iterable|Object|Array} data
   * @returns {*} The value at the given key, whether the data is Immutable or not.
   */
  getValueFromKey(key, data) {
    return data.get ? data.get(key) : data[key];
  },

  /**
   * Returns true if the data would render as empty in a ListView: that is,
   * if it either has no items, or only section headers with no section data.
   */
  isEmptyListView(immutableData, enableEmptySections) {
    if (!immutableData || immutableData.isEmpty()) {
      return true;
    }

    if (!Immutable.Map.isMap(immutableData) || enableEmptySections) {
      return false;
    }

    return immutableData.every((item) => !item || item.isEmpty());
  },

  /**
   * @returns {Immutable.OrderedMap} A new Immutable Map with its section headers flattened.
   */
  flattenMap(data) {
    return data.reduce(
      (flattened, section, key) =>
        flattened.set(key, section).merge(
          Immutable.Map.isMap(section)
            ? section
            : section.toMap().mapKeys((i) => `${key}_${i}`),
        ),
      Immutable.OrderedMap().asMutable(),
    ).asImmutable();
  },

  /**
   * @returns [Array] An array of all indices which should be sticky section headers.
   */
  getStickyHeaderIndices(immutableData) {
    const indicesReducer = (indices, section) => {
      const lastIndex = indices[indices.length - 1];
      indices.push(lastIndex + section.size + 1);
      return indices;
    };

    const indices = immutableData.reduce(indicesReducer, [0]);
    indices.pop();

    return indices;
  },

};

export default utils;