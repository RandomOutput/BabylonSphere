export default class Layer {
  url : string;
  file : File;
  distance: number;
  constructor(url : string, file: File, distance: number) {
    this.url = url;
    this.file = file;
    this.distance = distance;
  }
}
