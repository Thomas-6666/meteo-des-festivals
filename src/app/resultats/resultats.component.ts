import {Component} from '@angular/core';
import {environment} from '../../environments/environment';
import {PostService} from "../services/post.service";
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
          alert('ville non reconnue');
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
    const marker = new mapboxgl.Marker(note).setLngLat(coords).addTo(map);
    marker.getElement().addEventListener("click", function () {
      new mapboxgl.Popup({closeOnClick: false, closeOnMove: true})
        .setLngLat(coords)
        .setHTML(
          "<h1>" + festival.nom_du_festival + "</h1><h3>" +
          festival.adressepostale + "<br>" +
          festival.commune_principale_de_deroulement + " "
          + festival.code_postal_de_la_commune_principale_de_deroulement + "</h3>"
        )
        .addTo(map);
    });
  }
}
