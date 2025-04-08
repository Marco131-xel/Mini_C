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