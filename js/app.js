app = {
	debug: true,
	log: {},
	models: {},
	collections: {},
	views: {},
	controllers: {},
	init: {},
	run: {},
};

// Вывод объектов в консоль (Только в режиме отладки при app.debug равным true)
app.log = function(obj) {
	if (app.debug) console.log(obj);
};


$(document).ready(function(){
  app.init();
  app.run();
});


app.init = function() {
	// Роутинг
	app.controllers.Controller = Backbone.Router.extend({
		routes: {
			'page/:page': 'changePage'
		}
	});

	app.controllers.controller = new app.controllers.Controller(); // Создаём контроллер

	// модель одной задачи
	app.models.mTask = Backbone.Model.extend({});


	// модель коллекции задач
	app.collections.cmTasks = Backbone.Collection.extend({
					model: app.models.mTask,
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


	// view таблицы задач
	app.views.vTableTasks = Backbone.View.extend({
		initialize: function(args) {
			this.el = args.el
			this.perPage = args.perPage;
			this.currentPage = 1;
			this.pager = $('#pager');

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

		// Формируем html код блока пагинации
		renderPaginator: function() {
			this.pager.html();

			for (var i = 1; i <= this.countPages; i++) {
				var offset = (i - 1) * this.perPage;
				var li = $('<li offset="' + offset + '" num="' + i + '">' + i + '</li>');
				this.pager.append(li);
			}

			// установим текущую страницу
			this.setCurrentPage(this.currentPage);

			return this;
		},

		calcCountPages: function() {
			var count = Math.ceil(this.collection.count / this.perPage);
			this.countPages = count;
			return this;
		},

		openPage: function(page) {
			var offset = (page - 1) * this.perPage;

			this.collection.fetchPart({offset: offset, limit: this.perPage});

			// обновляем значение текущей страницы
			this.setCurrentPage( page );
			
			app.controllers.controller.navigate('page/' + page, {trigger: true});
		
		},

		setCurrentPage: function(currentPage) {
			this.currentPage = currentPage;
			// app.log(currentPage);
			this.pager.find('li').removeClass('active');
			this.pager.find('li[num=' + currentPage + ']').addClass('active');
		},

		// Events
		events: {
			"click #pager li": "handlerOpenPage"
		},

		handlerOpenPage: function(e) {
			var page  = parseInt($(e.target).text());
			// app.log(page);
			this.openPage(page);
		},
	});

};

app.run = function() {
	app.collections.tasks = new app.collections.cmTasks();
	app.views.viewTasks = new app.views.vTableTasks({el: '#table', collection: app.collections.tasks, perPage: 2});

	// Роутинг
	app.controllers.controller.on('route:changePage', function(page) {
		app.log('controller help '+ page);
		// console.log(app.views.viewTasks);
		app.views.viewTasks.openPage(page);
	});

	Backbone.history.start({pushState: true});  // Запускаем HTML5 History push 
};

