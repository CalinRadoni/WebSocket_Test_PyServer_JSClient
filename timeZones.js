export { TimeZones, TimeZoneSort, TZO };

const TimeZoneSort = Object.freeze({
  None: 0,
  RLO: 1, // region / location / offset
  ROL: 2, // region / offset / location
  LRO: 3, // location / region / offset
  OLR: 4  // offset / location / region
});

class TZO {
  constructor(tzName) {
    this.name = tzName;
    const parts = tzName.split('/');
    switch (parts.length) {
      case 0:
        break;
      case 1:
        this.region = tzName;
        this.location = '';
        this.offset = NaN;
        break;
      case 2:
        this.region = parts[0];
        this.location = parts[1];
        this.offset = NaN;
        break;
      default:
        this.region = parts[0];
        this.location = parts.slice(1).join('/');
        this.offset = NaN;
        break;
    }
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

  Load(geographicalOnly = true) {
    const allTimeZones = Intl.supportedValuesOf('timeZone');
    const date = new Date();

    this.zones.length = 0; // clear the array

    allTimeZones.forEach(tz => {
      if (!geographicalOnly ||
        (tz.includes('/') && !tz.startsWith('Etc/'))) {
        const tzo = new TZO(tz);

        const dateTimeFormat = new Intl.DateTimeFormat("en-US", { timeZone: tz, timeZoneName: 'shortOffset' });
        const parts = dateTimeFormat.formatToParts(date);
        const tzoffset = parts.find(part => part.type === 'timeZoneName');
        tzo.offset = tzoffset ? tzoffset.value : NaN;

        this.zones.push(tzo);
      }
    });
  }

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

  Sort(tzs) {
    let res;
    switch (tzs) {
      case TimeZoneSort.None:
        break;
      case TimeZoneSort.RLO:
        this.zones.sort((a, b) => {
          res = a.region.attr.localeCompare(b.region.attr);
          if (res != 0)
            return res;
          res = a.location.attr.localeCompare(b.location.attr);
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
          res = a.location.attr.localeCompare(b.location.attr);
          if (res != 0)
            return res;
          res = a.region.attr.localeCompare(b.region.attr);
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
          res = a.location.attr.localeCompare(b.location.attr);
          if (res != 0)
            return res;
          return a.region.attr.localeCompare(b.region.attr);
        });
        break;
      default:
        console.error('Unknown sort type ' + tzs);
        break;
    }
  }

  GroupTimeZones() {
    this.groups = {};

    this.zones.forEach(tz => {
      if (!this.groups[tz.region])
        this.groups[tz.region] = [];
      this.groups[tz.region].push(tz);
    });

    return this.groups;
  }

  GetCurrentTimeZone() {
    const dateTimeFormat = new Intl.DateTimeFormat();
    return dateTimeFormat.resolvedOptions().timeZone;
  }
};
