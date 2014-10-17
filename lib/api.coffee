buildQueryString = (parameters) ->
	qs = []
	for key,value of parameters
		qs.push(encodeURIComponent(key) + "=" + encodeURIComponent(value))
	qs.join("&")

makeRequest = (method, path, params) ->
	xhr = new XMLHttpRequest()


	if params? and method == 'GET'
		path += '?' + buildQueryString(params)

	xhr.open(method, path, true)
	xhr.withCredentials = true

	if params? and method != 'GET'
		params = JSON.stringify(params)
		xhr.setRequestHeader('Content-Type', 'application/json')
		xhr.send(params)
	else
		xhr.send()

	dataHandler = new DataHandler()

	timer = setTimeout(( => dataHandler.timeout(path)), 5000)

	xhr.onreadystatechange = =>
		if xhr.readyState == 4
			clearTimeout(timer)
			if xhr.status >= 200 and xhr.status < 300
				try
					response = JSON.parse(xhr.responseText)
				catch err
					dataHandler.error({message: 'Request ' + path + ' returned invalid JSON', error: err})

				if response?
					dataHandler.data(response)
				else
					dataHandler.error({message: 'Request ' + path + ' returned no data'})
			else
				if xhr.status == 401
					dataHandler.unauthorized()
				else
					dataHandler.error({status: xhr.status, message: 'Request ' + path + ' failed'})

	return dataHandler

Api =
	get: (path, params) ->
		makeRequest("GET", path, params)

	put: (path, body) ->
		makeRequest("PUT", path, body)

window.Api = Api
