class DataHandler
	constructor: () ->
		@processors = []
		@stopped = false
		@eventHandlers =
			data: []
			error: []
			timeout: []
			unauthorized: []
			stop: []

	on: (name, handler) ->
		if !@eventHandlers[name]?
			throw "No such event: \"" + name + "\" on DataHandler"
		@eventHandlers[name].push handler

	processData: (func) ->
		@processors.push(func)

	data: (data) ->
		if @stopped
			return

		for processor in @processors
			data = processor(data)
			if !data? # A processor can return null if the data is not yet complete.
				return

		if !data? || data.length == 0
			@error({message: 'Empty data received', data: data})
			return

		handler(data) for handler in @eventHandlers.data

	error: (data) ->
		if @stopped
			return

		handler(data) for handler in @eventHandlers.error

	timeout: (data) ->
		if @stopped
			return

		handler() for handler in @eventHandlers.timeout

	unauthorized: ->
		if @stopped
			return

		handler() for handler in @eventHandlers.unauthorized

	stop: () ->
		@stopped = true
		handler() for handler in @eventHandlers.stop

window.DataHandler = DataHandler
