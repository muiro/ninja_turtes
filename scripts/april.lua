rednet.open("left")
local monitor = peripheral.wrap("right")
monitor.clear()
monitor.setCursorPos(1,1)
monitor.setTextColor(16)
monitor.write("April O'Neil, reporting live!")
monitor.setTextColor(1)
local line = 2
print("April O'Neil, reporting live!")
while true do
  id,message = rednet.receive()
  local time = os.time()
  local print_time = textutils.formatTime(time, false)
  monitor.setCursorPos(1, line)
  line = line + 1
  monitor.write(print_time .. ": " .. message)
  print(message)
end
rednet.close("left")