/*
 * Основной объект приложения 
 */
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

			/*
			 * получение полного количества объектов в коллекции
			 */
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
	}); // -- END app.collections.cmTasks


	// view таблицы задач
	app.views.vTableTasks = Backbone.View.extend({
			initialize: function(args) {
				this.el = args.el
				this.perPage = args.perPage;
				this.pager = $( args.pagerEl );

				this.collection.on('sync', this.prepare, this);
				this.collection.on('sync', this.render, this);

				// this.collection.fetchPart({offset: 0, limit: args.perPage});

				// добавляем обработчики внутренних событий
				this.on('change:page', this.openPage, this);
				this.on('change:page', this.markCurrentPage, this);

				// устанавливаем дефолтное значение страницы (от этого сработает триггер и отрендерится коллекция)
				if (! this.page) this.setPage( 1 );
			},

			prepare: function() {
				if (!this.countPages) {
					this.calcCountPages().renderPaginator();
				}
				return this;
			},

			render: function() {
				var thisView = this;

				$(this.el).find('.content').html('');
				for (var i in	this.collection.models) {
					var model = this.collection.models[i];
					this.renderItem(model).appendTo( $(this.el).find('.content') );
				}	

				return this;
			},

			/*
			 * Возвращает jquery объект модели
			 */
			renderItem: function(model) {
				return $('<div/>', {
						text: model.get('name')
				});
			},

			/*
			 * Формируем html код блока пагинации
			 */
			renderPaginator: function() {
				this.pager.html();

				for (var i = 1; i <= this.countPages; i++) {
					var offset = (i - 1) * this.perPage;
					this.renderPaginatorPage(offset, i).appendTo( this.pager );
				}

				// установим текущую страницу
				this.setPage(this.page);

				return this;
			},

			/*
			 * Формирует jquery объект с ссылкой номера страницы в блоке пагинаторе
			 */
			renderPaginatorPage: function(offset, num) {
				return $('<li/>', {
					text:		num
				})
				.attr('offset', offset)
				.attr('num', num);
			},

			/*
			 * Выделяет ссылку текущей страницы в блоке пагинатора
			 */
			markCurrentPage: function() {
				this.pager.find('li').removeClass('active');
				this.pager.find('li[num=' + this.page + ']').addClass('active');
			},

			/*
			 * Высчитывает количество страниц, на которых можно уместить абсолютно всю коллекцию, 
			 * разбив на perPage объектов на странице
			 */
			calcCountPages: function() {
				var count = Math.ceil(this.collection.count / this.perPage);
				this.countPages = count;
				return this;
			},

			/*
			 * Обновляет коллекцию согласно номеру текущей страницы и 
			 * автоматически срабатывает триггер, после которого заново рендерится коллекция
			 */
			openPage: function() {
				var offset = (this.page - 1) * this.perPage;

				this.collection.fetchPart({offset: offset, limit: this.perPage});
				
				app.controllers.controller.navigate('page/' + this.page, {trigger: true});
			},

			/*
			 * Меняет значение текущей страницы
			 */
			setPage: function(page) {
				this.page = page;
				this.trigger('change:page');
			},

			// Events
			events: {
				"click #pager li": "changePage"
			},

			/*
			 * Обработчик клика по ссылке номера страницы в пагинаторе
			 */
			changePage: function(e) {
				page  = parseInt($(e.target).text());
				this.setPage( page );
			},
	}); // -- END app.views.vTableTasks
}; // -- END app.init


app.run = function() {
	app.collections.tasks = new app.collections.cmTasks();
	app.views.viewTasks = new app.views.vTableTasks({el: '#table', pagerEl: '#pager', collection: app.collections.tasks, perPage: 2});

	// Роутинг
	app.controllers.controller.on('route:changePage', function(page) {
		app.log('controller help '+ page);
		// console.log(app.views.viewTasks);
		app.views.viewTasks.setPage(page);
	});

	Backbone.history.start({pushState: true});  // Запускаем HTML5 History push 
}; // -- END app.run

