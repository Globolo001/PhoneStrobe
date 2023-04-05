export class NormalizedTime {
    getNormalizedTime() {
        return Date.now() / 1000 + parseFloat(localStorage.getItem("timeOffset"));
      }

    setOffset(offset) {
        localStorage.setItem("timeOffset", offset.toString());
    }
}