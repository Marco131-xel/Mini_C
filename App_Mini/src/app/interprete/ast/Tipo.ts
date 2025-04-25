export default class Tipo {
    private Tipo: TipoDato

    constructor(Tipo: TipoDato) {
        this.Tipo = Tipo
    }

    public setTipo(Tipo: TipoDato) {
        this.Tipo = Tipo
    }

    public getTipo() {
        return this.Tipo
    }

    public toString(): string {
        switch (this.Tipo) {
            case TipoDato.INT: return 'int';
            case TipoDato.FLOAT: return 'float';
            case TipoDato.STRING: return 'string';
            case TipoDato.CHAR: return 'char';
            case TipoDato.BOOL: return 'bool';
            case TipoDato.VOID: return 'void';
            case TipoDato.STRUCT: return 'struct';
            default: return 'desconocido';
        }
    }
}

export enum TipoDato {
    INT,
    FLOAT,
    STRING,
    CHAR,
    BOOL,
    VOID,
    STRUCT
}