export default class Layer {
  url : string;
  file : File;
  distance: Number;
  constructor(url : string, file: File, distance: Number) {
    this.url = url;
    this.file = file;
    this.distance = distance;
  }
}
