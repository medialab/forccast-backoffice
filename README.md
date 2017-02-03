# forccast-backoffice

##Installation
If you want to run your instance of forccast-backoffice locally on your machine, be sure you have the following requirements installed.

###Requirements

- [git](http://git-scm.com/book/en/Getting-Started-Installing-Git)
- [Bower](http://bower.io/#installing-bower)
- [Node](https://nodejs.org/en/)
- [gulp-cli](http://gulpjs.com/)

###Instructions

Clone forccast-backoffice from the command line:

``` sh
$ git clone https://github.com/calibro/forccast-backoffice.git
```

browse to forccast-backoffice root folder:

``` sh
$ cd forccast-backoffice
```

install dependencies:

``` sh
$ npm install
```

``` sh
$ bower install
```

add configuration file:

``` sh
$ cp config/config.sample.js config/config.js
```

open the file ```config/config.js``` and fill the information requested.

You can now run forccast-backoffice from local web server.

``` sh
$ gulp
```

Once this is running, go to [http://localhost:3000/](http://localhost:3000/).
