import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})

export class PostService {
  private mapboxtoken: string = 'pk.eyJ1IjoidGhvbWFzc3Nzc3MiLCJhIjoiY2xtcnQyOWZyMDM3dzJpcGxoY2s0MzRkZCJ9.TbiR5nusLJnNR5z4U8XQCQ';
  private urlMapBox = 'https://api.mapbox.com/geocoding/v5/mapbox.places/';

  constructor(private httpClient: HttpClient) {
  }

  getVille(ville: string) {
    const url = this.urlMapBox + ville + '.json?access_token=' + this.mapboxtoken;
    return this.httpClient.get(url);
  }

  getFestival(){
    const url = 'https://data.culture.gouv.fr/api/explore/v2.1/catalog/datasets/festivals-global-festivals-_-pl/records?limit=100';
    return this.httpClient.get(url);
  }
}
