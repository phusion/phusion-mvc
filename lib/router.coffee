exports = window

merge = (objects...) ->
	if objects?.length > 0
		tap({}, (stub) -> stub[key] = value for key, value of obj for obj in objects)

tap = (obj, func) -> 
	func(obj)
	obj

class Router
	constructor: () ->
		@router = new BrowRoute.Router(true);

		# Current route and current view represent the page the user is currently visiting.
		@current_route = null
		@current_view = null

		# Previous route represents the previous page the user has visited.
		# Default to home if no page was visited previously.
		@previous_route = "/"

		# Params represent the parameters of the current page.
		@params = null

		addEventListener('registerView', (e) => @registerView(e.detail))

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
		@router.on view.route, (params, options) =>
			new_view = view
			new_route = window.location.hash

			if new_route == @current_route
				# Stay at the current view
				return

			@params = merge(params, options)

			previous_view = @current_view
			@current_view = new_view

			# If the previous view does not want to be included in the goBack history, do not save the route.
			if previous_view? && !previous_view.noRouteHistory
				@previous_route = @current_route
			@current_route = new_route

			# invoke the visit function on the new view.
			new_view.visit(params)

			# invoke the leave function on the old view.
			if previous_view? && previous_view != @current_view
				previous_view.leave(params, new_view)

	# goBack returns to the previous view
	goBack: () ->
		window.location.hash = @previous_route

exports.Router ||= new Router()
