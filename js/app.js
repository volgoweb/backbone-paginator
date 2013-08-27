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
		//events: 

		openPage: function(e) {
			var offset = $(e.target).attr('offset');
			this.collection.fetchPart({offset: offset, limit: this.perPage});

			// обновляем значение текущей страницы
			var currentPage  = parseInt($(e.target).text());
			this.setCurrentPage( currentPage );
		},

		setCurrentPage: function(currentPage) {
			this.currentPage = currentPage;
			this.pager.find('li').removeClass('active');
			this.pager.find('li[num=' + currentPage + ']').addClass('active');
		},

	});

	viewTasks = new vTableTasks({el: '#table', collection: tasks, perPage: 2});

});
