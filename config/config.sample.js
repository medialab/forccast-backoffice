var config = {
  api: {}
};

config.api.projects = {
    id: 'Google spreadsheet id',
    gid: 'sheet gid',
    path: '/path/where/to/save/file/',
    name: 'projects',
    type: 'data'
  };

config.api.resources = {
    id: 'Google spreadsheet id',
    gid: 'sheet gid',
    path: '/path/where/to/save/file/',
    name: 'resources',
    type: 'data'
  };

config.api.team = {
    id: 'Google spreadsheet id',
    gid: 'sheet gid',
    path: '/path/where/to/save/file/',
    name: 'team',
    type: 'data'
  };

config.api.partners = {
    id: 'Google spreadsheet id',
    gid: 'sheet gid',
    path: '/path/where/to/save/file/',
    name: 'partners',
    type: 'data'
  };

config.api.calendar = {
    apiKey: 'your google api key to access the calendar',
    calendarId: 'calendar id (calandar must be public)',
    path: '/path/where/to/save/file/',
    name: 'calendar',
    type: 'data'
  };

config.api.news = {
    url: {
        en: 'your english rss url',
        fr: 'your french rss url'
      },
    path: '/path/where/to/save/file/',
    name: 'news',
    type: 'data'
  };


module.exports = config;
