import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';

@Injectable({
	providedIn: 'root'
})

export class PostService {
	private mapboxtoken: string = 'pk.eyJ1IjoidGhvbWFzc3Nzc3MiLCJhIjoiY2xtcnQyOWZyMDM3dzJpcGxoY2s0MzRkZCJ9.TbiR5nusLJnNR5z4U8XQCQ';
	private weatherbittoken: string = '74dde4db1fc848889a73b521b5827904';

	constructor(private httpClient: HttpClient) {
	}

	getVille(ville: string) {
		const url = 'https://api.mapbox.com/geocoding/v5/mapbox.places/' + ville + '.json?access_token=' + this.mapboxtoken;
		return this.httpClient.get(url).pipe(
			catchError(error => {
				console.error('Erreur lors de l\'appel à l\'API de Mapbox :', error);
				return throwError(error);
			})
		);;
	}

	getFestival() {
		const url = 'https://data.culture.gouv.fr/api/explore/v2.1/catalog/datasets/festivals-global-festivals-_-pl/records?limit=100';
		return this.httpClient.get(url).pipe(
			catchError(error => {
				console.error('Erreur lors de l\'appel à l\'API des festivals :', error);
				return throwError(error);
			})
		);
	}

	getMeteo(coords: any){
		const url = 'http://api.weatherbit.io/v2.0/current?key=' + this.weatherbittoken + '&lang=fr&lon=' + coords[0] + '&lat=' + coords[1];
		return this.httpClient.get(url).pipe(
			catchError(error => {
				console.error('Erreur lors de l\'appel à l\'API de la météo :', error);
				return throwError(error);
			})
		);
	}
}
