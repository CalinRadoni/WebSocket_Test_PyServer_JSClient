/**
 * @file {@link TimeZones} Manage a list of known timezones.
 * 
 * - The list can be sorted, {@link TimeZones.Sort}, by region, location and offset - @see {@link TimeZoneSort};
 * - The timezones can be grouped by region, {@link TimeZones.GroupTimeZones}.
 *   Grouping is usefull if displayed in a list, like `select` + `optgroup`s;
 * - {@link TimeZones.GetCurrentTimeZone} returns the timezone of user's browser.
 * 
 * @version 1.1.0
 * @copyright Calin Radoni 2026 {@link https://github.com/CalinRadoni}
 * @license MIT License
 */

export { TimeZones, TimeZoneSort, TZO };

/**
 * These are the sorting options used by `TimeZones.Sort` function.
 */
const TimeZoneSort = Object.freeze({
  None: 0,
  RLO: 1, // region / location / offset
  ROL: 2, // region / offset / location
  LRO: 3, // location / region / offset
  OLR: 4  // offset / location / region
});

/**
 * This is the definition of timezone objects used by `TimeZones` internally.
 */
class TZO {
  constructor(tzName) {
    this.name = tzName;
    this.region = '';
    this.location = '';
    this.offset = NaN;

    const parts = tzName.split('/');
    if (parts.length == 0) return;

    this.region = parts[0];
    if (parts.length == 1) return;

    if (parts.length == 2)
      this.location = parts[1];
    else
      this.location = parts.slice(1).join('/');
  }

  Set(region, location, offset = NaN) {
    this.name = tzName;
    this.region = region;
    this.location = location;
    this.offset = offset;
  }

  ComputeOffset() {
    const date = new Date();
    const dateTimeFormat = new Intl.DateTimeFormat("en-US", { timeZone: this.name, timeZoneName: 'shortOffset' });
    const parts = dateTimeFormat.formatToParts(date);
    const tzoffset = parts.find(part => part.type === 'timeZoneName');
    this.offset = tzoffset ? tzoffset.value : NaN;
  }
};

class TimeZones {
  constructor() {
    this.zones = [];
    this.groups = {};
  }

  /**
   * Returns the list of timezones.
   * 
   * If `geographicalOnly` is `true`, then:
   *    - `UTC` is excluded
   *    - `Etc/...` are excluded
   */
  Load(geographicalOnly = true, includeUTC = true) {
    const allTimeZones = Intl.supportedValuesOf('timeZone');
    const date = new Date();

    this.zones.length = 0; // clear the array

    allTimeZones.forEach(tz => {
      let addEntry = !geographicalOnly;
      if (geographicalOnly) {
        if (tz == 'UTC') {
          addEntry = includeUTC;
        }
        else {
          if (tz.includes('/') && !tz.startsWith('Etc/'))
            addEntry = true;
        }
      }

      if (addEntry) {
        const tzo = new TZO(tz);

        const dateTimeFormat = new Intl.DateTimeFormat("en-US", { timeZone: tz, timeZoneName: 'shortOffset' });
        const parts = dateTimeFormat.formatToParts(date);
        const tzoffset = parts.find(part => part.type === 'timeZoneName');
        tzo.offset = tzoffset ? tzoffset.value : NaN;

        this.zones.push(tzo);
      }
    });
  }

  /**
   * Transform a `GMT+/-...` string to the corresponding number.
   * Any other string should return 0.
   * 
   * @example
   * GMT-02:30 is converted to -2.5
   */
  GMT2Number(str) {
    if (!str.toUpperCase().startsWith('GMT'))
      return 0;
    let s = str.slice(3);
    if (s.length == 0)
      return 0;
    if (!s.includes(':'))
      return Number(s);

    const parts = s.split(':');
    let n = Number(parts[0]);
    let f = Number(parts[1]);
    if (f < 0 || f > 59)
      return n;

    f = f / 60;
    if (n >= 0) n += f;
    else n -= f;
    return n;
  }

  CompareOffsets(o1, o2) {
    return this.GMT2Number(o1) - this.GMT2Number(o2);
  }

  /**
   * Sort the list of timezones based on the `tzs` parameter.
   */
  Sort(tzs) {
    let res;
    switch (tzs) {
      case TimeZoneSort.None:
        break;
      case TimeZoneSort.RLO:
        this.zones.sort((a, b) => {
          res = a.region.localeCompare(b.region);
          if (res != 0)
            return res;
          res = a.location.localeCompare(b.location);
          if (res != 0)
            return res;
          return this.CompareOffsets(a.offset, b.offset);
        });
        break;
      case TimeZoneSort.ROL:
        this.zones.sort((a, b) => {
          res = a.region.localeCompare(b.region);
          if (res != 0)
            return res;
          res = this.CompareOffsets(a.offset, b.offset);
          if (res != 0)
            return res;
          return a.location.localeCompare(b.location);
        });
        break;
      case TimeZoneSort.LRO:
        this.zones.sort((a, b) => {
          res = a.location.localeCompare(b.location);
          if (res != 0)
            return res;
          res = a.region.localeCompare(b.region);
          if (res != 0)
            return res;
          return this.CompareOffsets(a.offset, b.offset);
        });
        break;
      case TimeZoneSort.OLR:
        this.zones.sort((a, b) => {
          res = this.CompareOffsets(a.offset, b.offset);
          if (res != 0)
            return res;
          res = a.location.localeCompare(b.location);
          if (res != 0)
            return res;
          return a.region.localeCompare(b.region);
        });
        break;
      default:
        console.error('Unknown sort type ' + tzs);
        break;
    }
  }

  /**
   * Returns an object with properties named after regions.
   * Each *region* member contains an array with all timezones from that region.
   */
  GroupTimeZones() {
    this.groups = {};

    this.zones.forEach(tz => {
      if (!this.groups[tz.region])
        this.groups[tz.region] = [];
      this.groups[tz.region].push(tz);
    });

    return this.groups;
  }

  /**
   * Returns the timezone of user's browser
   */
  GetCurrentTimeZone() {
    const dateTimeFormat = new Intl.DateTimeFormat();
    return dateTimeFormat.resolvedOptions().timeZone;
  }
};
