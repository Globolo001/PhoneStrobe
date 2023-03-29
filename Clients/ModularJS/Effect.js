class Effect {
    constructor(func = () => {console.log("Effect not implemented");}) {
        this.execute = func;
    }
}