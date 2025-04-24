// gramatica.peggy
  /* SINTACTICO */
{
  const Tipo = require('../ast/Tipo.ts')
  const Nativo = require('../operadores/Nativo.ts')
  const Variable = require('../operadores/Variable.ts')
  const Aritmeticas = require('../operadores/Aritmeticas.ts')
  const Booleanas = require('../operadores/Booleanas.ts')
  const Relacionales = require('../operadores/Relacionales.ts')
  const { default: Structs, instaStruct, acceStruct, AsigStruct } = require('../operadores/Structs.js')
  const Print = require('../sentencias/Print.ts')
  const Declaracion = require('../sentencias/Declaracion.ts')
  const Asignacion = require('../sentencias/Asignacion.ts')
  const Incremento = require('../sentencias/Incremento.ts')
  const Decremento = require('../sentencias/Decremento.ts')
  const Break = require('../sentencias/Break.ts')
  const Return = require('../sentencias/Return.ts')
  const If = require('../sentencias/If.ts')
  const For = require('../sentencias/For.ts')
}

inicio = instrs:instrucciones EOF { return instrs; }
;

instrucciones = inst:instruccion insts:(_ instruccion)* { return [inst, ...insts.map(t => t[1])]; }
;

instruccion = imprimir:print ";" { return imprimir; }
            / declarar:declaracion ";" { return declarar; }
            / asignar:asignacion { return asignar; }
            / retu:return ";" { return retu; }
            / bre:break ";" { return bre; }
            / si:sif { return si; }
            / cf:cfor { return cf; }
            / sd:structDef { return sd; }
            / si:structInst { return si; }
            / as:accesoStruct { return as; }
            / ss:asigStruct {return ss; }
;

print = "print" "("expr:expresion")" { return new Print.default(expr, location().start.line, location().start.column); }
;

declaracion = tip:tipos _ id:IDENTIFICADOR _ "=" _ expr:expresion { return new Declaracion.default(tip, location().start.line, location().start.column, id, expr) }
;

asignacion = id:IDENTIFICADOR _ "=" _ expr:expresion _ ";" { return new Asignacion.default(id, location().start.line, location().start.column, expr) }
           / id:IDENTIFICADOR _ "++" { return new Incremento.default(id, location().start.line, location().start.column) } 
           / id:IDENTIFICADOR _ "--" { return new Decremento.default(id, location().start.line, location().start.column) }
;

return = "return" _ expr:expresion { return new Return.default(expr, location().start.line, location().start.column) }
;

break = "break" _ { return new Break.default(location().start.line, location().start.column) }
;

sif = "if" _ "(" _ expr:expresion _ ")" _ "{" _ inst:instrucciones _ "}" _ "else" _ "{" _ insts:instrucciones _ "}" { return new If.default(expr, inst, null, insts, location().start.line, location().start.column) }
    / "if" _ "(" _ expr:expresion _ ")" _ "{" _ inst:instrucciones _ "}" _ "else" _ si:sif { return new If.default(expr, inst, si, null, location().start.line, location().start.column) }
    / "if" _ "(" _ expr:expresion _ ")" _ "{" _ inst:instrucciones _ "}" { return new If.default(expr, inst, null, null, location().start.line, location().start.column) }
;

cfor = "for" _ "(" _ dec:declaracion _ ";" _ exp:expresion _ ";" _ asg:asignacion _ ")" _ "{" _ inst:instrucciones _ "}" { return new For.default(dec, exp, asg, inst, location().start.line, location().start.column) }
;

structDef = "struct" _ id:IDENTIFICADOR _ "{" _ atr:atributos+ _ "}" { return new Structs(id, atr, location().start.line, location().start.column) }
;

atributos = tip:tipos _ id:IDENTIFICADOR _ ";" _ { return { tipo: tip, id: id }; }
;

structInst = "struct" _ tip:IDENTIFICADOR _ id:IDENTIFICADOR _ init:structInit? _ ";" { return new instaStruct(tip, id, init, location().start.line, location().start.column) }
;

structInit = _ "=" _ "{" _ valor:lista _ "}" { return valor; }
;

lista = exp:expresion resto:(_ "," _ expresion)* { return [exp].concat((resto || []).map(e => e[3])); }
;

accesoStruct = id:IDENTIFICADOR _ "." _ atributo:IDENTIFICADOR _ ";" { return new acceStruct(id, atributo, location().start.line, location().start.column) }
;

asigStruct = id:IDENTIFICADOR _ "." _ atributo:IDENTIFICADOR _ "=" _ expr:expresion _ ";" { return new AsigStruct(id, atributo, expr, location().start.line, location().start.column) }
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