// gramatica.peggy
  /* SINTACTICO */
{
  const Tipo = require('../ast/Tipo.ts')
  const Nativo = require('../operadores/Nativo.ts')
  const Variable = require('../operadores/Variable.ts')
  const Aritmeticas = require('../operadores/Aritmeticas.ts')
  const Print = require('../sentencias/Print.ts')
}

inicio = instrs:instrucciones EOF { return instrs; }
;

instrucciones = inst:instruccion insts:(_ instruccion)* { return [inst, ...insts.map(t => t[1])]; }
;

instruccion = imprimir:print ";" { return imprimir; }
;

print = "print" "("expr:expresion")" { return new Print.default(expr, location().start.line, location().start.column); }
;

expresion = cadena:STRING { return new Nativo.default(new Tipo.default(Tipo.TipoDato.STRING), cadena, location().start.line, location().start.column); }
          / decimal:FLOAT { return new Nativo.default(new Tipo.default(Tipo.TipoDato.FLOAT), decimal, location().start.line, location().start.column); }
          / entero:INT { return new Nativo.default(new Tipo.default(Tipo.TipoDato.INT), entero, location().start.line, location().start.column); }
          / variable:IDENTIFICADOR { return new Variable.default(variable, location().start.line, location().start.column); }
          / "(" expr:expresion ")" { return expr; }
;

  /* LEXICO */
FLOAT = digits:[0-9]+ "." decimals:[0-9]+ { return parseFloat(digits.join("") + "." + decimals.join("")); }
;

INT = digits:[0-9]+ { return digits.join(""); }
;

STRING = "\"" chars:([^"]*) "\"" { return chars.join(""); }
;

IDENTIFICADOR = [a-zA-Z][a-zA-Z0-9_]* { return text(); }
;

EOF = !. { return "EOF"; }
;

// Espacios
_  = [ \t\r\n]*