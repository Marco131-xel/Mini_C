// gramatica.peggy
  /* SINTACTICO */
{
  const Tipo = require('../ast/Tipo.ts')
  const Nativo = require('../operadores/Nativo.ts')
  const Variable = require('../operadores/Variable.ts')
  const Aritmeticas = require('../operadores/Aritmeticas.ts')
  const Booleanas = require('../operadores/Booleanas.ts')
  const Relacionales = require('../operadores/Relacionales.ts')
  const Print = require('../sentencias/Print.ts')
  const Declaracion = require('../sentencias/Declaracion.ts')
  const Asignacion = require('../sentencias/Asignacion.ts')
}

inicio = instrs:instrucciones EOF { return instrs; }
;

instrucciones = inst:instruccion insts:(_ instruccion)* { return [inst, ...insts.map(t => t[1])]; }
;

instruccion = imprimir:print ";" { return imprimir; }
            / declarar:declaracion ";" { return declarar; }
            / asignar:asignacion ";" { return asignar; }
;

print = "print" "("expr:expresion")" { return new Print.default(expr, location().start.line, location().start.column); }
;

declaracion = tip:tipos _ id:IDENTIFICADOR _ "=" _ expr:expresion { return new Declaracion.default(tip, location().start.line, location().start.column, id, expr) }
;

asignacion = id:IDENTIFICADOR _ "=" _ expr:expresion { return new Asignacion.default(id, location().start.line, location().start.column, expr) }
;

/* PRODUCCION PARA EXPRESION */
expresion = or
;

or = izq:and _ "||" _ der:or { return new Booleanas.default(Booleanas.Operadores.OR, location().start.line, location().start.column, izq, der); }
   / and
;

and = izq:igualdad _ "&&" _ der:and { return new Booleanas.default(Booleanas.Operadores.AND, location().start.line, location().start.column, izq, der); }
    / igualdad
;

igualdad = izq:relacional _ operador:("==" / "!=") _ der:igualdad { return new Relacionales.default( operador === "==" ? Relacionales.Operadores.EQUALS : Relacionales.Operadores.NOTEQUALS, location().start.line, location().start.column, izq, der); }
         / relacional
;

relacional = izq:suma _ operador:("<=" / ">=" / "<" / ">") _ der:relacional {
              let tipo = {
                "<" : Relacionales.Operadores.MENORQUE,
                ">" : Relacionales.Operadores.MAYORQUE,
                "<=" : Relacionales.Operadores.MENORIGUAL,
                ">=" : Relacionales.Operadores.MAYORIGUAL
              }[operador];
              return new Relacionales.default(tipo, location().start.line, location().start.column, izq, der);
           }
           / suma
;

suma = izq:producto _ operador:("+" / "-") _ der:suma { return new Aritmeticas.default( operador === "+" ? Aritmeticas.Operadores.SUMA : Aritmeticas.Operadores.RESTA, location().start.line, location().start.column, izq, der); }
     / producto
;

producto = izq:negacion _ operador:("*" / "/") _ der:producto { return new Aritmeticas.default( operador === "*" ? Aritmeticas.Operadores.MULTIPLICACION : Aritmeticas.Operadores.DIVISION, location().start.line, location().start.column, izq, der); }
         / negacion
;

negacion = "-" _ uni:negacion { return new Aritmeticas.default(Aritmeticas.Operadores.NEGACION, location().start.line, location().start.column, uni); }
         / "!" _ uni:negacion { return new Booleanas.default(Booleanas.Operadores.NOT, location().start.line, location().start.column, uni); }
         / potencia
;

potencia = izq:termino _ "^" _ der:potencia { return new Aritmeticas.default(Aritmeticas.Operadores.POTENCIA, location().start.line, location().start.column, izq, der); }
         / termino
;

termino = cadena:STRING { return new Nativo.default(new Tipo.default(Tipo.TipoDato.STRING), cadena, location().start.line, location().start.column); }
        / char:CARACTER { return new Nativo.default(new Tipo.default(Tipo.TipoDato.CHAR), char, location().start.line, location().start.column); }
        / decimal:FLOAT { return new Nativo.default(new Tipo.default(Tipo.TipoDato.FLOAT), decimal, location().start.line, location().start.column); }
        / entero:INT { return new Nativo.default(new Tipo.default(Tipo.TipoDato.INT), entero, location().start.line, location().start.column); }
        / "true" { return new Nativo.default(new Tipo.default(Tipo.TipoDato.BOOL), true, location().start.line, location().start.column); }
        / "false" { return new Nativo.default(new Tipo.default(Tipo.TipoDato.BOOL), false, location().start.line, location().start.column); }
        / variable:IDENTIFICADOR { return new Variable.default(variable, location().start.line, location().start.column); }
        / "(" expr:expresion ")" { return expr; }
;

tipos = "int" { return new Tipo.default(Tipo.TipoDato.INT) }
      / "float" { return new Tipo.default(Tipo.TipoDato.FLOAT) }
      / "string" { return new Tipo.default(Tipo.TipoDato.STRING) }
      / "char" { return new Tipo.default(Tipo.TipoDato.CHAR) }
      / "bool" { return new Tipo.default(Tipo.TipoDato.BOOL) }
      / "void" { return new Tipo.default(Tipo.TipoDato.VOID) }
      / "struct" { return new Tipo.default(Tipo.TipoDato.STRUCT) }
;
  /* LEXICO */
FLOAT = digits:[0-9]+ "." decimals:[0-9]+ { return parseFloat(digits.join("") + "." + decimals.join("")); }
;

INT = digits:[0-9]+ { return digits.join(""); }
;

STRING = "\"" chars:([^"]*) "\"" { return chars.join(""); }
;

CARACTER = "'" chars:([^']*) "'" { return chars.join(""); }
;

IDENTIFICADOR = [a-zA-Z][a-zA-Z0-9_]* { return text(); }
;

EOF = !. { return "EOF"; }
;

// Espacios
_  = [ \t\r\n]*