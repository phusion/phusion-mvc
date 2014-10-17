class Router
	constructor: () ->
		@router = new BrowRoute.Router(true);

		addEventListener('registerView', (e) => @registerView(e.detail))

		# Current route and current view represent the page the user is currently visiting.
		@current_route = null
		@current_view = null

		# Previous route represents the previous page the user has visited.
		# Default to home if no page was visited previously.
		@previous_route = "/"

		# Params represent the parameters of the current page.
		@params = null

		# When all Polymer elements are ready, start the router.
		addEventListener('polymer-ready', (e) => @init())

	init: () ->
		# If the current location hash is not set, default to the root path.
		if document.location.hash == ''
			document.location.hash = "/"

		# Start BrowRoute
		@router.start()

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

			# Invoke the visit function on the new view.
			new_view.visit(params)

			# Invoke the leave function on the previous view.
			previous_view.leave(params, new_view)

window.Router ||= new Router()
