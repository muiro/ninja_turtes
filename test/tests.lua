os.loadAPI("turtle_message")
 
local time = turtle_message.time()
 
 
local status = turtle_message.send("test")
print(status)
local time = turtle_message.time()
print(time)