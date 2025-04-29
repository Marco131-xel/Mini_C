// gramatica yaml

  /* SINTACTICO */
inicio = _ instrucciones:instrucciones EOF { return instrucciones }

instrucciones = _ lista:(instruccion _)* { return lista.map(e => e[0]) }
;

instruccion = llaves
            / listas
;

llaves = id:IDENTIFICADOR _ ":" _ valor:DATO { return { tipo: "llave", id, valor } }
;

listas = id:IDENTIFICADOR _ ":" _ p:parametros? { return { tipo: "lista", id, parametros: p ?? [] } }
;

parametros = first:parametro rest:(_ parametro)* { return [first, ...rest.map(r => r[1])] }
;

parametro = INDENT "-" _ id:IDENTIFICADOR _ ":" _ valor:DATO { return { id, valor } }
;

  /* LEXICO */
DATO = "\"" chars:([^"]*) "\"" { return chars.join(""); }

IDENTIFICADOR = [a-zA-Z][a-zA-Z0-9_.]* { return text(); }

EOF = !. { return "EOF"; }

_ = ( [ \t\r\n] / COMENTARIO )*

INDENT = [ \t]*

COMENTARIO = "#" [^\r\n]* ("\r"? "\n" / !.)