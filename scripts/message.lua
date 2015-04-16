os.loadAPI("json")
os.loadAPI("uuid")

function send(message)
	local data = {}
	data.uuid = uuid.Generate()
	local game_time = os.time()
	data.game_time = textutils.formatTime(game_time, false)
	data.message = message
	data.computer_name = os.computerLabel()
	data.computer_id = os.computerID()

	local time2 = time()

	data.time = time2

	local data_string = json.encode(data)
	local response = http.post("http://localhost:3000/api/message", data_string)

	return response.readAll()
end

function time()
	local response = http.get("http://localhost:3000/api/time")
	return response.readAll()
end