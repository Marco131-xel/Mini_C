// Gramatica.peggy
start
  = expression

expression
  = left:term _ "+" _ right:expression { return left + right; }
  / term

term
  = left:factor _ "*" _ right:term { return left * right; }
  / factor

factor
  = "(" _ expr:expression _ ")" { return expr; }
  / number

number
  = digits:[0-9]+ { return parseInt(digits.join("")); }

_ "whitespace"
  = [ \t\n\r]*
