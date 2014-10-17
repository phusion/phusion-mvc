class Model
	instanceMembers: {}
	
	constructor: (data) ->
		@update(data)

	update: (data) ->
		for key,value of data
			if (klass = @instanceMembers[key])?
				if Array.isArray(value)
					if !@[key]?
						@[key] = new Array(value.length)
					for v,i in value
						if @[key][i]?
							@[key][i].update(v)
						else
							@[key][i] = new window[klass](v)
				else
					if @[key]?
						@[key].update(value)
					else
						@[key] = new window[klass](value)
			else
				@[key] = value

window.Model = Model
