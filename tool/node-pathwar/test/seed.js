"use strict";


var _ = require('lodash'),
    chai = require("chai"),
    debug = require("debug")("tests"),
    Client = require(".."),
    util = require("util"),
    should = chai.should();


var valid_token = 'root-token',
    api_endpoint = null;

// if we run using Docker
if (process.env['API_PORT_5000_TCP_ADDR']) {
  api_endpoint = 'http://' + process.env['API_PORT_5000_TCP_ADDR'] + ':' + process.env['API_PORT_5000_TCP_PORT'] + '/';
}

var inspect = function(name, obj) {
  debug(name, util.inspect(obj, {showHidden: false, depth: null}));
};


suite("[seed]", function() {
  var client;

  setup(function() {
    var options = {
      token: valid_token
    };
    if (api_endpoint) {
      options['api_endpoint'] = api_endpoint;
    }
    client = new Client(options);
  });

  teardown(function() {
    client = null;
  });

  suite('#checks', function() {
    test("should have an empty database", function(done) {
      client.get("/levels").then(
        function(res) {
          inspect('res', res);
          try {
            (res.body._meta.total).should.equal(0);
            done();
          } catch (e) {
            done(e);
          }
        },
        function(err) {
          inspect('err', err);
          done(err);
        });
    });

    test("should create a user-tokens(is_session=true) as user", function(done) {
      client.post("/user-tokens", {
        is_session: true
      }).then(
        function(res) {
          inspect('res', res);
          try {
            (res.statusCode).should.equal(201);
            (res.body._status).should.equal('OK');
            (res.body._links.self.title).should.equal('user token');
            done();
          } catch (e) {
            done(e);
          }
        },
        function(err) {
          inspect('err', err);
          done(err);
        }
      );
    });
  });

  suite('#seed', function() {
    var refs = {};

    suite('#as-admin', function() {

      test("should create some sessions as admin", function(done) {
        var objects = [{
          name: 'world',
          public: true
        }, {
          name: 'beta',
          public: false
        }, {
          name: 'Epitech2015',
          public: false
        }];
        client.post("/sessions", objects).then(
          function(res) {
            inspect('res', res);
            try {
              (res.statusCode).should.equal(201);
              (res.body._status).should.equal('OK');
              (res.body._items.length).should.equal(objects.length);
              var ids = [];
              for (var idx in res.body._items) {
                var item = res.body._items[idx];
                ids.push(item._id);
                (item._status).should.equal('OK');
                (item._links.self.title).should.equal('session');
              }
              refs['sessions'] = ids;
              done();
            } catch (e) {
              done(e);
            }
          },
          function(err) {
            inspect('err', err);
            done(err);
          }
        );
      });

      test("should create some users as admin+user (strange)", function(done) {
        this.timeout(5000);
        var objects = [{
          login: 'joe',
          email: 'joe@pathwar.net',
          password: 'secure'
        }, {
          login: 'm1ch3l',
          email: 'm1ch3l@pathwar.net',
          active: true,
          //available_sessions: [
          //  refs['sessions'][0]['_id'],
          //  refs['sessions'][1]['_id']
          //],
          password: 'super-secure'
        }, {
          login: 'test-moderator',
          email: 'test-moderator@pathwar.net',
          role: 'moderator',
          active: true,
          password: 'super-secure'
        }, {
          login: 'test-admin',
          email: 'test-admin@pathwar.net',
          role: 'admin',
          active: true,
          password: 'super-secure'
        }, {
          login: 'test-user',
          email: 'test-user@pathwar.net',
          role: 'user',
          active: true,
          password: 'super-secure'
        }, {
          login: 'test-level-server',
          email: 'test-level-server@pathwar.net',
          role: 'level-server',
          active: true,
          password: 'super-secure'
        }];
        client.post("/users", objects).then(
          function(res) {
            inspect('res', res);
            try {
              (res.statusCode).should.equal(201);
              (res.body._status).should.equal('OK');
              (res.body._items.length).should.equal(objects.length);
              var ids = [];
              for (var idx in res.body._items) {
                var item = res.body._items[idx];
                ids.push(item._id);
                (item._status).should.equal('OK');
                (item._links.self.title).should.equal('user');
              }
              refs['users'] = ids;
              done();
            } catch (e) {
              done(e);
            }
          },
          function(err) {
            inspect('err', err);
            done(err);
          }
        );
      });

      test("should create some coupons as admin", function(done) {
        var objects = [{
          hash: '1234567890',
          value: 42,
          session: refs.sessions[0]
        }, {
          hash: '000987654321',
          value: 24,
          session: refs.sessions[1]
        }];
        client.post("/coupons", objects).then(
          function(res) {
            inspect('res', res);
            try {
              (res.statusCode).should.equal(201);
              (res.body._status).should.equal('OK');
              (res.body._items.length).should.equal(objects.length);
              var ids = [];
              for (var idx in res.body._items) {
                var item = res.body._items[idx];
                ids.push(item._id);
                (item._status).should.equal('OK');
                (item._links.self.title).should.equal('coupon');
              }
              refs['coupons'] = ids;
              done();
            } catch (e) {
              done(e);
            }
          },
          function(err) {
            inspect('err', err);
            done(err);
          }
        );
      });

      test("should create some servers as admin", function(done) {
        var objects = [{
          name: 'fake-server',
          ip_address: '1.2.3.4',
          active: true,
          token: '1234567890',
          tags: ['fake', 'dummy', 'example']
        }, {
          name: 'dedi-moul',
          ip_address: '195.154.233.249',
          active: true,
          token: '0987654321',
          tags: ['docker', 'x86_64', 'dedibox']
        }];
        client.post("/servers", objects).then(
          function(res) {
            inspect('res', res);
            try {
              (res.statusCode).should.equal(201);
              (res.body._status).should.equal('OK');
              (res.body._items.length).should.equal(objects.length);
              var ids = [];
              for (var idx in res.body._items) {
                var item = res.body._items[idx];
                ids.push(item._id);
                (item._status).should.equal('OK');
                (item._links.self.title).should.equal('server');
              }
              refs['servers'] = ids;
              done();
            } catch (e) {
              done(e);
            }
          },
          function(err) {
            inspect('err', err);
            done(err);
          }
        );
      });

      test("should create some organizations as admin/user (strange)", function(done) {
        var objects = [{
          name: 'pwn-around-the-world',
          session: refs.sessions[0]
        }, {
          name: 'staff',
          session: refs.sessions[1]
        }];
        client.post("/organizations", objects).then(
          function(res) {
            inspect('res', res);
            try {
              (res.statusCode).should.equal(201);
              (res.body._status).should.equal('OK');
              (res.body._items.length).should.equal(objects.length);
              var ids = [];
              for (var idx in res.body._items) {
                var item = res.body._items[idx];
                ids.push(item._id);
                (item._status).should.equal('OK');
                (item._links.self.title).should.equal('organization');
              }
              refs['organizations'] = ids;
              done();
            } catch (e) {
              done(e);
            }
          },
          function(err) {
            inspect('err', err);
            done(err);
          }
        );
      });

      test("should create some achievements as admin", function(done) {
        var objects = [{
          name: 'flash-gordon',
          description: 'Validate a level in less than a minute'
        }, {
          name: 'hack-the-planet',
          description: 'Finish 50 levels'
        }, {
          name: 'API-hacker',
          description: 'Hack the API'
        }];
        client.post("/achievements", objects).then(
          function(res) {
            inspect('res', res);
            try {
              (res.statusCode).should.equal(201);
              (res.body._status).should.equal('OK');
              (res.body._items.length).should.equal(objects.length);
              var ids = [];
              for (var idx in res.body._items) {
                var item = res.body._items[idx];
                ids.push(item._id);
                (item._status).should.equal('OK');
                (item._links.self.title).should.equal('achievement');
              }
              refs['achievements'] = ids;
              done();
            } catch (e) {
              done(e);
            }
          },
          function(err) {
            inspect('err', err);
            done(err);
          }
        );
      });

      test("should create some levels as admin", function(done) {
        var objects = [{
          name: 'fake-level',
          description: 'fake-description',
          price: 424242,
          tags: ['fake', 'example', 'dummy']
        }, {
          name: 'welcome',
          description: 'An easy welcome level',
          price: 42,
          tags: ['easy', 'welcome', 'official']
        }, {
          name: 'pnu',
          description: 'Possible not upload',
          price: 420,
          tags: ['php', 'advanced']
        }, {
          'name': 'calc'
        }, {
          'name': 'upload-hi'
        }, {
          'name': 'training-http'
        }, {
          'name': 'training-sqli'
        }, {
          'name': 'training-brute'
        }, {
          'name': 'training-include'
        }, {
          'name': 'training-tools'
        }, {
          'name': 'captcha'
        }];
        client.post("/levels", objects).then(
          function(res) {
            inspect('res', res);
            try {
              (res.statusCode).should.equal(201);
              (res.body._status).should.equal('OK');
              (res.body._items.length).should.equal(objects.length);
              var ids = [];
              for (var idx in res.body._items) {
                var item = res.body._items[idx];
                ids.push(item._id);
                (item._status).should.equal('OK');
                (item._links.self.title).should.equal('level');
              }
              refs['levels'] = ids;
              done();
            } catch (e) {
              done(e);
            }
          },
          function(err) {
            inspect('err', err);
            done(err);
          }
        );
      });

      test("should create some items as admin", function(done) {
        var objects = [{
          name: 'spiderpig-glasses',
          description: 'Unlock all level hints',
          price: 4242,
          quantity: 1000
        }, {
          name: 'whoswho shield',
          description: 'Cannot be attacked on whoswho',
          price: 500,
          quantity: 1
        }];
        client.post("/items", objects).then(
          function(res) {
            inspect('res', res);
            try {
              (res.statusCode).should.equal(201);
              (res.body._status).should.equal('OK');
              (res.body._items.length).should.equal(objects.length);
              var ids = [];
              for (var idx in res.body._items) {
                var item = res.body._items[idx];
                ids.push(item._id);
                (item._status).should.equal('OK');
                (item._links.self.title).should.equal('item');
              }
              refs['items'] = ids;
              done();
            } catch (e) {
              done(e);
            }
          },
          function(err) {
            inspect('err', err);
            done(err);
          }
        );
      });

      test("should create some level-hints as admin", function(done) {
        var objects = [{
          level: refs.levels[0],
          name: 'level sources',
          price: 42
        }, {
          level: refs.levels[0],
          name: 'full solution',
          price: 420
        }, {
          level: refs.levels[1],
          name: 'level sources',
          price: 42
        }];
        client.post("/level-hints", objects).then(
          function(res) {
            inspect('res', res);
            try {
              (res.statusCode).should.equal(201);
              (res.body._status).should.equal('OK');
              (res.body._items.length).should.equal(objects.length);
              var ids = [];
              for (var idx in res.body._items) {
                var item = res.body._items[idx];
                ids.push(item._id);
                (item._status).should.equal('OK');
                (item._links.self.title).should.equal('level hint');
              }
              refs['level-hints'] = ids;
              done();
            } catch (e) {
              done(e);
            }
          },
          function(err) {
            inspect('err', err);
            done(err);
          }
        );
      });

      test("should create some level-instances as admin", function(done) {
        var objects = [{
          level: refs.levels[0],
          server: refs.servers[0],
          passphrases: [
            { 'key': '0', 'value': '1234567890' },
            { 'key': '1', 'value': '0987654321' }
          ],
          urls: [
            { 'name': '80', 'url': 'http://1.2.3.4:1234/' },
            { 'name': '22', 'url': 'http://1.2.3.4:1235/' }
          ]
        }, {
          level: refs.levels[1], server: refs.servers[1]
        }, {
          level: refs.levels[2], server: refs.servers[1]
        }, {
          level: refs.levels[3], server: refs.servers[1]
        }, {
          level: refs.levels[4], server: refs.servers[1]
        }, {
          level: refs.levels[5], server: refs.servers[1]
        }, {
          level: refs.levels[6], server: refs.servers[1]
        }, {
          level: refs.levels[7], server: refs.servers[1]
        }, {
          level: refs.levels[8], server: refs.servers[1]
        }, {
          level: refs.levels[9], server: refs.servers[1]
        }, {
          level: refs.levels[10], server: refs.servers[1]
        }];
        client.post("/level-instances", objects).then(
          function(res) {
            inspect('res', res);
            try {
              (res.statusCode).should.equal(201);
              (res.body._status).should.equal('OK');
              (res.body._items.length).should.equal(objects.length);
              var ids = [];
              for (var idx in res.body._items) {
                var item = res.body._items[idx];
                ids.push(item._id);
                (item._status).should.equal('OK');
                (item._links.self.title).should.equal('level instance');
              }
              refs['level-instances'] = ids;
              done();
            } catch (e) {
              done(e);
            }
          },
          function(err) {
            inspect('err', err);
            done(err);
          }
        );
      });

      // TODO
      // ----
      // POST organization-users as admin
      // POST user-notifications as admin
      // UPDATE organization-statistics as admin

    });

    suite('#as-user', function() {

      test("should create some organization-levels (buy) as user", function(done) {
        var objects = [{
          organization: refs.organizations[0],
          level: refs.levels[0]
        }, {
          organization: refs.organizations[0],
          level: refs.levels[1]
        }, {
          organization: refs.organizations[1],
          level: refs.levels[0]
        }];
        client.post("/organization-levels", objects).then(
          function(res) {
            inspect('res', res);
            try {
              (res.statusCode).should.equal(201);
              (res.body._status).should.equal('OK');
              (res.body._items.length).should.equal(objects.length);
              var ids = [];
              for (var idx in res.body._items) {
                var item = res.body._items[idx];
                ids.push(item._id);
                (item._status).should.equal('OK');
                (item._links.self.title).should.equal('organization bought level');
              }
              refs['organization-levels'] = ids;
              done();
            } catch (e) {
              done(e);
            }
          },
          function(err) {
            inspect('err', err);
            done(err);
          }
        );
      });

      // TODO
      // ----
      // POST organization-coupons as user
      // POST organization-items as user
      // POST organization-level-validations as user
      // POST organization-achievements as user
      // POST user-organization-invites as user

    });
  });
});
