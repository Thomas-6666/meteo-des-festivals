import {Component} from '@angular/core';
import {environment} from '../../environments/environment';
import {PostService} from "../services/post.service";
import * as mapboxgl from 'mapbox-gl';
import {Observable} from "rxjs";

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
    const marker = new mapboxgl.Marker(note).setLngLat(coords).addTo(map);
    marker.getElement().addEventListener("click", () => {
      const meteo = this.descMeteo(marker.getLngLat());
      meteo.subscribe(
        (meteoStr: string) => {
          const html = this.htmlbuilder(festival, meteoStr);
          new mapboxgl.Popup({closeOnClick: false, closeOnMove: true})
            .setLngLat(coords)
            .setHTML(html)
            .addTo(map);
        },
        (error) => {
          console.error('Erreur lors de la récupération de la météo :', error);
        }
      );
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
    try {
      const coords = festival.geocodage_xy;
      const itineraire = "https://www.google.com/maps/dir//" + coords.lat + ","
        + coords.lon + "/data=!3m1!4b1!4m5!4m4!1m1!4e1!1m0!3e3";
      html += "<div class='btn-popup'><a class='btn btn-secondaire' href=" + itineraire + " target='_blank'>"
        + "<i class='fa-solid fa-diamond-turn-right'></i> J'y vais</a></div>";
    } catch {

    }
    html += "</div>"
    return html;
  }

  descMeteo(coords: any): Observable<string> {
    return new Observable<string>((observer) => {
      this.service.getMeteo(coords).subscribe(
        (response) => {
          this.responseMeteo = response;
          let meteoStr = "<hr>"
          for (let meteo of this.responseMeteo.data) {
            let iconemeteo = "<i class='fas fa-cloud'></i>";
            switch (true) {
              case meteo.clouds > 75:
                iconemeteo = "<i class='fas fa-cloud-showers-heavy'></i>";
                break;
              case (meteo.clouds > 50 && meteo.clouds < 75):
                iconemeteo = "<i class='fas fa-clouds'></i>";
                break;
              case (meteo.clouds > 25 && meteo.clouds < 50):
                iconemeteo = "<i class='fas fa-cloud'></i>";
                break;
              case meteo.clouds < 25:
                iconemeteo = "<i class='fas fa-sun'></i>";
                break;
            }
            meteoStr += "<strong>" + iconemeteo + " Météo du " + meteo.datetime + "</strong>" +
              "<p>Temperature : " + meteo.temp + "°C</p>";
          }
          observer.next(meteoStr);
          observer.complete();
        },
        (error) => {
          console.error('Erreur lors de l\'appel à l\'API de la météo :', error);
          observer.error("Erreur lors de la récupération de la météo");
        }
      );
    });
  }

  showmeteo(id: number, sens: boolean) {
    let apres = id;
    if (sens) {
      apres = id + 1;
    } else {
      apres = id - 1;
    }
    const div1 = document.getElementById(String(apres)) as HTMLDivElement;
    div1.setAttribute('display', 'none');
    const div2 = document.getElementById(String(apres)) as HTMLDivElement;
    div2.setAttribute('display', 'block');
  }

  getLocation(): any {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        const latitude = position.coords.latitude;
        const longitude = position.coords.longitude;
        return [latitude, longitude];
      }, (error) => {
        console.error('Erreur de géolocalisation : ${error}');
        return null;
      });
    } else {
      console.error("La géolocalisation n'est pas prise en charge par ce navigateur.");
      return null;
    }
  }
}
