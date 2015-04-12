os.loadAPI("json")
os.loadAPI("uuid")

function send(message)
	local data = {}
	data.uuid = uuid.Generate()
	local game_time = os.time()
	data.game_time = textutils.formatTime(game_time, false)
	data.message = message

	local data_string = json.encode(data)
	local response = http.post("http://localhost:3000/api/turtle_message", data_string)

	print(response)
end