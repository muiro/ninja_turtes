local length = 5
local width = 3
local height = 3
shell.run("bore", length, width, height)
for i=2,16 do
  turtle.select(i)
  turtle.drop()
end
turtle.turnLeft()
turtle.turnLeft()
turtle.select(1)
for i=1,length do
  while turtle.detect() == true do
    turtle.dig()
  end
  if i % 10 == 0 then
    turtle.turnRight()
    turtle.place()
    turtle.turnLeft()
  end
  turtle.forward()
end
turtle.turnLeft()
turtle.turnLeft()
for i=1,length do
  while turtle.detect() == true do
    turtle.dig()
  end
  turtle.forward()
end
rednet.open("right")
rednet.broadcast(os.computerLabel()..": finished!")
rednet.close("right")