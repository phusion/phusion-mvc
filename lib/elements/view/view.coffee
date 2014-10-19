Polymer 'phusion-view',
	ready: () ->
		@asyncFire('registerView', @)

	# Called when this view is visited
	visit: (params) ->
		# If the parameters have changed since last visit
		if JSON.stringify(params) != JSON.stringify(@lastParams)
			# Load the data for this view
			@loadData(params)

		# Save the last parameters used to visit this view
		@lastParams = params

		# Show this view
		@show()

	# Called when navigated from this view to another view
	leave: () ->
		@hide()
		@unloadData()

	# Called when this view is shown. Override to animate this transition
	show: () ->
		@classList.add 'active'

	# Called when this view is hidden. Override to animate this transition
	hide: () ->
		@classList.remove 'active'

	# Override this to load data for this view. When loading data, old data should always be cleared first.
	loadData: (params) ->

	# Override this to unload data for this view. This means stopping any outstanding data requests.
	unloadData: () ->
