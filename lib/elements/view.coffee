clone = (obj) ->
	tap({}, (stub) -> stub[key] = value for key, value of obj)

tap = (obj, func) -> 
	func(obj)
	obj

Polymer 'phusion-view',
	ready: () ->
		@dataLoaders = []
		@addEventListener 'registerDataLoader', (e) =>
			@dataLoaders.push(e.detail)
		@asyncFire('registerView', @)

	# Called when this view is visited, or if the parameters change
	visit: (params) ->
		# If this view is not already loased, or the parameters have changed since last visit
		if !@loaded || JSON.stringify(params) != JSON.stringify(@lastParams)
			# Load the data for this view, and for each dataLoader in this view
			@loadData(clone(params))
			@dataLoaders.forEach((e)-> e.loadData(clone(params)))

			# When a user is logged in, set loaded to true to cache this view
			App.user () => # TODO: App.user
				@loaded = true

		@lastParams = params

		if @requiresAuthentication()
			App.user () => @show() # TODO: App.user
		else
			@show()

	# Called when navigated from this view to another view
	leave: (params, new_view) ->
		@hide(new_view)
		# If after 30 seconds this view is not visible, unload all data for this view
		setTimeout(() =>
			if not @visible
				@unloadData()
				@dataLoaders.forEach((e)-> e.unloadData?())
				@loaded = false
		, 30000)

	# Called when this view is shown. Override to animate this transition
	show: () ->
		@visible = true
		@classList.add 'active'
		# When a view is shown we are not loading anymore.
		document.body.className = document.body.className.replace(/not-loaded/,'')

	# Called when this view is hidden. Override to animate this transition
	hide: () ->
		@visible = false
		@classList.remove 'active'

	# When a view is first visited, loadData is called.
	# If the view is left, unloadData is called after a 30 second timeout, unless the view is visible after that timeout.
	# If the view is visited again before the timeout, and the parameters are the same as before, loadData is not called again, and the old data is used.
	# If the view is visited after the timeout, it is treated as if the view is first visited.

	# Override this to load data for this view. When loading data, old data should always be cleared first.
	loadData: (params) ->

	# Override this to unload data for this view. This means clearing the old data, and stopping any outstanding subscriptions.
	unloadData: () ->

	# Override this and return false if your view does not require authentication.
	requiresAuthentication: ->
		true
