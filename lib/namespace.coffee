Polymer 'phusion-namespace',
	ready: () ->
		@addEventListener('registerView', (e) -> @registerView(e.detail))

	registerView: (view) ->
		view.route = @namespace + view.route
