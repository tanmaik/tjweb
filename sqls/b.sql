DROP PROCEDURE IF EXISTS less_simple_proc; 

DELIMITER $$ 

CREATE PROCEDURE less_simple_proc(IN usr_state CHAR(20))
BEGIN

SELECT s_name FROM students WHERE home=usr_state;

END$$ 

DELIMITER ; 