import { Component } from '@angular/core';
import { environment } from '../../environments/environment';
import { PostService } from "../services/post.service";
import * as mapboxgl from 'mapbox-gl';

@Component({
	selector: 'app-resultats',
	templateUrl: './resultats.component.html',
	styleUrls: ['./resultats.component.css']
})

export class ResultatsComponent {
	formData: any = {};
	responseVille: any;
	responseFestival: any;
	responseMeteo: any;
	saisieInvalide: boolean = false;
	lat: number = 46.62;
	lon: number = 2.38;
	map: any;

	constructor(private service: PostService) {
	}

	ngOnInit() {
		this.map = new mapboxgl.Map({
			accessToken: environment.mapbox.accessToken,
			container: 'map',
			style: 'mapbox://styles/mapbox/streets-v12',
			center: [this.lon, this.lat],
			zoom: 5
		});

		this.map.addControl(new mapboxgl.NavigationControl(), 'bottom-right');

		this.service.getFestival().subscribe(response => {
			this.responseFestival = response;
			const festivals = this.responseFestival.results;
			for (let festival of festivals) {
				this.creerMarker(this.map, festival);
			}
		});
	}

	submitForm(formData: any) {
		if (formData.search != null && formData.search !== "") {
			this.service.getVille(formData.search).subscribe(response => {
				try {
					this.responseVille = response;
					const coords = this.responseVille.features[0].center;
					this.updateMap(coords);
				} catch {
					this.saisieInvalide = true;
					setTimeout(() => {
						this.saisieInvalide = false;
					}, 750);
				}
			});
		}
	}

	updateMap(coords: any) {
		this.map.flyTo({
			center: coords,
			zoom: 11
		});
	}

	creerMarker(map: mapboxgl.Map, festival: any) {
		const coords = festival.geocodage_xy;
		const note = document.createElement('i');
		note.setAttribute('class', 'fas fa-music cursormap');
		let html = this.htmlbuilder(festival, this.descMeteo(coords));
		const marker = new mapboxgl.Marker(note).setLngLat(coords).addTo(map);
		marker.getElement().addEventListener("click", function () {
			new mapboxgl.Popup({ closeOnClick: false, closeOnMove: true })
				.setLngLat(coords)
				.setHTML(html)
				.addTo(map);
		});
	}

	htmlbuilder(festival: any, meteo: string): string {
		let html = "<div class='popup'><h1>" + festival.nom_du_festival + "</h1><h2>" + festival.discipline_dominante + "</h2>";
		if (festival.periode_principale_de_deroulement_du_festival !== null) {
			html += "<h3>" + festival.periode_principale_de_deroulement_du_festival + "</h3>";
		}
		if (festival.adresse_postale !== null) {
			html += "<p>" + festival.adresse_postale + "<br>" + festival.code_postal_de_la_commune_principale_de_deroulement +
				", " + festival.commune_principale_de_deroulement + "</p>";
		} else if (festival.complement_d_adresse_facultatif !== null) {
			html += "<p>" + festival.complement_d_adresse_facultatif + "<br>"
				+ festival.code_postal_de_la_commune_principale_de_deroulement + ", " + festival.commune_principale_de_deroulement + "</p>";
		} else {
			html += "<p>" + festival.code_postal_de_la_commune_principale_de_deroulement + ", " + festival.commune_principale_de_deroulement + "</p>";
		}
		html += "<p>" + meteo + "</p>";
		if (festival.site_internet_du_festival !== null) {
			let site = festival.site_internet_du_festival
			if (!/^https?:/.test(site) && !/^http?:/.test(site)) {
				site = "https://" + site;
			}
			html += "<a href='" + site + "' target='_blank'>Accéder au site du festival</a>";
		}
		html += "</div>"
		return html;
	}

	descMeteo(coords: any): string {
		this.service.getMeteo(coords).subscribe(response => {
			this.responseMeteo = response;
			const meteo = this.responseMeteo.data[0];
			return "<img src='https://cdn.weatherbit.io/static/img/icons/" + meteo.weather.icon + ".png'>" + meteo.temp + "°C" + meteo.weather.description;
		});
		return "Pas d'informations sur la météo";
	}
}
