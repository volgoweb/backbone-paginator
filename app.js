$(document).ready(function(){
// модель одной задачи
mTask = Backbone.Model.extend({});

// модель коллекции задач
cmTasks = Backbone.Collection.extend({
				model: mTask,
				url: '/get-tasks.php',
				urlCount: '/get-tasks.php?p=count',

				initialize: function() {
					this.count = null;
					this.baseUrl = this.url;
					this.getCount();
				},			
				
				// получение полного количества объектов в коллекции
				getCount: function() {
					var thisCollection = this;
					$.ajax({
						type: 'GET',
						url: this.urlCount,
						dataType: 'json',
						success: function(data) {
							var count = parseInt(data);
							if (count) thisCollection.count = data;
						}
					});
				},
				
				// переопределяем метод получения данных коллекции
				fetchPart: function(options) {
					offset = parseInt(options.offset);
					limit = parseInt(options.limit);

					this.url = this.baseUrl + '?offset=' + offset + '&limit=' + limit;

					this.fetch();
				},
});

tasks = new cmTasks();


// view таблицы задач
vTableTasks = Backbone.View.extend({
  events: {
		"click #pager li": "openPage"
	},
	initialize: function(args) {
		this.el = args.el
		this.perPage = args.perPage;
		this.cuttentPage = 1;

		this.collection.on('sync', this.prepare, this);
		this.collection.on('sync', this.render, this);

		this.collection.fetchPart({offset: 0, limit: args.perPage});
	},

	prepare: function() {
		if (!this.countPages) {
			this.calcCountPages().renderPaginator();
		}
		return this;
	},

	render: function() {
		var thisView = this;

		var html = '';
		for (var i in	this.collection.models) {
			var m = this.collection.models[i];
			html += '<div>'+m.get('name')+'</div>';
			// this.$elem.append('<div>'+m.get('name')+' ___</div>');
		}	
		$(this.el).find('.content').html(html);

		return this;
	},

	renderPaginator: function() {
		$('#pager').append('<li offset="0">1</li><li offset="2">2</li>');
		return this;
	},

	calcCountPages: function() {
		var count = Math.ceil(this.collection.count / this.perPage);
		this.countPages = count;
		return this;
	},
	//events: 

	openPage: function(e) {
		$(e.target).css('color', 'red');
		var offset = $(e.target).attr('offset');
		this.collection.fetchPart({offset: offset, limit: this.perPage});
	},

});

viewTasks = new vTableTasks({el: '#table', collection: tasks, perPage: 2});


function obj() {
	this.getCount = function() {
		
	};
};

});
