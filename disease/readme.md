Features:
1. Login to any room.
2. First to enter gets room get teacher interface.
3. Teacher display shows student's turtles.
4. When students move arrow keys, their turtle moves around.
5. Students see reporters such as position, shape, color and state of infection.
6. When a teacher logs out, students leave room and return to login state.
7. When a student logs out, the teacher removes student's turtle
8. Students see reporters such as position, shape, color and state of infection. 

Issues:
1. Replace NetLogo commands with Javascript:
a.    var command = "setup";
b.    var command = "create-students 1 [" + 
      ' set socketid "' + data.socketId + 
      '" setup-student-vars ]';
c.    command = 'ask students with [socketid = "' + turtleSocketId + '" ] [die]'
d.    command = 'ask students with [socketid = "' + turtleSocketId + '" ]' + 
      ' [' +
        ' set used-shape-colors remove my-code used-shape-colors ' +
        ' set-unique-shape-and-color ' +
        ' if infected ' +
        ' [ set-sick-shape ] ' +
      ']'; 
2. Make sure all colors work.
3. Make sure changing step-size works.
4. Should the "You are a:" reporter say "green key sick" or "green key" when sick?
5. Is there a difference between a "listen" button and a "go" button?