class Router
	constructor: () ->
		@router = new BrowRoute.Router(true);

		addEventListener('registerView', (e) => @registerView(e.detail))

	# Register a new view. This is triggered by the 'registerView' event, emitted by all Views.
	registerView: (view) ->
		@router.on view.route, (params) =>
			new_view = view
			new_route = window.location.hash

			# If the route stays the same
			if new_route == @current_route
				# Stay at the current view
				return

			previous_view = @current_view
			@current_view = new_view
			@current_route = new_route

			# Visit the new view
			new_view.visit(params)

			# Leave the old view
			previous_view.leave()

window.Router ||= new Router()
