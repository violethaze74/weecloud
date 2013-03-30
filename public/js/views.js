$(function() {
  ServerView = Backbone.View.extend({
    template: _.template($('#server-menu-template').html()),

    initialize: function() {
      this.listenTo(this.model, 'add:buffers', this.addBuffer);
    },

    addBuffer: function(buffer) {
      var bufferMenuView = new BufferMenuView({
        model: buffer
      });
      var bufferView = new BufferView({
        model: buffer
      });
      this.$el.after(bufferMenuView.render().$el);
      $('#buffers').children().append(bufferView.render().$el);
    },

    render: function() {
      var tpl = this.template(this.model.toJSON()).trim();
      this.setElement(tpl.trim(), true);
      return this;
    }
  });

  BufferMenuView = Backbone.View.extend({
    template: _.template($('#buffer-menu-template').html()),

    events: {
      'shown': 'open'
    },

    open: function() {
      this.model.trigger('open', this.model);
    },

    render: function() {
      var tpl = this.template(this.model.toJSON()).trim();
      this.setElement(tpl.trim(), true);
      return this;
    }
  });

  BufferView = Backbone.View.extend({
    template: _.template($('#buffer-template').html()),

    initialize: function() {
      this.listenTo(this.model, 'open', this.open);
      this.listenTo(this.model, 'add:messages', this.addMessage);
    },

    open: function() {
      var messages = this.model.get('messages');
      if (messages.length === 0) this.getMessages(messages);
      var users = this.model.get('users');
      if (users.length === 0) this.getUsers(users);
      this.scrollBottom();
    },

    getMessages: function(messages) {
      socket.emit('get:messages', this.model.id, 20, function(m) {
        _.each(m, function(message) {
          messages.add(message);
        });
      });
    },

    getUsers: function(users) {
      var userListView = new UserListView({
        model: this.model
      });
      $('#userlist').append(userListView.render().$el);

      socket.emit('get:users', this.model.id, function(u) {
        _.each(u, function(user) {
          users.add({
            title: user,
            id: user
          });
        });
      });
    },

    addMessage: function(message) {
      var view = new MessageView({
        model: message
      });
      this.$el.append(view.render().$el);
      this.scrollBottom();
    },

    scrollBottom: function() {
      $('#buffers').scrollTop($('.tab-pane.active').height());
    },

    render: function() {
      var tpl = this.template(this.model.toJSON()).trim();
      this.setElement(tpl.trim(), true);
      return this;
    }
  });

  MessageView = Backbone.View.extend({
    template: _.template($('#message-template').html()),

    render: function() {
      var tpl = this.template(this.model.toJSON()).trim();
      this.setElement(tpl.trim(), true);
      return this;
    }
  });

  InputView = Backbone.View.extend({
    el: '#input input',

    events: {
      keypress: 'keypress'
    },

    keypress: function(e) {
      if (e.keyCode !== 13) return;

      var buffer = buffers.active;
      socket.emit('message', buffer.id, this.$el.val());
      this.$el.val('');
    }
  });

  UserListView = Backbone.View.extend({
    template: _.template($('#user-list-template').html()),

    initialize: function() {
      this.listenTo(this.model, 'add:users', this.addUser);
    },

    addUser: function(user) {
      var view = new UserView({
        model: user
      });
      this.$el.append(view.render().$el);
    },

    render: function() {
      var tpl = this.template(this.model.toJSON()).trim();
      this.setElement(tpl.trim(), true);
      return this;
    }
  });

  UserView = Backbone.View.extend({
    template: _.template($('#user-template').html()),

    initialize: function() {
      this.listenTo(this.model, 'remove', this.removeUser);
    },

    removeUser: function() {
      this.$el.remove();
    },

    render: function() {
      var tpl = this.template(this.model.toJSON()).trim();
      this.setElement(tpl.trim(), true);
      return this;
    }
  });
});
