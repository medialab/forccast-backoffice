var config = {
  urls: {},
  api: {}
};

config.urls.preview = 'your preview url';
config.urls.production = 'your production url';

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

config.api.texts = {
    repo: 'github repo name',
    owner: 'github repo owner',
    folder: 'github texts folder path',
    path: '/path/where/to/save/file/',
    name: 'texts',
    type: 'data'
  };

config.api.preview = {
    path: '/path/where/your/script/is/',
    file: 'script file name',
    name: 'preview',
    type: 'deploy'
  };

config.api.production = {
    path: '/path/where/your/script/is/',
    file: 'script file name',
    name: 'production',
    type: 'deploy'
  };

module.exports = config;
